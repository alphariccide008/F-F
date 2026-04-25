import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotificationStore } from '../../stores/notificationStore';

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return { name: 'receipt', color: '#0A8F83' };
    case 'wallet':
      return { name: 'wallet', color: '#F59E0B' };
    case 'promotion':
      return { name: 'pricetag', color: '#8B5CF6' };
    case 'system':
      return { name: 'information-circle', color: '#3B82F6' };
    default:
      return { name: 'notifications', color: '#6B7280' };
  }
};

export default function NotificationsModal() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: any) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === 'order' && notification.relatedId) {
      router.back();
      router.push(`/(modals)/order-tracking?id=${notification.relatedId}`);
    } else if (notification.type === 'wallet') {
      router.back();
      router.push('/(Tabs)/wallet');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7]">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-8 h-8 items-center justify-center -ml-2"
            >
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
            <Text className="text-[24px] font-bold text-[#111827]">
              Notifications
            </Text>
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              className="px-3 py-1.5 rounded-lg bg-[#E7F6F4]"
            >
              <Text className="text-[12px] font-semibold text-[#0A8F83]">
                Mark all read
              </Text>
            </Pressable>
          )}
        </View>

        {unreadCount > 0 && (
          <Text className="text-[13px] text-[#6B7280]">
            You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#0A8F83" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="py-12 px-5 items-center">
            <View className="w-20 h-20 rounded-full bg-[#F3F4F6] items-center justify-center mb-4">
              <Ionicons name="notifications-outline" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-[16px] font-semibold text-[#111827] mb-1">
              No Notifications
            </Text>
            <Text className="text-[13px] text-[#6B7280] text-center">
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          <View className="px-5 pt-3">
            {notifications.map((notification, index) => {
              const icon = getNotificationIcon(notification.type);
              return (
                <Pressable
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  className={[
                    'flex-row items-start gap-3 py-4 border-b border-[#F3F4F6]',
                    !notification.isRead && 'bg-[#F0FDF9] -mx-5 px-5',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <View
                    className={[
                      'w-10 h-10 rounded-full items-center justify-center mt-0.5',
                      notification.isRead ? 'bg-[#F3F4F6]' : 'bg-white',
                    ].join(' ')}
                  >
                    <Ionicons
                      name={icon.name as any}
                      size={20}
                      color={icon.color}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text
                        className={[
                          'text-[14px] flex-1',
                          notification.isRead
                            ? 'text-[#111827] font-medium'
                            : 'text-[#111827] font-semibold',
                        ].join(' ')}
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View className="w-2 h-2 rounded-full bg-[#0A8F83] ml-2 mt-1.5" />
                      )}
                    </View>

                    <Text className="text-[13px] text-[#6B7280] leading-5 mb-2">
                      {notification.message}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-[11px] text-[#9CA3AF]">
                        {formatDate(notification.createdAt)}
                      </Text>

                      <Pressable
                        onPress={() => clearNotification(notification.id)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={14} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
