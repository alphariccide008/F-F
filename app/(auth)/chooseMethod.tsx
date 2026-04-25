import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

type Method = "email" | "phone" | null;

export default function LoginMethodScreen() {
  const [selected, setSelected] = useState("")
  const router = useRouter();
  const handleBack = () => {
  if (router.canGoBack()) router.back();
  else router.replace("/(auth)/signIn");
};

  const goNext = () => {
    if (selected === "email") router.push("/(auth)/signIn");
    if (selected === "phone") router.push("/(auth)/numbIn");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-14">
        {/* Back Arrow */}
        <Pressable onPress={handleBack} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>

        {/* Title */}
        <Text className="text-2xl font-semibold text-black mb-2">
          Welcome back
        </Text>

        {/* Subtitle */}
        <Text className="text-sm text-gray-500 mb-10">
          How would you like to login to your account?
        </Text>

        {/* Email Option */}
        <Pressable
          onPress={() => router.push('/(auth)/signIn')}
          className="flex-row items-center justify-between py-4 border-b border-gray-200"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="email" size={22} color="#0D9488" />
            <Text className="text-base ml-3 text-black">Email</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={selected === "email" ? "#0D9488" : "#9CA3AF"}
          />
        </Pressable>

        {/* Phone Option */}
        <Pressable
          onPress={() => router.push('/(auth)/numbIn')}
          className="flex-row items-center justify-between py-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={22} color="#0D9488" />
            <Text className="text-base ml-3 text-black">Phone number</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={selected === "phone" ? "#0D9488" : "#9CA3AF"}
          />
        </Pressable>
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        

        {/* Sign Up Link */}
        <View className="flex-row justify-center mb-6 mt-4">
          <Text className="text-sm text-gray-600">
            Don't have an account?{" "}
          </Text>
          <Text
            className="text-sm text-teal-600 font-medium"
            onPress={() => router.push({
              pathname: "/(auth)/numbIn",
              params: { mode: "register" }
            })}
          >
            Sign Up
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
