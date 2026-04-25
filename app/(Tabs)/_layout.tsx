import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { View, AppState } from "react-native";
import { useOrderStore } from "../../stores/orderStore";
import { useNotificationStore } from "../../stores/notificationStore";

const STATUS_NOTIFICATIONS: Record<string, { title: string; message: (orderNumber: string) => string }> = {
  rider_assigned: {
    title: "Rider Assigned! 🏍️",
    message: (n) => `A rider has been assigned to your order #${n}.`,
  },
  en_route: {
    title: "Rider On the Way! 🚀",
    message: (n) => `Your rider has picked up the fuel for order #${n} and is heading to you.`,
  },
  arrived: {
    title: "Rider Arrived! 📍",
    message: (n) => `Your rider is at your location for order #${n}. Share your confirmation code.`,
  },
  completed: {
    title: "Order Delivered! 🎉",
    message: (n) => `Your fuel for order #${n} has been delivered successfully.`,
  },
  cancelled: {
    title: "Order Cancelled",
    message: (n) => `Your order #${n} has been cancelled and your wallet refunded.`,
  },
};

const POLL_INTERVAL = 15_000; // 15 seconds

function ActiveOrderWatcher() {
  const { activeOrder, fetchActiveOrder } = useOrderStore();
  const { addNotification } = useNotificationStore();
  const prevStatusRef = useRef<string | null>(null);
  const prevOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        await fetchActiveOrder();
      } catch {
        // silently ignore
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL);

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") poll();
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, [fetchActiveOrder]);

  // Detect status changes and fire notifications
  useEffect(() => {
    if (!activeOrder) {
      prevStatusRef.current = null;
      prevOrderIdRef.current = null;
      return;
    }

    const isNewOrder = prevOrderIdRef.current !== activeOrder.id;
    const statusChanged = prevStatusRef.current !== activeOrder.status;

    if (!isNewOrder && statusChanged && prevStatusRef.current !== null) {
      const notif = STATUS_NOTIFICATIONS[activeOrder.status];
      if (notif) {
        addNotification({
          title: notif.title,
          message: notif.message(activeOrder.orderNumber),
          type: "order",
          relatedId: activeOrder.id,
        });
      }
    }

    prevStatusRef.current = activeOrder.status;
    prevOrderIdRef.current = activeOrder.id;
  }, [activeOrder?.status, activeOrder?.id]);

  return null;
}

export default function TabsLayout() {
  return (
    <>
      <ActiveOrderWatcher />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0A8F83",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            height: 68,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: -2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ paddingBottom: 4 }}>
                <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="orderFuel"
          options={{ href: null, title: "Order Fuel" }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ paddingBottom: 4 }}>
                <Ionicons name={focused ? "receipt" : "receipt-outline"} size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ paddingBottom: 4 }}>
                <Ionicons name={focused ? "wallet" : "wallet-outline"} size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ paddingBottom: 4 }}>
                <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
