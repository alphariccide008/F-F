// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { useWalletStore } from "../../stores/walletStore";
import { useOrderStore } from "../../stores/orderStore";
import { useNotificationStore } from "../../stores/notificationStore";

const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 2 });

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getStatusColor = (status: string) => {
  const colors: any = {
    pending: "bg-yellow-100 text-yellow-700",
    rider_assigned: "bg-blue-100 text-blue-700",
    en_route: "bg-purple-100 text-purple-700",
    arrived: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};

const getStatusLabel = (status: string) => {
  const labels: any = {
    pending: "Pending",
    rider_assigned: "Rider Assigned",
    en_route: "On the Way",
    arrived: "Arrived",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { balance, fetchBalance } = useWalletStore();
  const { orders, activeOrder, isLoading, fetchOrders, fetchActiveOrder } = useOrderStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchBalance(),
        fetchOrders(),
        fetchActiveOrder(),
        fetchNotifications(),
      ]);
    } catch (error) {
      console.error("Failed to load home data:", error);
    }
  };

  const firstName = user?.fullName?.split(" ")[0] || "User";
  const recentOrders = orders.slice(0, 3); // Show last 3 orders

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F6F9FB]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ======= TOP GREEN SECTION ======= */}
        <View className="bg-[#0A8F83] px-5 pt-10 pb-10 rounded-b-[24px]">
          {/* Top row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white/0 text-[12px]">.</Text>

            {/* Notification Bell with Badge */}
            <Pressable
              onPress={() => router.push("/(modals)/notifications")}
              className="w-9 h-9 items-center justify-center"
            >
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View className="absolute top-0.5 right-0.5 bg-red-500 rounded-full min-w-[14px] h-3.5 items-center justify-center px-1">
                  <Text className="text-white text-[9px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <Text className="text-white/85 text-[11px] mt-2">Welcome back</Text>

          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text className="text-white text-[16px] font-semibold">{firstName}!</Text>
            <Text className="text-[14px]">👋</Text>
          </View>

          {/* Wallet card */}
          <View className="mt-3 rounded-2xl bg-white/12 px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-white/15 items-center justify-center">
                <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
              </View>

              <View>
                <Text className="text-white/75 text-[10px]">Wallet Balance</Text>
                <Text className="text-white text-[14px] font-semibold mt-0.5">
                  {formatNaira(balance)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/(modals)/top-up-wallet")}
              className="bg-[#C4FF4B] px-3 py-1.5 rounded-xl flex-row items-center gap-1"
            >
              <Ionicons name="add" size={14} color="#0A8F83" />
              <Text className="text-[#0A8F83] font-semibold text-[11px]">Top up</Text>
            </Pressable>
          </View>
        </View>

        {/* ✅ FLOATING CARD - Order Fuel */}
        <View className="px-5 -mt-6">
          <Pressable
            onPress={() => router.push("/(Tabs)/orderFuel")}
            className="bg-white rounded-2xl px-4 py-3.5 flex-row items-center justify-between border border-[#EEF2F7] shadow-sm"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-[#E7F6F4] items-center justify-center">
                <MaterialCommunityIcons name="fuel" size={20} color="#0A8F83" />
              </View>

              <View>
                <Text className="text-[13px] font-semibold text-[#111827]">
                  Order Fuel Now
                </Text>
                <Text className="text-[11px] text-[#6B7280] mt-0.5 leading-4">
                  Get fuel delivered to your location
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="px-5 mt-4">
          <View className="bg-white rounded-xl px-4 py-2.5 flex-row items-center border border-[#EEF2F7]">
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search for fuel stations"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-[14px] text-[#111827]"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Active Order */}
        {activeOrder && (
          <View className="px-5 mt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[13px] font-semibold text-[#111827]">Active Order</Text>
              <View className="flex-row items-center gap-3">
                {activeOrder.rider && (
                  <Pressable onPress={() => Alert.alert(
                    'Rider Information',
                    `Name: ${activeOrder.rider?.fullName}\nPhone: ${activeOrder.rider?.phoneNumber}`,
                    [
                      { text: 'Call Rider', onPress: () => Linking.openURL(`tel:${activeOrder.rider?.phoneNumber}`) },
                      { text: 'Close', style: 'cancel' },
                    ]
                  )}>
                    <Text className="text-[11px] font-semibold text-[#6B7280]">Rider Info</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => router.push(`/(modals)/order-tracking?id=${activeOrder.id}`)}>
                  <Text className="text-[11px] font-semibold text-[#0A8F83]">Track Order</Text>
                </Pressable>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-[#EEF2F7]">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-9 h-9 rounded-xl bg-[#F3F4F6] items-center justify-center">
                    <MaterialCommunityIcons name="fuel" size={18} color="#6B7280" />
                  </View>

                  <View>
                    <Text className="text-[13px] font-semibold text-[#111827]">
                      {activeOrder.fuelQuantity} Liters
                    </Text>
                    <Text className="text-[11px] text-[#6B7280] mt-0.5">
                      Order #{activeOrder.orderNumber}
                    </Text>
                  </View>
                </View>

                <View className={`px-3 py-1 rounded-full ${getStatusColor(activeOrder.status)}`}>
                  <Text className="text-[10px] font-semibold">
                    {getStatusLabel(activeOrder.status)}
                  </Text>
                </View>
              </View>

              <View className="border-t border-[#EEF2F7] pt-3">
                <Text className="text-[12px] text-[#6B7280]">Delivery Address</Text>
                <Text className="text-[13px] text-[#111827] mt-1" numberOfLines={2}>
                  {activeOrder.deliveryAddress?.addressLine || "Address not available"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Orders */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] font-semibold text-[#111827]">Recent Orders</Text>
            <Pressable onPress={() => router.push("/(profile)/order-history")}>
              <Text className="text-[11px] font-semibold text-[#0A8F83]">View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#0A8F83" />
            </View>
          ) : recentOrders.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 mt-3 border border-[#EEF2F7] items-center">
              <View className="w-12 h-12 rounded-full bg-[#F3F4F6] items-center justify-center mb-3">
                <MaterialCommunityIcons name="receipt-text-outline" size={24} color="#9CA3AF" />
              </View>
              <Text className="text-[13px] text-[#6B7280]">No recent orders</Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/(modals)/order-tracking?id=${order.id}` as any)}
                className="bg-white rounded-2xl p-4 mt-3 border border-[#EEF2F7] active:opacity-75"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="fuel" size={18} color="#6B7280" />
                    <Text className="text-[13px] font-semibold text-[#111827]">
                      {order.fuelQuantity} Liters
                    </Text>
                  </View>
                  <Text className="text-[11px] text-[#6B7280]">{formatDate(order.createdAt)}</Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-semibold text-[#111827]">
                    {formatNaira(Number(order.totalAmount))}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      <Text className="text-[10px] font-semibold">{getStatusLabel(order.status)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
