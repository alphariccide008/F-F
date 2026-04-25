import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Linking,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getOrderTracking } from "../../services/api/order.api";
import { useOrderStore } from "../../stores/orderStore";
import type { Order } from "../../types/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: "pending",        label: "Order Placed",    icon: "receipt-outline" },
  { key: "rider_assigned", label: "Rider Assigned",  icon: "person-outline" },
  { key: "en_route",       label: "On the Way",      icon: "bicycle-outline" },
  { key: "arrived",        label: "Arrived",         icon: "location-outline" },
  { key: "completed",      label: "Delivered",       icon: "checkmark-circle-outline" },
] as const;

const STEP_INDEX: Record<string, number> = {
  pending: 0, rider_assigned: 1, en_route: 2, arrived: 3, completed: 4, cancelled: -1,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  rider_assigned: "#3B82F6",
  en_route: "#8B5CF6",
  arrived: "#0A8F83",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const STATUS_NOTIFICATIONS: Record<string, { title: string; message: string; icon: string }> = {
  rider_assigned: { title: "Rider Assigned! 🏍️",  message: "A rider has been assigned to your order.",           icon: "person-circle" },
  en_route:       { title: "Rider On the Way! 🚀",  message: "Your rider has picked up the fuel and is heading to you.", icon: "bicycle" },
  arrived:        { title: "Rider Arrived! 📍",     message: "Your rider is at your location. Share the confirmation code.", icon: "location" },
  completed:      { title: "Delivered! 🎉",         message: "Your fuel has been delivered successfully.",       icon: "checkmark-circle" },
  cancelled:      { title: "Order Cancelled",        message: "Your order has been cancelled and wallet refunded.", icon: "close-circle" },
};

const POLL_INTERVAL = 10_000; // 10 seconds

// ─── component ──────────────────────────────────────────────────────────────

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id: orderId } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showRiderModal, setShowRiderModal] = useState(false);

  // In-app notification banner
  const [notification, setNotification] = useState<{ title: string; message: string; icon: string; color: string } | null>(null);
  const notifAnim = useRef(new Animated.Value(-100)).current;
  const prevStatusRef = useRef<string | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { cancelOrder } = useOrderStore();

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const riderMoveAnim = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  // ── show notification banner ───────────────────────────────────────────────
  const showNotification = useCallback((status: string) => {
    const n = STATUS_NOTIFICATIONS[status];
    if (!n) return;
    const color = STATUS_COLORS[status] ?? "#0A8F83";
    setNotification({ ...n, color });
    // slide in
    Animated.spring(notifAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    // auto-dismiss after 4s
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => {
      Animated.timing(notifAnim, { toValue: -100, duration: 300, useNativeDriver: true }).start(() =>
        setNotification(null)
      );
    }, 4000);
  }, [notifAnim]);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async (showLoader = false) => {
    if (!orderId) return;
    if (showLoader) setLoading(true);
    try {
      const data = await getOrderTracking(orderId as string);
      // Detect status change and fire notification
      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        showNotification(data.status);
      }
      prevStatusRef.current = data.status;
      setOrder(data);
      setLastRefresh(new Date());
    } catch (e) {
      // silently ignore poll errors
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder(true);
    const interval = setInterval(() => fetchOrder(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // ── pulse animation (status dot) ──────────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ── rider movement animation (en_route / arrived) ─────────────────────────
  useEffect(() => {
    if (!order) return;
    if (order.status === "en_route") {
      // Rider moves from 0→1 in a slow loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(riderMoveAnim, { toValue: 1, duration: 4000, useNativeDriver: false }),
          Animated.timing(riderMoveAnim, { toValue: 0.7, duration: 1500, useNativeDriver: false }),
        ])
      ).start();
      // Blinking dot
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(dotOpacity, { toValue: 1,   duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else if (order.status === "arrived") {
      riderMoveAnim.setValue(1);
      dotOpacity.setValue(1);
    } else {
      riderMoveAnim.setValue(0);
    }
  }, [order?.status]);

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0A8F83" />
        <Text className="text-[#6B7280] text-[13px] mt-3">Loading tracking info…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={56} color="#9CA3AF" />
        <Text className="text-[#111827] text-[16px] font-semibold mt-4">Order not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-[#0A8F83] px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const stepIdx    = STEP_INDEX[order.status] ?? 0;
  const statusColor = STATUS_COLORS[order.status] ?? "#6B7280";
  const isActive   = !["completed", "cancelled"].includes(order.status);
  const showCode   = !["completed", "cancelled"].includes(order.status) && !!order.confirmationCode;

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      {/* ── In-App Notification Banner ──────────────────────────────────── */}
      {notification && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            transform: [{ translateY: notifAnim }],
          }}
        >
          <View
            style={{ backgroundColor: notification.color }}
            className="mx-4 mt-12 rounded-2xl px-4 py-3 flex-row items-center gap-3 shadow-lg"
          >
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name={notification.icon as any} size={20} color="#FFF" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-[13px] font-bold">{notification.title}</Text>
              <Text className="text-white/80 text-[11px] mt-0.5">{notification.message}</Text>
            </View>
            <Pressable
              onPress={() => {
                if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
                Animated.timing(notifAnim, { toValue: -100, duration: 250, useNativeDriver: true }).start(() =>
                  setNotification(null)
                );
              }}
              className="w-7 h-7 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* ── Rider Details Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showRiderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRiderModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setShowRiderModal(false)}
        >
          <Pressable
            className="bg-white rounded-3xl w-full p-6"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <View className="items-center mb-4">
              {order?.rider?.profilePhoto ? (
                <Image
                  source={{ uri: order.rider.profilePhoto }}
                  style={{ width: 88, height: 88, borderRadius: 44 }}
                />
              ) : (
                <View className="w-[88px] h-[88px] rounded-full bg-[#E7F6F4] items-center justify-center">
                  <Text className="text-[#0A8F83] text-[36px] font-bold">
                    {order?.rider?.fullName?.charAt(0).toUpperCase() ?? "R"}
                  </Text>
                </View>
              )}
              {!order?.rider?.profilePhoto && (
                <Text className="text-[#9CA3AF] text-[10px] mt-2 text-center">
                  Rider has not added a profile photo
                </Text>
              )}
            </View>

            {/* Name + badge */}
            <View className="items-center mb-1">
              <Text className="text-[18px] font-bold text-[#111827]">
                {order?.rider?.fullName ?? "Rider"}
              </Text>
              <View className="mt-1 px-3 py-0.5 rounded-full bg-[#E7F6F4]">
                <Text className="text-[#0A8F83] text-[11px] font-semibold">Delivery Rider</Text>
              </View>
            </View>

            {/* Divider */}
            <View className="border-t border-[#EEF2F7] my-4" />

            {/* Phone row */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-[#E7F6F4] items-center justify-center">
                <Ionicons name="call" size={18} color="#0A8F83" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-[#9CA3AF]">Phone Number</Text>
                <Text className="text-[14px] font-semibold text-[#111827]">
                  {order?.rider?.phoneNumber ?? "—"}
                </Text>
              </View>
            </View>

            {/* Call button */}
            <Pressable
              onPress={() => {
                if (order?.rider?.phoneNumber) {
                  Linking.openURL(`tel:${order.rider.phoneNumber}`);
                }
              }}
              className="bg-[#0A8F83] rounded-2xl py-3.5 items-center flex-row justify-center gap-2 mb-3"
            >
              <Ionicons name="call" size={18} color="#FFF" />
              <Text className="text-white text-[14px] font-semibold">Call Rider</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowRiderModal(false)}
              className="rounded-2xl py-3 items-center border border-[#E5E7EB]"
            >
              <Text className="text-[#6B7280] text-[14px] font-medium">Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View className="bg-[#0A8F83] px-5 pt-12 pb-5">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>
          <Text className="text-white text-[16px] font-bold">Track Order</Text>
          <View className="w-9" />
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-white/80 text-[13px]">Order #{order.orderNumber}</Text>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${statusColor}30` }}>
            <Text className="text-[11px] font-bold" style={{ color: statusColor === "#F59E0B" ? "#FFF" : "#FFF" }}>
              {order.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        {isActive && (
          <Text className="text-white/60 text-[10px] mt-1">
            Last updated {lastRefresh.toLocaleTimeString()} · refreshes every 10s
          </Text>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Confirmation Code ──────────────────────────────────────── */}
        {showCode && order.confirmationCode && (
          <View className="mx-4 mb-4 rounded-2xl overflow-hidden border-2 border-[#0A8F83]">
            <View className="bg-[#0A8F83] px-4 py-2 flex-row items-center gap-2">
              <Ionicons name="shield-checkmark" size={16} color="#FFF" />
              <Text className="text-white text-[12px] font-bold">
                DELIVERY CONFIRMATION CODE
              </Text>
            </View>
            <View className="bg-white px-4 py-4 items-center">
              <Text className="text-[#6B7280] text-[11px] mb-2">
                {order.status === "arrived"
                  ? "Rider is here — give them this code now"
                  : "Keep this code ready — give it to the rider on arrival"}
              </Text>
              <View className="flex-row gap-2">
                {order.confirmationCode.split("").map((char, i) => (
                  <View
                    key={i}
                    className="w-10 h-12 rounded-xl bg-[#F0FDF9] border-2 border-[#0A8F83] items-center justify-center"
                  >
                    <Text className="text-[#0A8F83] text-[22px] font-black">{char}</Text>
                  </View>
                ))}
              </View>
              {order.status === "arrived" && (
                <View className="mt-3 flex-row items-center gap-1.5">
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  </Animated.View>
                  <Text className="text-[#10B981] text-[11px] font-semibold">
                    Rider has arrived — share the code!
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Pending / waiting state ───────────────────────────────── */}
        {order.status === "pending" && (
          <View className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-[#EEF2F7] items-center">
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View className="w-14 h-14 rounded-full bg-[#FEF3C7] items-center justify-center mb-3">
                <Ionicons name="time-outline" size={30} color="#F59E0B" />
              </View>
            </Animated.View>
            <Text className="text-[14px] font-semibold text-[#111827]">Waiting for a Rider</Text>
            <Text className="text-[11px] text-[#6B7280] text-center mt-1">
              Your order has been placed. A rider will be assigned shortly.
            </Text>
          </View>
        )}

        {/* ── Live Route Visualization ───────────────────────────────── */}
        {["rider_assigned", "en_route", "arrived"].includes(order.status) && (
          <View className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-[#EEF2F7]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[13px] font-semibold text-[#111827]">Live Tracking</Text>
              {order.status === "en_route" && (
                <Animated.View style={{ opacity: dotOpacity }} className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  <Text className="text-[10px] text-[#8B5CF6] font-semibold">LIVE</Text>
                </Animated.View>
              )}
            </View>

            {/* Route bar */}
            <View className="relative h-14 justify-center">
              {/* Track line */}
              <View className="absolute left-4 right-4 h-1 rounded-full bg-[#E5E7EB]" />
              {/* Progress fill */}
              <Animated.View
                className="absolute left-4 h-1 rounded-full bg-[#0A8F83]"
                style={{
                  width: riderMoveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "85%"],
                  }),
                }}
              />

              {/* Origin dot */}
              <View className="absolute left-3 w-5 h-5 rounded-full bg-[#0A8F83] items-center justify-center">
                <Ionicons name="flash" size={10} color="#FFF" />
              </View>

              {/* Rider icon — animated */}
              <Animated.View
                className="absolute"
                style={{
                  left: riderMoveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["8%", "75%"],
                  }),
                  top: 4,
                }}
              >
                <View className="w-9 h-9 rounded-full bg-[#0A8F83] items-center justify-center shadow-md border-2 border-white">
                  <MaterialCommunityIcons name="motorbike" size={18} color="#FFF" />
                </View>
              </Animated.View>

              {/* Destination dot */}
              <View className="absolute right-3 w-5 h-5 rounded-full bg-[#F59E0B] items-center justify-center">
                <Ionicons name="location" size={10} color="#FFF" />
              </View>
            </View>

            <View className="flex-row justify-between mt-2 px-1">
              <Text className="text-[10px] text-[#6B7280]">Depot</Text>
              <Text className="text-[10px] text-[#6B7280]">Your Location</Text>
            </View>

            {order.status === "en_route" && (
              <View className="mt-3 bg-[#F0FDF9] rounded-xl px-3 py-2 flex-row items-center gap-2">
                <MaterialCommunityIcons name="motorbike" size={16} color="#0A8F83" />
                <Text className="text-[#0A8F83] text-[12px] font-medium">
                  Your rider is on the way
                </Text>
              </View>
            )}
            {order.status === "arrived" && (
              <View className="mt-3 bg-[#D1FAE5] rounded-xl px-3 py-2 flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-[#065F46] text-[12px] font-medium">
                  Rider has arrived at your location
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Status Timeline ────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-[#EEF2F7]">
          <Text className="text-[13px] font-semibold text-[#111827] mb-4">Order Progress</Text>

          {order.status === "cancelled" ? (
            <View className="items-center py-4">
              <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-2">
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </View>
              <Text className="text-[#EF4444] font-semibold text-[14px]">Order Cancelled</Text>
            </View>
          ) : (
            STATUS_STEPS.map((step, index) => {
              const done    = index < stepIdx;
              const current = index === stepIdx;
              const ahead   = index > stepIdx;

              return (
                <View key={step.key} className="flex-row items-start">
                  {/* Icon col */}
                  <View className="items-center w-8">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: done
                          ? "#0A8F83"
                          : current
                          ? `${statusColor}20`
                          : "#F3F4F6",
                      }}
                    >
                      {current ? (
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                          <Ionicons
                            name={step.icon as any}
                            size={15}
                            color={statusColor}
                          />
                        </Animated.View>
                      ) : (
                        <Ionicons
                          name={done ? "checkmark" : (step.icon as any)}
                          size={15}
                          color={done ? "#FFF" : "#9CA3AF"}
                        />
                      )}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View
                        className="w-0.5 flex-1 my-0.5"
                        style={{
                          backgroundColor: done ? "#0A8F83" : "#E5E7EB",
                          minHeight: 20,
                        }}
                      />
                    )}
                  </View>

                  {/* Label col */}
                  <View className="ml-3 pb-4 flex-1">
                    <Text
                      className="text-[13px] font-semibold"
                      style={{
                        color: ahead ? "#9CA3AF" : current ? statusColor : "#111827",
                      }}
                    >
                      {step.label}
                    </Text>
                    {current && (
                      <Text className="text-[10px] mt-0.5" style={{ color: statusColor }}>
                        Current status
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── Rider Info ─────────────────────────────────────────────── */}
        {order.rider && (
          <Pressable
            onPress={() => setShowRiderModal(true)}
            className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-[#EEF2F7]"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                {order.rider.profilePhoto ? (
                  <Image
                    source={{ uri: order.rider.profilePhoto }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-[#E7F6F4] items-center justify-center">
                    <Text className="text-[#0A8F83] text-[20px] font-bold">
                      {order.rider.fullName?.charAt(0).toUpperCase() ?? "R"}
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-[14px] font-semibold text-[#111827]">
                    {order.rider.fullName}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Text className="text-[11px] text-[#6B7280]">Delivery Rider</Text>
                    <Ionicons name="chevron-forward" size={11} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (order.rider?.phoneNumber) {
                    Linking.openURL(`tel:${order.rider.phoneNumber}`);
                  }
                }}
                className="w-10 h-10 rounded-full bg-[#E7F6F4] items-center justify-center"
              >
                <Ionicons name="call" size={18} color="#0A8F83" />
              </Pressable>
            </View>
            <Text className="text-[10px] text-[#9CA3AF] mt-2">Tap to view rider details</Text>
          </Pressable>
        )}

        {/* ── Delivery Address ───────────────────────────────────────── */}
        {order.deliveryAddress && (
          <View className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-[#EEF2F7]">
            <View className="flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-xl bg-[#FEF3C7] items-center justify-center mt-0.5">
                <Ionicons name="location" size={18} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-[#6B7280] mb-0.5">Delivery Address</Text>
                <Text className="text-[13px] font-semibold text-[#111827]">
                  {order.deliveryAddress.label}
                </Text>
                <Text className="text-[12px] text-[#6B7280] mt-0.5">
                  {order.deliveryAddress.addressLine}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Order Summary ──────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-[#EEF2F7]">
          <Text className="text-[13px] font-semibold text-[#111827] mb-3">Order Summary</Text>
          <View className="gap-2">
            <Row label="Fuel Quantity"   value={`${order.fuelQuantity} Litres`} />
            <Row label="Price/Litre"     value={`₦${Number(order.pricePerLiter).toLocaleString()}`} />
            <Row label="Delivery Mode"   value={order.deliveryMode === "priority" ? "⚡ Priority" : "Standard"} />
            <View className="border-t border-[#EEF2F7] mt-1 pt-2">
              <Row
                label="Total"
                value={`₦${Number(order.totalAmount).toLocaleString()}`}
                bold
              />
            </View>
          </View>
        </View>

        {/* ── Cancel (only when pending) ─────────────────────────────── */}
        {order.status === "pending" && (
          <View className="mx-4">
            <Pressable
              disabled={cancelling}
              onPress={() =>
                Alert.alert(
                  "Cancel Order",
                  "Are you sure you want to cancel this order? Your wallet balance will be refunded immediately.",
                  [
                    { text: "Keep Order", style: "cancel" },
                    {
                      text: "Cancel Order",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          setCancelling(true);
                          await cancelOrder(order.id);
                          Alert.alert(
                            "Order Cancelled",
                            "Your order has been cancelled and your wallet has been refunded.",
                            [{ text: "OK", onPress: () => router.back() }]
                          );
                        } catch (err: any) {
                          Alert.alert(
                            "Cancel Failed",
                            err.message || "Could not cancel the order. Please try again."
                          );
                        } finally {
                          setCancelling(false);
                        }
                      },
                    },
                  ]
                )
              }
              className="border border-red-200 rounded-xl py-3 items-center flex-row justify-center gap-2"
              style={{ opacity: cancelling ? 0.6 : 1 }}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              )}
              <Text className="text-red-500 text-[13px] font-semibold">
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[12px] text-[#6B7280]">{label}</Text>
      <Text
        className={`text-[13px] ${bold ? "font-bold text-[#111827]" : "text-[#374151]"}`}
      >
        {value}
      </Text>
    </View>
  );
}
