import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useOrderStore } from '../../stores/orderStore';
import ErrorModal from '../../components/ErrorModal';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatNaira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 2 });

const getStatusColor = (status: string) => {
  const colors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    rider_assigned: 'bg-blue-100 text-blue-700',
    en_route: 'bg-purple-100 text-purple-700',
    arrived: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const labels: any = {
    pending: 'Pending',
    rider_assigned: 'Rider Assigned',
    en_route: 'On the Way',
    arrived: 'Arrived',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { orders, isLoading, fetchOrders } = useOrderStore();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      await fetchOrders();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to load orders');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F6F9FB] items-center justify-center">
        <ActivityIndicator size="large" color="#0A8F83" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-[#F6F9FB]">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white items-center justify-center border border-[#EEF2F7] mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[#111827] text-[18px] font-bold">
          Order History
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="w-20 h-20 rounded-full bg-[#E7F6F4] items-center justify-center mb-4">
              <MaterialCommunityIcons name="receipt-text-outline" size={40} color="#0A8F83" />
            </View>
            <Text className="text-[#111827] text-[16px] font-semibold mb-2">
              No Orders Yet
            </Text>
            <Text className="text-[#6B7280] text-[14px] text-center">
              Your order history will appear here
            </Text>
          </View>
        ) : (
          <>
            {orders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() =>
                  router.push(`/(modals)/order-tracking?id=${order.id}` as any)
                }
                className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7] active:opacity-80"
              >
                {/* Order Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-[#111827] text-[14px] font-semibold">
                      Order #{order.orderNumber}
                    </Text>
                    <Text className="text-[#6B7280] text-[12px] mt-0.5">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    <Text className="text-[11px] font-semibold">
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                {/* Order Details */}
                <View className="bg-[#F9FAFB] rounded-xl p-3 mb-3">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialCommunityIcons name="fuel" size={18} color="#6B7280" />
                    <Text className="text-[#374151] text-[13px]">
                      {order.fuelQuantity} Liters
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location-outline" size={18} color="#6B7280" />
                    <Text className="text-[#374151] text-[13px] flex-1" numberOfLines={2}>
                      {order.deliveryAddress?.addressLine || 'Address not available'}
                    </Text>
                  </View>
                </View>

                {/* Total Amount */}
                <View className="border-t border-[#EEF2F7] pt-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[#6B7280] text-[13px]">Total Amount</Text>
                    <Text className="text-[#111827] text-[16px] font-semibold">
                      {formatNaira(Number(order.totalAmount))}
                    </Text>
                  </View>
                </View>

                {/* Track Order CTA — active orders only */}
                {!['completed', 'cancelled'].includes(order.status) && (
                  <View className="mt-3 bg-[#E7F6F4] rounded-xl py-2.5 flex-row items-center justify-center gap-2">
                    <Ionicons name="navigate-outline" size={16} color="#0A8F83" />
                    <Text className="text-[#0A8F83] text-[13px] font-semibold">
                      Tap to Track Order
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <ErrorModal
        visible={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </View>
  );
}
