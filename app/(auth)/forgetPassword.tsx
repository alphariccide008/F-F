// app/(auth)/forgot-password.tsx
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailEmpty = submitted && email.trim().length === 0;
  const emailInvalid = submitted && email.trim().length > 0 && !isValidEmail(email);

  const handleSubmit = () => {
    setSubmitted(true);

    if (email.trim().length === 0) return;
    if (!isValidEmail(email)) return;

    router.push({
      pathname: "/(auth)/resetLink",
      params: { email: email.trim() },
    });
  };

  return (
    <View className="flex-1 bg-white px-6">
      <View className="flex-1 items-center justify-center">
        {/* Icon */}
        <View className="h-[90px] w-[90px] items-center justify-center rounded-full bg-teal-600">
          <Feather name="lock" size={28} color="white" />
        </View>

        {/* Title */}
        <Text className="mt-6 text-2xl font-extrabold text-black">
          Forgot Password
        </Text>

        {/* Subtitle */}
        <Text className="mt-2 text-center text-base text-gray-500">
          Enter your email to reset your Password
        </Text>

        {/* Form */}
        <View className="mt-10 w-full max-w-[360px]">
          <Text className="mb-2 text-sm font-semibold text-black">
            Email Address
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-[14px] text-black"
          />

          {/* Error messages */}
          {emailEmpty && (
            <Text className="mt-2 text-sm font-medium text-red-600">
              Email is required
            </Text>
          )}

          {emailInvalid && (
            <Text className="mt-2 text-sm font-medium text-red-600">
              Enter a valid email
            </Text>
          )}

          <Pressable
            onPress={handleSubmit}
            className="mt-8 h-12 w-full items-center justify-center rounded-xl bg-lime-300"
          >
            <Text className="text-[15px] font-bold text-teal-700">
              Send Reset Link
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="mt-6 items-center justify-center"
          >
            <Text className="text-[14px] font-semibold text-black">
              Back to Login
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
