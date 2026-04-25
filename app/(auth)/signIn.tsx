import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as authApi from "../../services/api/auth.api";
import { useAuthStore } from "../../stores/authStore";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailEmpty = submitted && email.trim().length === 0;
  const emailInvalid =
    submitted && email.trim().length > 0 && !isValidEmail(email);

  const passwordEmpty = submitted && password.trim().length === 0;

  const passwordTooShort =
    submitted && password.trim().length > 0 && password.trim().length < 6;

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && password.trim().length >= 6;
  }, [email, password]);

  const handleSignIn = async () => {
    setSubmitted(true);

    if (!canSubmit) return;

    try {
      setIsLoading(true);

      const result = await authApi.loginWithPassword(email.trim(), password.trim());

      if (result.user.role === "rider") {
        Alert.alert(
          "Wrong App",
          "You're registered as a rider. Please use the FlexyFuel Rider app to sign in.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/chooseMethod") }]
        );
        return;
      }

      setUser(result.user);
      setTokens(result.accessToken, result.refreshToken);

      try {
        await authApi.sendEmailOTP(email.trim(), "verification");
      } catch (otpError: any) {
        console.warn("Failed to send email OTP:", otpError?.message);
      }

      router.replace("/(Tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          {/* Scrollable form area */}
          <ScrollView
            className="flex-1 bg-white px-10 pt-16"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" className="pt-[8%]" />
            </Pressable>

            {/* Title */}
            <Text className="text-[24px] mt-[13%] pb-3 font-bold">
              Welcome back!
            </Text>

            <Text className="text-[16px] pb-[10%] text-[#6B7280] mt-3">
              You can log in back to your account using your phone number
            </Text>

            {/* Email */}
            <Text className="font-semibold text-[14px] mb-3">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full border rounded-xl px-4 py-4"
              style={{ borderColor: emailEmpty || emailInvalid ? "#f87171" : "#d1d5db" }}
            />
            {emailEmpty && (
              <Text className="text-red-600 text-xs mt-2">Email is required</Text>
            )}
            {emailInvalid && (
              <Text className="text-red-600 text-xs mt-2">Enter a valid email</Text>
            )}

            {/* Password */}
            <Text className="font-semibold text-[14px] mb-3 mt-8">Password</Text>

            <View
              className="w-full relative border rounded-xl px-4 py-4 pr-12"
              style={{ borderColor: passwordEmpty || passwordTooShort ? "#f87171" : "#d1d5db" }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="w-full"
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[30%]"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {passwordEmpty && (
              <Text className="text-red-600 text-xs mt-2">Password is required</Text>
            )}
            {passwordTooShort && (
              <Text className="text-red-600 text-xs mt-2">
                Password must be at least 6 characters
              </Text>
            )}

            <TouchableOpacity onPress={() => router.push("/(auth)/forgetPassword")}>
              <Text className="text-right text-[14px] text-[#0A8F83] mb-6 mt-4">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Bottom padding so content isn't hidden behind fixed buttons */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Fixed bottom buttons — always visible above keyboard */}
          <View className="bg-white px-10 pb-8 pt-4">
            <TouchableOpacity
              className="w-full py-4 rounded-xl bg-[#C4FF4B]"
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#0A8F83" />
              ) : (
                <Text className="text-[#0A8F83] text-center font-semibold text-[16px]">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-5">
              <TouchableOpacity onPress={() => router.push("/(auth)/numbIn")}>
                <Text className="font-semibold text-[14px]">
                  Sign In with Phone Number
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-4">
              <Text className="font-semibold text-[14px]">Don't have an Account ? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/registration")}>
                <Text className="text-[#0A8F83] pb-4 font-semibold">sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
