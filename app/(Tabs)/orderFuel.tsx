// app/(tabs)/order-fuel.tsx
// Pixel-perfect-ish "Order Fuel – Step 1 of 2" screen + state logic + animated quantity counter
// Stack: Expo Router + React Native + NativeWind + Ionicons
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAddressStore } from "../../stores/addressStore";

type QtyOption = 5 | 10 | 20;
type DeliveryMode = "standard" | "priority";

const PRICE_PER_LITER = 650;

const qtyCards: Array<{ liters: QtyOption; price: number }> = [
  { liters: 5, price: 3250 },
  { liters: 10, price: 6500 },
  { liters: 20, price: 13000 },
];

const formatNaira = (n: number) =>
  "₦ " + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export default function OrderFuelStep1() {
  const router = useRouter();
  const { addresses, defaultAddress, isLoading: addressesLoading, fetchAddresses } = useAddressStore();

  // === state ===
  const [selectedLiters, setSelectedLiters] = useState<QtyOption>(5);
  const [quantityLiters, setQuantityLiters] = useState<number>(5);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("standard");

  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // === derived ===
  const subtotal = useMemo(
    () => Math.max(0, quantityLiters) * PRICE_PER_LITER,
    [quantityLiters]
  );

  const deliveryFee = deliveryMode === "standard" ? 500 : 1000;

  const canContinue = useMemo(() => {
    return quantityLiters > 0 && !!defaultAddress && !!deliveryMode;
  }, [quantityLiters, defaultAddress, deliveryMode]);

  // === animation (production-ish counter pop) ===
  const scale = useRef(new Animated.Value(1)).current;
  const bump = () => {
    scale.stopAnimation();
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.12,
        duration: 110,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const setQty = (liters: QtyOption) => {
    setSelectedLiters(liters);
    setQuantityLiters(liters);
    bump();
  };

  const dec = () => {
    setQuantityLiters((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) bump();
      return next;
    });
  };

  const inc = () => {
    setQuantityLiters((prev) => {
      const next = prev + 1;
      bump();
      return next;
    });
  };

  const onContinue = () => {
    if (!canContinue || !defaultAddress) return;
    // Navigate to order summary with parameters
    router.push({
      pathname: "/(modals)/order-summary",
      params: {
        quantity: quantityLiters.toString(),
        deliveryMode: deliveryMode,
        addressId: defaultAddress.id,
      },
    });
  };

  const handleAddressNavigation = () => {
    router.push("/(profile)/saved-addresses");
  };

  return (
    <View className="flex-1 bg-white">
      {/* ===== Header ===== */}
      <View className="px-6 pt-14 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>

          <View className="items-center">
            <Text className="text-[14px] font-semibold text-[#111827]">
              Order Fuel
            </Text>
            <Text className="text-[11px] text-[#6B7280] mt-0.5">Step 1 of 2</Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        {/* progress line */}
        <View className="mt-3 h-[3px] w-[110px] bg-[#0A8F83] rounded-full" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* ===== Select Quantity ===== */}
          <Text className="text-[13px] font-semibold text-[#111827] mt-2">
            Select Quantity
          </Text>
          <Text className="text-[11px] text-[#6B7280] mt-1">
            {formatNaira(PRICE_PER_LITER)}/liter
          </Text>

          {/* quantity cards */}
          <View className="flex-row gap-3 mt-4">
            {qtyCards.map((q) => {
              const active = q.liters === selectedLiters;
              return (
                <Pressable
                  key={q.liters}
                  onPress={() => setQty(q.liters)}
                  className={[
                    "flex-1 rounded-2xl border px-4 py-4",
                    active ? "border-[#0A8F83] bg-[#E7F6F4]" : "border-[#E5E7EB] bg-white",
                  ].join(" ")}
                >
                  <View className="flex-row items-start justify-between">
                    <Text className="text-[13px] font-semibold text-[#111827]">
                      {q.liters}L
                    </Text>

                    {active ? (
                      <Ionicons name="checkmark-circle" size={18} color="#0A8F83" />
                    ) : (
                      <View className="w-[18px] h-[18px]" />
                    )}
                  </View>

                  <Text className="text-[11px] text-[#6B7280] mt-2">
                    {formatNaira(q.price)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* quantity stepper */}
          <View className="flex-row items-center justify-between mt-5">
            <Pressable
              onPress={dec}
              className="w-12 h-12 rounded-xl bg-[#F3F4F6] items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="remove" size={20} color="#111827" />
            </Pressable>

            <View className="items-center">
              <Animated.Text
                style={{ transform: [{ scale }] }}
                className="text-[18px] font-semibold text-[#111827]"
              >
                {quantityLiters}
              </Animated.Text>
              <Text className="text-[10px] text-[#6B7280] -mt-0.5">Litres</Text>
            </View>

            <Pressable
              onPress={inc}
              className="w-12 h-12 rounded-xl bg-[#F3F4F6] items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="add" size={20} color="#111827" />
            </Pressable>
          </View>

          {/* ===== Delivery Location ===== */}
          <Text className="text-[13px] font-semibold text-[#111827] mt-8">
            Delivery Location
          </Text>

          {addressesLoading ? (
            <View className="mt-3 py-8 items-center">
              <ActivityIndicator color="#0A8F83" />
            </View>
          ) : defaultAddress ? (
            <Pressable
              onPress={handleAddressNavigation}
              className="mt-3 rounded-2xl border border-[#0A8F83] bg-white px-4 py-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-xl bg-[#E7F6F4] items-center justify-center">
                    <Ionicons name="location-outline" size={18} color="#0A8F83" />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[12px] font-semibold text-[#111827]">
                        {defaultAddress.label}
                      </Text>
                      <View className="px-2 py-0.5 rounded-full bg-[#E7F6F4]">
                        <Text className="text-[9.5px] font-semibold text-[#0A8F83]">
                          Default
                        </Text>
                      </View>
                    </View>
                    <Text
                      numberOfLines={1}
                      className="text-[10.5px] text-[#6B7280] mt-1"
                    >
                      {defaultAddress.addressLine}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleAddressNavigation}
              className="mt-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-4 py-7 items-center justify-center"
            >
              <View className="w-10 h-10 rounded-xl bg-[#F3F4F6] items-center justify-center">
                <Ionicons name="location-outline" size={18} color="#6B7280" />
              </View>
              <Text className="text-[12px] font-semibold text-[#111827] mt-3">
                Add Delivery Address
              </Text>
              <Text className="text-[10.5px] text-[#6B7280] mt-1">
                Tap to add your first address
              </Text>
            </Pressable>
          )}

          {/* ===== Delivery Mode ===== */}
          <Text className="text-[13px] font-semibold text-[#111827] mt-8">
            Delivery Mode
          </Text>

          <View className="mt-3">
            <DeliveryModeCard
              active={deliveryMode === "standard"}
              title="Standard Delivery"
              subtitle="45–60 mins"
              fee={500}
              icon="time-outline"
              onPress={() => setDeliveryMode("standard")}
            />

            <View className="h-3" />

            <DeliveryModeCard
              active={deliveryMode === "priority"}
              title="Priority Delivery"
              subtitle="20–30 mins"
              fee={1000}
              icon="flash-outline"
              onPress={() => setDeliveryMode("priority")}
            />
          </View>
        </View>

        {/* ===== Bottom CTA ===== */}
        <View className="px-6 mt-8">
          <Pressable
            onPress={onContinue}
            disabled={!canContinue}
            className={[
              "h-12 rounded-xl flex-row items-center justify-center",
              canContinue ? "bg-[#0A8F83]" : "bg-[#0A8F83]/35",
            ].join(" ")}
          >
            <Text className="text-white font-semibold text-[13px]">
              Continue to Summary
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 8, opacity: canContinue ? 1 : 0.7 }}
            />
          </Pressable>

          {/* small cost hint (optional, but nice) */}
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[11px] text-[#6B7280]">Subtotal</Text>
            <Text className="text-[11px] text-[#111827] font-semibold">
              {formatNaira(subtotal)}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-[11px] text-[#6B7280]">Delivery Fee</Text>
            <Text className="text-[11px] text-[#111827] font-semibold">
              {formatNaira(deliveryFee)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DeliveryModeCard({
  active,
  title,
  subtitle,
  fee,
  icon,
  onPress,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  fee: number;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "rounded-2xl border px-4 py-4 bg-white",
        active ? "border-[#0A8F83] bg-[#E7F6F4]" : "border-[#E5E7EB]",
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
            <Ionicons
              name={icon}
              size={18}
              color={active ? "#FFFFFF" : "#6B7280"}
            />
          </View>

          <View className="flex-1">
            <Text className="text-[12px] font-semibold text-[#111827]">
              {title}
            </Text>
            <Text className="text-[10.5px] text-[#6B7280] mt-1">
              {subtitle}  ·  {formatNaira(fee)}
            </Text>
          </View>
        </View>

        <Ionicons
          name={active ? "checkmark-circle" : "checkmark-circle-outline"}
          size={18}
          color={active ? "#0A8F83" : "#CBD5E1"}
        />
      </View>
    </Pressable>
  );
}
