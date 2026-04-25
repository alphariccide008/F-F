import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useWalletStore } from "../../stores/walletStore";
import type { Transaction } from "../../types/api";

const formatNaira = (n: number) =>
  "₦ " + n.toLocaleString("en-NG", { maximumFractionDigits: 2 });

const formatDate = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
};

type TabType = "all" | "top_up" | "debit" | "refund";

export default function WalletScreen() {
  const router = useRouter();
  const { balance, transactions, isLoading, fetchBalance, fetchTransactions } = useWalletStore();

  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await Promise.all([fetchBalance(), fetchTransactions()]);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    }
  };

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredTransactions =
    selectedTab === "all"
      ? transactions
      : transactions.filter((t) => t.type === selectedTab);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white">
        <Text className="text-[20px] font-bold text-[#111827]">Wallet</Text>
        <Text className="text-[12px] text-[#6B7280] mt-1">
          Manage your balance and transactions
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A8F83" />
        }
      >
        {/* Balance Card */}
        <View className="mx-6 mb-3">
          <LinearGradient
            colors={["#0A8F83", "#065F5A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24 }}
          >
            <Text className="text-[12px] text-white/80 mb-1">Available Balance</Text>
            <Text className="text-[32px] font-bold text-white mb-6">
              {formatNaira(balance)}
            </Text>

            <Pressable
              onPress={() => router.push("/(modals)/top-up-wallet")}
              style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-[14px] ml-2">Top Up Wallet</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Transaction Tabs */}
        <View className="px-6 mb-4">
          <Text className="text-[16px] font-semibold text-[#111827] mb-3">
            Transaction History
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <TabButton
              label="All"
              active={selectedTab === "all"}
              onPress={() => setSelectedTab("all")}
            />
            <TabButton
              label="Top-ups"
              active={selectedTab === "top_up"}
              onPress={() => setSelectedTab("top_up")}
            />
            <TabButton
              label="Orders"
              active={selectedTab === "debit"}
              onPress={() => setSelectedTab("debit")}
            />
            <TabButton
              label="Refunds"
              active={selectedTab === "refund"}
              onPress={() => setSelectedTab("refund")}
            />
          </ScrollView>
        </View>

        {/* Transactions List */}
        <View className="px-6">
          {isLoading && !refreshing ? (
            <View className="py-12 items-center">
              <ActivityIndicator color="#0A8F83" size="large" />
              <Text className="text-[12px] text-[#6B7280] mt-3">Loading transactions...</Text>
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View className="py-12 items-center">
              <View className="w-16 h-16 rounded-full bg-[#F3F4F6] items-center justify-center mb-4">
                <Ionicons name="receipt-outline" size={32} color="#6B7280" />
              </View>
              <Text className="text-[16px] font-semibold text-[#111827] mb-2">
                No Transactions Yet
              </Text>
              <Text className="text-[12px] text-[#6B7280] text-center px-8">
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "px-4 py-2 rounded-xl",
        active ? "bg-[#0A8F83]" : "bg-[#F3F4F6]",
      ].join(" ")}
    >
      <Text
        className={[
          "text-[13px] font-semibold",
          active ? "text-white" : "text-[#6B7280]",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.type === "top_up" || transaction.type === "refund";
  const isDebit = transaction.type === "debit";

  const getIcon = () => {
    switch (transaction.type) {
      case "top_up":
        return "arrow-down-circle";
      case "debit":
        return "arrow-up-circle";
      case "refund":
        return "return-up-back";
      default:
        return "swap-horizontal";
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "failed":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  return (
    <View className="mb-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View
            className={[
              "w-10 h-10 rounded-xl items-center justify-center",
              isCredit ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]",
            ].join(" ")}
          >
            <Ionicons
              name={getIcon() as any}
              size={18}
              color={isCredit ? "#10B981" : "#DC2626"}
            />
          </View>

          <View className="flex-1">
            <Text className="text-[13px] font-semibold text-[#111827]">
              {transaction.description || transaction.type.replace("_", " ").toUpperCase()}
            </Text>
            <Text className="text-[11px] text-[#6B7280] mt-0.5">
              {formatDate(transaction.createdAt)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className={[
              "text-[14px] font-bold",
              isCredit ? "text-[#10B981]" : "text-[#DC2626]",
            ].join(" ")}
          >
            {isCredit ? "+" : "-"}
            {formatNaira(Number(transaction.amount))}
          </Text>
          <View
            className="mt-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${getStatusColor()}15` }}
          >
            <Text className="text-[9px] font-semibold" style={{ color: getStatusColor() }}>
              {transaction.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
