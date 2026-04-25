import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PaymentMethodsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7] flex-row items-center gap-3">
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(Tabs)/profile")} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-bold text-[#111827]">Payment Methods</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Payment */}
        <View className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7]">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-xl bg-[#E7F6F4] items-center justify-center">
              <Ionicons name="wallet-outline" size={22} color="#0A8F83" />
            </View>
            <View className="flex-1">
              <Text className="text-[#111827] text-[14px] font-semibold">
                FlexyFuel Wallet
              </Text>
              <Text className="text-[#6B7280] text-[12px] mt-0.5">
                Primary payment method
              </Text>
            </View>
            <View className="w-6 h-6 rounded-full bg-[#0A8F83] items-center justify-center">
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Cards Section */}
        <Text className="text-[#6B7280] text-[13px] font-semibold mb-3 mt-4">
          SAVED CARDS
        </Text>

        {/* Empty State */}
        <View className="bg-white rounded-2xl p-6 border border-[#EEF2F7] items-center">
          <View className="w-16 h-16 rounded-full bg-[#F3F4F6] items-center justify-center mb-3">
            <Ionicons name="card-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-[#111827] text-[14px] font-semibold mb-1">
            No Cards Added
          </Text>
          <Text className="text-[#6B7280] text-[12px] text-center mb-4">
            Add a card for quick checkout
          </Text>
          <Pressable
            onPress={() => router.push("/(modals)/add-card")}
            className="bg-[#0A8F83] px-6 py-2.5 rounded-xl"
          >
            <Text className="text-white text-[13px] font-semibold">
              Add Card
            </Text>
          </Pressable>
        </View>

        {/* Info Box */}
        <View className="bg-[#EFF6FF] rounded-xl p-4 mt-6 flex-row gap-3">
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text className="flex-1 text-[#1E40AF] text-[12px] leading-5">
            Your card details are securely encrypted and stored. We never share your payment information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
