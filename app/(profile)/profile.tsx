import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      route: '/(profile)/edit-profile',
    },
    {
      icon: 'location-outline',
      title: 'Saved Addresses',
      subtitle: 'Manage your delivery locations',
      route: '/(profile)/saved-addresses',
    },
    {
      icon: 'receipt-outline',
      title: 'Order History',
      subtitle: 'View all your past orders',
      route: '/(profile)/order-history',
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      route: '/(profile)/payment-methods',
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      route: '/(profile)/notification-settings',
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      route: '/(profile)/help-support',
    },
    {
      icon: 'document-text-outline',
      title: 'Terms & Privacy',
      subtitle: 'Read our terms and privacy policy',
      route: '/(profile)/terms-privacy',
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/signIn');
  };

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      {/* Header */}
      <View className="bg-[#0A8F83] px-5 pt-12 pb-6">
        <Text className="text-white text-[20px] font-semibold">Profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Card */}
        <View className="px-5 mt-4">
          <View className="bg-white rounded-2xl p-5 border border-[#EEF2F7] shadow-sm">
            <View className="flex-row items-center">
              {/* Avatar */}
              {user?.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-[#0A8F83] items-center justify-center">
                  <Text className="text-white text-[24px] font-semibold">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}

              {/* User Info */}
              <View className="flex-1 ml-4">
                <Text className="text-[#111827] text-[16px] font-semibold">
                  {user?.fullName || 'User'}
                </Text>
                <Text className="text-[#6B7280] text-[13px] mt-1">
                  {user?.email || user?.phoneNumber || 'No email'}
                </Text>
                
                <Text className="text-[#6B7280] text-[12px] mt-0.5">
                  {user?.phoneNumber || ''}
                </Text>
              </View>

              {/* Edit Icon */}
              <Pressable
                onPress={() => router.push('/(profile)/edit-profile')}
                className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center"
              >
                <Ionicons name="pencil" size={18} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 mt-6">
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(item.route as any)}
              className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7] flex-row items-center active:opacity-70"
            >
              <View className="w-11 h-11 rounded-xl bg-[#E7F6F4] items-center justify-center">
                <Ionicons name={item.icon as any} size={22} color="#0A8F83" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-[#111827] text-[14px] font-semibold">
                  {item.title}
                </Text>
                <Text className="text-[#6B7280] text-[12px] mt-0.5">
                  {item.subtitle}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-5 mt-4">
          <Pressable
            onPress={handleLogout}
            className="bg-white rounded-2xl p-4 border border-red-200 flex-row items-center justify-center active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="text-red-500 text-[14px] font-semibold ml-2">
              Logout
            </Text>
          </Pressable>
        </View>

        {/* App Version */}
        <View className="px-5 mt-6">
          <Text className="text-[#9CA3AF] text-[12px] text-center">
            FlexyFuel v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
