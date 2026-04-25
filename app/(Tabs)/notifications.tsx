import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrderStore } from '../../stores/orderStore';

const formatNaira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 2 });

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

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

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

const showRiderInfo = (rider: any) => {
  Alert.alert(
    'Rider Information',
    `Name: ${rider.fullName}\nPhone: ${rider.phoneNumber}`,
    [
      { text: 'Call Rider', onPress: () => Linking.openURL(`tel:${rider.phoneNumber}`) },
      { text: 'Close', style: 'cancel' },
    ]
  );
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, activeOrder, isLoading, fetchOrders, fetchActiveOrder } =
    useOrderStore();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      await Promise.all([fetchOrders(), fetchActiveOrder()]);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case 'active':
        return orders.filter((order) =>
          ['pending', 'rider_assigned', 'en_route', 'arrived'].includes(
            order.status
          )
        );
      case 'completed':
        return orders.filter((order) => order.status === 'completed');
      case 'cancelled':
        return orders.filter((order) => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const FilterButton = ({
    label,
    value,
    count,
  }: {
    label: string;
    value: FilterType;
    count: number;
  }) => {
    const isActive = selectedFilter === value;
    return (
      <Pressable
        onPress={() => setSelectedFilter(value)}
        className={[
          'px-4 py-2 rounded-xl flex-row items-center gap-1.5',
          isActive ? 'bg-[#0A8F83]' : 'bg-white border border-[#E5E7EB]',
        ].join(' ')}
      >
        <Text
          className={[
            'text-[13px] font-semibold',
            isActive ? 'text-white' : 'text-[#6B7280]',
          ].join(' ')}
        >
          {label}
        </Text>
        {count > 0 && (
          <View
            className={[
              'px-1.5 py-0.5 rounded-full min-w-[18px] items-center justify-center',
              isActive ? 'bg-white/25' : 'bg-[#F3F4F6]',
            ].join(' ')}
          >
            <Text
              className={[
                'text-[10px] font-semibold',
                isActive ? 'text-white' : 'text-[#6B7280]',
              ].join(' ')}
            >
              {count}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7]">
        <Text className="text-[24px] font-bold text-[#111827]">My Orders</Text>
        <Text className="text-[13px] text-[#6B7280] mt-1">
          Track and manage your fuel deliveries
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-5 py-3 border-b border-[#EEF2F7]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <FilterButton
            label="All"
            value="all"
            count={orders.length}
          />
          <FilterButton
            label="Active"
            value="active"
            count={
              orders.filter((o) =>
                ['pending', 'rider_assigned', 'en_route', 'arrived'].includes(
                  o.status
                )
              ).length
            }
          />
          <FilterButton
            label="Completed"
            value="completed"
            count={orders.filter((o) => o.status === 'completed').length}
          />
          <FilterButton
            label="Cancelled"
            value="cancelled"
            count={orders.filter((o) => o.status === 'cancelled').length}
          />
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Order Banner */}
        {activeOrder &&
          !['completed', 'cancelled'].includes(selectedFilter) &&
          ['pending', 'rider_assigned', 'en_route', 'arrived'].includes(
            activeOrder.status
          ) && (
            <View className="bg-gradient-to-br from-[#0A8F83] to-[#0A8F83]/80 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                    <MaterialCommunityIcons
                      name="fuel"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text className="text-white text-[14px] font-semibold">
                    Active Delivery
                  </Text>
                </View>
                <View className="bg-white/25 px-2.5 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-semibold">
                    {getStatusLabel(activeOrder.status)}
                  </Text>
                </View>
              </View>

              <View className="bg-white/10 rounded-xl p-3 mb-3">
                <Text className="text-white/75 text-[11px]">Order Number</Text>
                <Text className="text-white text-[15px] font-semibold mt-0.5">
                  #{activeOrder.orderNumber}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white/75 text-[11px]">
                    Fuel Quantity
                  </Text>
                  <Text className="text-white text-[14px] font-semibold">
                    {activeOrder.fuelQuantity} Liters
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  {activeOrder.rider && (
                    <Pressable
                      onPress={() => showRiderInfo(activeOrder.rider)}
                      className="bg-white/20 px-3 py-2.5 rounded-xl flex-row items-center gap-1.5"
                    >
                      <Ionicons name="person" size={16} color="white" />
                      <Text className="text-white font-semibold text-[13px]">
                        Rider Info
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/(modals)/order-tracking?id=${activeOrder.id}`
                      )
                    }
                    className="bg-[#C4FF4B] px-4 py-2.5 rounded-xl flex-row items-center gap-1.5"
                  >
                    <Ionicons name="location" size={16} color="#0A8F83" />
                    <Text className="text-[#0A8F83] font-semibold text-[13px]">
                      Track Order
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

        {/* Orders List */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#0A8F83" />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-[#F3F4F6] items-center justify-center mb-4">
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={32}
                color="#9CA3AF"
              />
            </View>
            <Text className="text-[15px] font-semibold text-[#111827] mb-1">
              No Orders Found
            </Text>
            <Text className="text-[13px] text-[#6B7280] text-center">
              {selectedFilter === 'all'
                ? "You haven't placed any orders yet"
                : `No ${selectedFilter} orders`}
            </Text>

            {selectedFilter === 'all' && (
              <Pressable
                onPress={() => router.push('/(Tabs)/orderFuel')}
                className="bg-[#0A8F83] px-6 py-3 rounded-xl mt-4"
              >
                <Text className="text-white font-semibold text-[13px]">
                  Order Fuel Now
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredOrders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() =>
                ['pending', 'rider_assigned', 'en_route', 'arrived'].includes(
                  order.status
                )
                  ? router.push(`/(modals)/order-tracking?id=${order.id}`)
                  : null
              }
              className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7]"
            >
              {/* Order Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-[11px] text-[#6B7280]">
                    Order Number
                  </Text>
                  <Text className="text-[14px] font-semibold text-[#111827] mt-0.5">
                    #{order.orderNumber}
                  </Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  <Text className="text-[10px] font-semibold">
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              {/* Order Details */}
              <View className="border-t border-[#F3F4F6] pt-3 space-y-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="fuel"
                      size={16}
                      color="#6B7280"
                    />
                    <Text className="text-[13px] text-[#6B7280]">
                      Fuel Quantity
                    </Text>
                  </View>
                  <Text className="text-[13px] font-semibold text-[#111827]">
                    {order.fuelQuantity} Liters
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text className="text-[13px] text-[#6B7280]">Delivery</Text>
                  </View>
                  <Text
                    className="text-[13px] font-semibold text-[#111827] flex-1 text-right"
                    numberOfLines={1}
                  >
                    {order.deliveryAddress?.addressLine || 'N/A'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-[13px] text-[#6B7280]">Date</Text>
                  </View>
                  <Text className="text-[13px] font-semibold text-[#111827]">
                    {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Order Footer */}
              <View className="border-t border-[#F3F4F6] pt-3 mt-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-[11px] text-[#6B7280]">
                    Total Amount
                  </Text>
                  <Text className="text-[16px] font-bold text-[#0A8F83] mt-0.5">
                    {formatNaira(Number(order.totalAmount))}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  {order.rider && ['rider_assigned', 'en_route', 'arrived'].includes(order.status) && (
                    <Pressable
                      onPress={(e) => { e.stopPropagation(); showRiderInfo(order.rider); }}
                      className="bg-[#F3F4F6] px-3 py-2 rounded-xl flex-row items-center gap-1"
                    >
                      <Ionicons name="person-outline" size={16} color="#374151" />
                      <Text className="text-[#374151] font-semibold text-[12px]">
                        Rider
                      </Text>
                    </Pressable>
                  )}
                  {['pending', 'rider_assigned', 'en_route', 'arrived'].includes(
                    order.status
                  ) && (
                    <Pressable
                      onPress={() =>
                        router.push(`/(modals)/order-tracking?id=${order.id}`)
                      }
                      className="bg-[#E7F6F4] px-4 py-2 rounded-xl flex-row items-center gap-1"
                    >
                      <Ionicons name="eye-outline" size={16} color="#0A8F83" />
                      <Text className="text-[#0A8F83] font-semibold text-[12px]">
                        Track
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
