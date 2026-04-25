import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as authApi from "../../services/api/auth.api";

function isValidPhoneNG(localNumber: string) {
  // accepts 10 digits (e.g. 8123456789)
  const p = localNumber.replace(/\s+/g, "");
  return /^\d{10}$/.test(p);
}

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();

  const mode = params.mode === "register" ? "register" : "login";
  const isRegisterMode = mode === "register";

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/chooseMethod");
  };

  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const phoneEmpty = submitted && phone.trim().length === 0;
  const phoneInvalid = submitted && phone.trim().length > 0 && !isValidPhoneNG(phone);

  const canSubmit = useMemo(() => isValidPhoneNG(phone), [phone]);

  const handleContinue = async () => {
    setSubmitted(true);

    if (!canSubmit) return;

    const fullPhone = `+234${phone.trim()}`;
    const purpose = isRegisterMode ? "registration" : "login";

    try {
      setIsLoading(true);

      // Send OTP to phone number
      await authApi.sendOTP(fullPhone, purpose);

      // Navigate to verify screen with phone number and purpose
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: fullPhone, purpose, mode },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior="padding"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 px-6 pt-14"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Back Arrow */}
        <Pressable onPress={handleBack} className="mb-[20%] mt-10">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>

        {/* Title */}
        <Text className="text-[24px] font-semibold text-black mb-2">
          {isRegisterMode ? "Create account" : "Welcome back"}
        </Text>

        {/* Subtitle */}
        <Text className="text-gray-500 text-[16px] mb-8">
          {isRegisterMode
            ? "Enter your phone number to get started"
            : "You can log in back to your account using your phone number"
          }
        </Text>

        {/* Phone Number Label */}
        <Text className="text-[14px] mt-5 font-medium text-black mb-2">
          Phone Number
        </Text>

        {/* Phone Input */}
        <View
          className={[
            "flex-row items-center rounded-xl px-4 py-3",
            phoneEmpty || phoneInvalid ? "border border-red-300" : "border border-gray-300",
          ].join(" ")}
        >
          <Text className="text-gray-600 mr-3">+234</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="8123456789"
            keyboardType="phone-pad"
            className="flex-1 text-black"
            maxLength={10}
          />
        </View>

        {/* Inline errors */}
        {phoneEmpty && (
          <Text className="mt-2 text-xs font-medium text-red-600">
            Phone number is required
          </Text>
        )}
        {phoneInvalid && (
          <Text className="mt-2 text-xs font-medium text-red-600">
            Enter a valid phone number (10 digits)
          </Text>
        )}
      </ScrollView>

      {/* Fixed bottom — always visible above keyboard */}
      <View className="px-6 pb-8 pt-4 bg-white">
        <Pressable
          onPress={handleContinue}
          disabled={!canSubmit || isLoading}
          className={[
            "py-4 rounded-xl items-center mb-4",
            canSubmit && !isLoading ? "bg-[#C4FF4B]" : "bg-[#C4FF4B]/70",
          ].join(" ")}
        >
          {isLoading ? (
            <ActivityIndicator color="#0A8F83" />
          ) : (
            <Text className="text-[#0A8F83] font-semibold text-[16px]">
              Continue
            </Text>
          )}
        </Pressable>

        {/* Sign in with email */}
        <Pressable onPress={() => router.push("/(auth)/signIn")} className="items-center">
          <Text className="text-[14px] text-gray-700">Sign in with email</Text>
        </Pressable>
      </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
 