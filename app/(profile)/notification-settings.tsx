import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'notification_settings';

const DEFAULT_SETTINGS = {
  orderUpdates: true,
  promotions: true,
  newFeatures: false,
  emailNotifications: true,
  smsNotifications: false,
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load saved settings on mount
  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
  };

  const notificationItems = [
    {
      key: 'orderUpdates' as const,
      icon: 'notifications-outline',
      title: 'Order Updates',
      description: 'Get notified about your order status',
    },
    {
      key: 'promotions' as const,
      icon: 'pricetag-outline',
      title: 'Promotions & Offers',
      description: 'Receive special deals and discounts',
    },
    {
      key: 'newFeatures' as const,
      icon: 'sparkles-outline',
      title: 'New Features',
      description: 'Learn about new app features',
    },
    {
      key: 'emailNotifications' as const,
      icon: 'mail-outline',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
    },
    {
      key: 'smsNotifications' as const,
      icon: 'chatbubble-outline',
      title: 'SMS Notifications',
      description: 'Receive notifications via SMS',
    },
  ];

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7] flex-row items-center gap-3">
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(Tabs)/profile")} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-bold text-[#111827]">Notification Settings</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {notificationItems.map((item, index) => (
          <View
            key={item.key}
            className={`bg-white rounded-2xl p-4 border border-[#EEF2F7] ${
              index < notificationItems.length - 1 ? 'mb-3' : ''
            }`}
          >
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#E7F6F4] items-center justify-center">
                <Ionicons name={item.icon as any} size={22} color="#0A8F83" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-[#111827] text-[14px] font-semibold">
                  {item.title}
                </Text>
                <Text className="text-[#6B7280] text-[12px] mt-0.5">
                  {item.description}
                </Text>
              </View>

              <Switch
                value={settings[item.key]}
                onValueChange={() => toggleSetting(item.key)}
                trackColor={{ false: '#D1D5DB', true: '#0A8F83' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        ))}

        {/* Info */}
        <View className="bg-[#FEF3C7] rounded-xl p-4 mt-6 flex-row gap-3">
          <Ionicons name="warning" size={20} color="#D97706" />
          <Text className="flex-1 text-[#92400E] text-[12px] leading-5">
            Disabling order updates may cause you to miss important delivery information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
