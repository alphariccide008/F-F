import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsPrivacyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7] flex-row items-center gap-3">
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(Tabs)/profile")} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-bold text-[#111827]">Terms & Privacy</Text>
      </View>
      {/* Tabs */}
      <View className="bg-white px-5 py-3 flex-row gap-3 border-b border-[#EEF2F7]">
        <Pressable
          onPress={() => setActiveTab('terms')}
          className={`flex-1 py-2 rounded-xl ${
            activeTab === 'terms' ? 'bg-[#0A8F83]' : 'bg-[#F3F4F6]'
          }`}
        >
          <Text
            className={`text-center text-[14px] font-semibold ${
              activeTab === 'terms' ? 'text-white' : 'text-[#6B7280]'
            }`}
          >
            Terms of Service
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('privacy')}
          className={`flex-1 py-2 rounded-xl ${
            activeTab === 'privacy' ? 'bg-[#0A8F83]' : 'bg-[#F3F4F6]'
          }`}
        >
          <Text
            className={`text-center text-[14px] font-semibold ${
              activeTab === 'privacy' ? 'text-white' : 'text-[#6B7280]'
            }`}
          >
            Privacy Policy
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'terms' ? (
          <>
            <Text className="text-[#111827] text-[16px] font-semibold mb-4">
              Terms of Service
            </Text>

            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              Last updated: January 30, 2026
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              1. Acceptance of Terms
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              By accessing and using FlexyFuel, you accept and agree to be bound by the terms
              and provision of this agreement.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              2. Use of Service
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              You agree to use FlexyFuel only for lawful purposes and in accordance with these
              Terms. You must not use our service in any way that could damage, disable, or
              impair the service.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              3. Orders and Payments
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              All orders placed through FlexyFuel are subject to acceptance and availability.
              Prices are subject to change without notice. Payment must be made in full before
              delivery.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              4. Cancellation Policy
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              You may cancel your order before a rider is assigned. Once a rider is assigned,
              cancellation may incur a fee. Refunds will be processed to your wallet within 3-5
              business days.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              5. Limitation of Liability
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              FlexyFuel shall not be liable for any indirect, incidental, special, or
              consequential damages resulting from the use or inability to use the service.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-[#111827] text-[16px] font-semibold mb-4">
              Privacy Policy
            </Text>

            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              Last updated: January 30, 2026
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              1. Information We Collect
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              We collect information you provide directly to us, including your name, email
              address, phone number, delivery address, and payment information. We also collect
              information about your device and usage of the app.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              2. How We Use Your Information
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              We use your information to process orders, communicate with you, improve our
              services, and comply with legal obligations. We do not sell your personal
              information to third parties.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              3. Data Security
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, or destruction. All payment transactions
              are encrypted using SSL technology.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              4. Location Data
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              We collect and use your location data to provide delivery services, show nearby
              stations, and calculate delivery fees. You can disable location services in your
              device settings.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              5. Your Rights
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              You have the right to access, correct, or delete your personal information. You
              can also opt-out of marketing communications at any time through your account
              settings.
            </Text>

            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              6. Contact Us
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-6 mb-4">
              If you have questions about this Privacy Policy, please contact us at
              privacy@flexyfuel.com
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
