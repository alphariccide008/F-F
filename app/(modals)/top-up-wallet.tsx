import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWalletStore } from "../../stores/walletStore";

const formatNaira = (n: number) =>
  "₦ " + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

const quickAmounts = [1000, 2500, 5000, 10000];

type PaymentMethod = "card" | "bank_transfer" | "ussd";

export default function TopUpWalletScreen() {
  const router = useRouter();
  const { initializeTopUp } = useWalletStore();

  const [amount, setAmount] = useState("");
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const amountEmpty = submitted && numericAmount === 0;
  const amountTooLow = submitted && numericAmount > 0 && numericAmount < 100;
  const canContinue = numericAmount >= 100;

  const handleQuickAmount = (amt: number) => {
    setAmount(amt.toString());
    setSelectedQuick(amt);
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers
    const cleaned = text.replace(/[^0-9]/g, "");
    setAmount(cleaned);
    setSelectedQuick(null);
  };

  const handleTopUp = async () => {
    setSubmitted(true);

    if (!canContinue) return;

    try {
      setIsProcessing(true);

      const result = await initializeTopUp(numericAmount, paymentMethod);

      // Open Paystack payment URL
      const canOpen = await Linking.canOpenURL(result.paymentUrl);
      if (canOpen) {
        await Linking.openURL(result.paymentUrl);

        // Show info modal
        Alert.alert(
          "Payment Initiated",
          "Complete your payment in the browser. Your wallet will be updated automatically once payment is confirmed.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error("Cannot open payment URL");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to initialize payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 -ml-2 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-semibold text-[#111827]">Top Up Wallet</Text>

          <View className="w-10 h-10" />f
        </View>
      </View>

      <View className="flex-1 px-6 pt-6">
        {/* Amount Section */}
        <View className="mb-6">
          <Text className="text-[13px] font-semibold text-[#111827] mb-3">
            Enter Amount
          </Text>

          {/* Amount Input */}
          <View
            className={[
              "rounded-2xl border-2 p-4 bg-white",
              amountEmpty || amountTooLow
                ? "border-[#DC2626]"
                : numericAmount > 0
                ? "border-[#0A8F83]"
                : "border-[#E5E7EB]",
            ].join(" ")}
          >
            <Text className="text-[12px] text-[#6B7280] mb-1">Amount (NGN)</Text>
            <View className="flex-row items-center">
              <Text className="text-[24px] font-bold text-[#111827] mr-2">₦</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                keyboardType="number-pad"
                className="flex-1 text-[24px] font-bold text-[#111827]"
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>

          {amountEmpty && (
            <Text className="text-[11px] text-[#DC2626] mt-2">Please enter an amount</Text>
          )}
          {amountTooLow && (
            <Text className="text-[11px] text-[#DC2626] mt-2">
              Minimum top-up amount is ₦100
            </Text>
          )}

          {/* Quick Amounts */}
          <View className="mt-4">
            <Text className="text-[12px] font-semibold text-[#6B7280] mb-2">
              Quick Select
            </Text>
            <View className="flex-row gap-2">
              {quickAmounts.map((amt) => (
                <Pressable
                  key={amt}
                  onPress={() => handleQuickAmount(amt)}
                  className={[
                    "flex-1 py-3 rounded-xl border",
                    selectedQuick === amt
                      ? "border-[#0A8F83] bg-[#E7F6F4]"
                      : "border-[#E5E7EB] bg-white",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "text-[12px] font-semibold text-center",
                      selectedQuick === amt ? "text-[#0A8F83]" : "text-[#6B7280]",
                    ].join(" ")}
                  >
                    {formatNaira(amt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text className="text-[13px] font-semibold text-[#111827] mb-3">
            Payment Method
          </Text>

          <PaymentMethodCard
            active={paymentMethod === "card"}
            title="Card Payment"
            subtitle="Debit/Credit Card"
            icon="card-outline"
            onPress={() => setPaymentMethod("card")}
          />

          <View className="h-2" />

          <PaymentMethodCard
            active={paymentMethod === "bank_transfer"}
            title="Bank Transfer"
            subtitle="Transfer to account"
            icon="business-outline"
            onPress={() => setPaymentMethod("bank_transfer")}
          />

          <View className="h-2" />

          <PaymentMethodCard
            active={paymentMethod === "ussd"}
            title="USSD"
            subtitle="Dial code to pay"
            icon="keypad-outline"
            onPress={() => setPaymentMethod("ussd")}
          />
        </View>

        {/* Info Box */}
        <View className="flex-row items-start gap-2 p-3 bg-[#F9FAFB] rounded-xl mb-4">
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#0A8F83"
            style={{ marginTop: 1 }}
          />
          <Text className="flex-1 text-[11px] text-[#6B7280]">
            Payments are processed securely by Paystack. Your card details are never stored
            on our servers.
          </Text>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-4 bg-white border-t border-[#E5E7EB]">
        <Pressable
          onPress={handleTopUp}
          disabled={isProcessing || !canContinue}
          className={[
            "h-12 rounded-xl items-center justify-center",
            canContinue && !isProcessing ? "bg-[#0A8F83]" : "bg-[#0A8F83]/35",
          ].join(" ")}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-[14px]">
              {numericAmount > 0 ? `Top Up ${formatNaira(numericAmount)}` : "Enter Amount"}
            </Text>
          )}
        </Pressable>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PaymentMethodCard({
  active,
  title,
  subtitle,
  icon,
  onPress,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "rounded-2xl border p-4",
        active ? "border-[#0A8F83] bg-[#E7F6F4]" : "border-[#E5E7EB] bg-white",
      ].join(" ")}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View
            className={[
              "w-10 h-10 rounded-xl items-center justify-center",
              active ? "bg-[#0A8F83]" : "bg-[#F3F4F6]",
            ].join(" ")}
          >
            <Ionicons name={icon} size={18} color={active ? "#FFFFFF" : "#6B7280"} />
          </View>

          <View className="flex-1">
            <Text className="text-[13px] font-semibold text-[#111827]">{title}</Text>
            <Text className="text-[11px] text-[#6B7280] mt-0.5">{subtitle}</Text>
          </View>
        </View>

        <Ionicons
          name={active ? "checkmark-circle" : "radio-button-off"}
          size={20}
          color={active ? "#0A8F83" : "#CBD5E1"}
        />
      </View>
    </Pressable>
  );
}
