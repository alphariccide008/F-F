import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ visible, message, onClose }: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Error Icon */}
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center self-center mb-4">
            <Ionicons name="close-circle" size={40} color="#EF4444" />
          </View>

          {/* Error Message */}
          <Text className="text-[#111827] text-[16px] font-semibold text-center mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-[#6B7280] text-[14px] text-center mb-6">
            {message}
          </Text>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="bg-[#0A8F83] py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-[14px] font-semibold text-center">
              Try Again
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
