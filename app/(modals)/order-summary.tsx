import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderStore } from "../../stores/orderStore";
import { useWalletStore } from "../../stores/walletStore";
import { useAddressStore } from "../../stores/addressStore";
import SuccessModal from "../../components/SuccessModal";

const formatNaira = (n: number) =>
  "₦ " + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export default function OrderSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse params from Step 1
  const fuelQuantity = parseInt(params.quantity as string) || 5;
  const deliveryMode = (params.deliveryMode as "standard" | "priority") || "standard";

  const PRICE_PER_LITER = 650;
  const subtotal = fuelQuantity * PRICE_PER_LITER;
  const deliveryFee = deliveryMode === "standard" ? 500 : 1000;
  const totalAmount = subtotal + deliveryFee;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { createOrder } = useOrderStore();
  const { balance, fetchBalance } = useWalletStore();
  const { defaultAddress, fetchAddresses } = useAddressStore();

  // Fetch data on mount
  useEffect(() => {
    fetchBalance();
    fetchAddresses();
  }, []);

  const hasInsufficientBalance = balance < totalAmount;

  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (hasInsufficientBalance) {
      Alert.alert(
        "Insufficient Balance",
        `Your wallet balance is ${formatNaira(balance)}. Please top up to complete this order.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Top Up Wallet",
            onPress: () => router.push("/(tabs)/wallet"),
          },
        ]
      );
      return;
    }

    try {
      setIsPlacingOrder(true);

      await createOrder({
        fuelQuantity,
        deliveryAddressId: defaultAddress.id,
        deliveryMode,
        paymentMethod: "wallet",
      });

      setOrderSuccess(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 -ml-2 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>

          <View className="items-center">
            <Text className="text-[14px] font-semibold text-[#111827]">
              Order Summary
            </Text>
            <Text className="text-[11px] text-[#6B7280] mt-0.5">Step 2 of 2</Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        {/* Progress line - Full */}
        <View className="mt-3 h-[3px] w-full bg-[#0A8F83] rounded-full" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Order Details Card */}
          <View className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <Text className="text-[13px] font-semibold text-[#111827] mb-3">
              Order Details
            </Text>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="water-outline" size={16} color="#6B7280" />
                <Text className="text-[12px] text-[#6B7280]">Fuel Quantity</Text>
              </View>
              <Text className="text-[12px] font-semibold text-[#111827]">
                {fuelQuantity} Litres
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={deliveryMode === "standard" ? "time-outline" : "flash-outline"}
                  size={16}
                  color="#6B7280"
                />
                <Text className="text-[12px] text-[#6B7280]">Delivery Mode</Text>
              </View>
              <Text className="text-[12px] font-semibold text-[#111827]">
                {deliveryMode === "standard" ? "Standard" : "Priority"} Delivery
              </Text>
            </View>
          </View>

          {/* Delivery Address Card */}
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[13px] font-semibold text-[#111827]">
                Delivery Address
              </Text>
              <Pressable onPress={() => router.push("/(modals)/select-address")}>
                <Text className="text-[12px] font-semibold text-[#0A8F83]">Change</Text>
              </Pressable>
            </View>

            {defaultAddress ? (
              <View className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-[#E7F6F4] items-center justify-center">
                    <Ionicons name="location-outline" size={18} color="#0A8F83" />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[12px] font-semibold text-[#111827]">
                        {defaultAddress.label}
                      </Text>
                      {defaultAddress.isDefault && (
                        <View className="px-2 py-0.5 rounded-full bg-[#E7F6F4]">
                          <Text className="text-[9.5px] font-semibold text-[#0A8F83]">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[10.5px] text-[#6B7280] mt-1">
                      {defaultAddress.addressLine}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push("/(modals)/add-address")}
                className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-4 items-center"
              >
                <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                <Text className="text-[12px] font-semibold text-[#111827] mt-2">
                  Add Delivery Address
                </Text>
              </Pressable>
            )}
          </View>

          {/* Payment Summary Card */}
          <View className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <Text className="text-[13px] font-semibold text-[#111827] mb-3">
              Payment Summary
            </Text>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-[12px] text-[#6B7280]">Subtotal</Text>
              <Text className="text-[12px] text-[#111827]">{formatNaira(subtotal)}</Text>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-[12px] text-[#6B7280]">Delivery Fee</Text>
              <Text className="text-[12px] text-[#111827]">{formatNaira(deliveryFee)}</Text>
            </View>

            <View className="h-px bg-[#E5E7EB] my-2" />

            <View className="flex-row items-center justify-between py-1">
              <Text className="text-[14px] font-semibold text-[#111827]">Total</Text>
              <Text className="text-[16px] font-bold text-[#0A8F83]">
                {formatNaira(totalAmount)}
              </Text>
            </View>
          </View>

          {/* Wallet Balance Info */}
          <View className="mt-4 rounded-2xl bg-[#F9FAFB] p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="wallet-outline" size={18} color="#6B7280" />
                <Text className="text-[12px] text-[#6B7280]">Wallet Balance</Text>
              </View>
              <Text
                className={[
                  "text-[13px] font-semibold",
                  hasInsufficientBalance ? "text-[#DC2626]" : "text-[#111827]",
                ].join(" ")}
              >
                {formatNaira(balance)}
              </Text>
            </View>

            {hasInsufficientBalance && (
              <View className="mt-2 flex-row items-start gap-2">
                <Ionicons name="alert-circle" size={14} color="#DC2626" style={{ marginTop: 1 }} />
                <Text className="flex-1 text-[11px] text-[#DC2626]">
                  Insufficient balance. Please top up your wallet to place this order.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <SuccessModal
        visible={orderSuccess}
        message="Your order has been placed successfully!"
        onClose={() => {
          setOrderSuccess(false);
          router.replace('/(profile)/order-history');
        }}
      />

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-4 bg-white border-t border-[#E5E7EB]">
        <Pressable
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || !defaultAddress || hasInsufficientBalance}
          className={[
            "h-12 rounded-xl items-center justify-center flex-row",
            isPlacingOrder || !defaultAddress || hasInsufficientBalance
              ? "bg-[#0A8F83]/35"
              : "bg-[#0A8F83]",
          ].join(" ")}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold text-[14px] ml-2">
                Place Order · {formatNaira(totalAmount)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
