import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
  const router = useRouter();
  const contactMethods = [
    {
      icon: 'call-outline',
      title: 'Phone Support',
      subtitle: '+234 800 123 4567',
      action: () => Linking.openURL('tel:+2348001234567'),
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'support@flexyfuel.com',
      action: () => Linking.openURL('mailto:support@flexyfuel.com'),
    },
    {
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us on WhatsApp',
      action: () => Linking.openURL('https://wa.me/2348001234567'),
    },
  ];

  const faqItems = [
    {
      question: 'How do I place an order?',
      answer: 'Go to Order Fuel tab, select quantity, choose delivery address, and confirm payment.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept wallet balance, debit cards, and bank transfers via Paystack.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery: 45-60 mins. Priority delivery: 20-30 mins.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel before a rider is assigned. Go to Active Order and tap Cancel.',
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, all payments are processed securely through Paystack with encryption.',
    },
  ];

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7] flex-row items-center gap-3">
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(Tabs)/profile")} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-bold text-[#111827]">Help & Support</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Methods */}
        <Text className="text-[#111827] text-[16px] font-semibold mb-3">
          Contact Us
        </Text>

        {contactMethods.map((method, index) => (
          <Pressable
            key={index}
            onPress={method.action}
            className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7] flex-row items-center active:opacity-70"
          >
            <View className="w-11 h-11 rounded-xl bg-[#E7F6F4] items-center justify-center">
              <Ionicons name={method.icon as any} size={22} color="#0A8F83" />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-[#111827] text-[14px] font-semibold">
                {method.title}
              </Text>
              <Text className="text-[#6B7280] text-[12px] mt-0.5">
                {method.subtitle}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        ))}

        {/* FAQ Section */}
        <Text className="text-[#111827] text-[16px] font-semibold mb-3 mt-6">
          Frequently Asked Questions
        </Text>

        {faqItems.map((item, index) => (
          <View
            key={index}
            className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7]"
          >
            <Text className="text-[#111827] text-[14px] font-semibold mb-2">
              {item.question}
            </Text>
            <Text className="text-[#6B7280] text-[13px] leading-5">
              {item.answer}
            </Text>
          </View>
        ))}

        {/* App Info */}
        <View className="bg-[#EFF6FF] rounded-xl p-4 mt-6">
          <Text className="text-[#1E40AF] text-[13px] font-semibold mb-2">
            Need More Help?
          </Text>
          <Text className="text-[#3B82F6] text-[12px] leading-5">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
