import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as authApi from "../../services/api/auth.api";
import { useAuthStore } from "../../stores/authStore";

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; purpose?: string; mode?: string }>();
  const { setUser, setTokens } = useAuthStore();

  const inputs = useRef<(TextInput | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const phoneNumber = params.phone || "";
  const purpose = (params.purpose as "login" | "registration") || "login";
  const mode = params.mode || "login";

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (timeLeft > 0) return;

    try {
      await authApi.sendOTP(phoneNumber, purpose);
      setTimeLeft(60);
      Alert.alert("Success", "Verification code resent successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend code");
    }
  };

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Verify OTP
      await authApi.verifyOTP(phoneNumber, otpCode, purpose);

      // Step 2: Handle based on mode
      if (mode === "register") {
        // Registration mode - go directly to registration form
        router.replace({
          pathname: "/(auth)/registration",
          params: { phone: phoneNumber },
        });
      } else {
        // Login mode - attempt login
        try {
          const loginResult = await authApi.login(phoneNumber);

          if (loginResult.user.role === "rider") {
            Alert.alert(
              "Wrong App",
              "You're registered as a rider. Please use the FlexyFuel Rider app to sign in.",
              [{ text: "OK", onPress: () => router.replace("/(auth)/chooseMethod") }]
            );
            return;
          }

          // Save user and tokens to store
          setUser(loginResult.user);
          setTokens(loginResult.accessToken, loginResult.refreshToken);

          // Navigate to main app
          router.replace("/(Tabs)");
        } catch (loginError: any) {
          // If login fails, user doesn't exist - redirect to registration
          if (loginError.message?.includes("not found") || loginError.message?.includes("does not exist")) {
            router.replace({
              pathname: "/(auth)/registration",
              params: { phone: phoneNumber },
            });
          } else {
            throw loginError;
          }
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/numbIn");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View className="flex-1 px-6 pt-14">

        {/* Back Arrow */}
        <Pressable onPress={handleBack} className="mb-10 mt-[10%]">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>

        {/* Title */}
        <Text className="text-2xl font-semibold text-black mb-2">
          Enter verification code
        </Text>

        {/* Subtitle */}
        <Text className="text-sm text-gray-500 mb-10">
          We sent a code to {phoneNumber}
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-between mb-6">
          {[...Array(6)].map((_, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={code[index]}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(text) => handleChange(text, index)}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg text-black"
            />
          ))}
        </View>

        {/* Resend Row */}
        <View className="flex-row justify-center items-center space-x-2">
          <Pressable
            disabled={timeLeft > 0}
            onPress={handleResend}
          >
            <Text
              className={`text-sm font-medium ${
                timeLeft > 0 ? "text-gray-400" : "text-teal-600"
              }`}
            >
              Resend code
            </Text>
          </Pressable>

          {timeLeft > 0 && (
            <Text className="text-sm text-gray-400">
              {timeLeft}s
            </Text>
          )}
        </View>

      </View>

      {/* Verify Button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleVerify}
          disabled={isLoading}
          className={[
            "py-4 rounded-xl items-center",
            isLoading ? "bg-lime-300/70" : "bg-lime-300",
          ].join(" ")}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text className="text-black font-semibold text-base">
              Verify
            </Text>
          )}
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}
