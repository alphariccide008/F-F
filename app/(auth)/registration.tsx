import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as authApi from "../../services/api/auth.api";
import { useAuthStore } from "../../stores/authStore";

// ------------------ helpers ------------------
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function hasMinLen(pw: string) {
  return pw.length >= 8;
}

function hasSymbol(pw: string) {
  return /[^A-Za-z0-9]/.test(pw);
}

function hasNumber(pw: string) {
  return /\d/.test(pw);
}

function isValidPhone(phone: string) {
  const p = phone.replace(/\s+/g, "");
  return /^\d{8,15}$/.test(p);
}

function RuleRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View className="mt-2 flex-row items-center">
      <View className="mr-3 h-5 w-5 items-center justify-center rounded-full">
        <Ionicons
          name={ok ? "checkmark-circle-outline" : "close-circle-outline"}
          size={18}
          color={ok ? "#16A34A" : "#DC2626"}
        />
      </View>
      <Text className="text-sm text-gray-500">{label}</Text>
    </View>
  );
}

export default function CreateAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { setUser, setTokens } = useAuthStore();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/chooseMethod");
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If phone number is provided from OTP verification, use it
  const isFromOTP = !!params.phone;

  useEffect(() => {
    if (params.phone) {
      setPhone(params.phone);
    }
  }, [params.phone]);

  // Password rules
  const ruleLen = useMemo(() => hasMinLen(password), [password]);
  const ruleSymbol = useMemo(() => hasSymbol(password), [password]);
  const ruleNumber = useMemo(() => hasNumber(password), [password]);

  // Field errors
  const fullNameEmpty = submitted && fullName.trim().length === 0;
  const emailEmpty = submitted && email.trim().length === 0;
  const emailInvalid = submitted && email.trim().length > 0 && !isValidEmail(email);
  const phoneEmpty = submitted && !isFromOTP && phone.trim().length === 0;
  const phoneInvalid = submitted && !isFromOTP && phone.trim().length > 0 && !isValidPhone(phone);
  const passwordEmpty = submitted && password.trim().length === 0;
  const passwordRulesFail =
    submitted && password.trim().length > 0 && !(ruleLen && ruleSymbol && ruleNumber);
  const confirmEmpty = submitted && confirmPassword.trim().length === 0;
  const confirmMismatch =
    submitted &&
    confirmPassword.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword !== password;

  // Can submit validation
  const canSubmit =
    fullName.trim().length > 0 &&
    isValidEmail(email) &&
    (isFromOTP || isValidPhone(phone)) &&
    ruleLen &&
    ruleSymbol &&
    ruleNumber &&
    confirmPassword === password &&
    confirmPassword.trim().length > 0;

  const handleCreateAccount = async () => {
    setSubmitted(true);

    if (!canSubmit) return;

    try {
      setIsLoading(true);

      let result;

      if (isFromOTP) {
        // Register via phone OTP (already verified)
        result = await authApi.register({
          phoneNumber: phone,
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          role: "consumer",
        });
      } else {
        // Register via email/password (no OTP required)
        result = await authApi.registerWithPassword({
          phoneNumber: `+234${phone.trim()}`,
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          role: "consumer",
        });
      }

      // Save user data and tokens to auth store
      setUser(result.user);
      setTokens(result.accessToken, result.refreshToken);

      // Send email OTP for verification (non-blocking — navigate regardless)
      try {
        await authApi.sendEmailOTP(email.trim(), "registration");
      } catch (otpError: any) {
        console.warn("Failed to send email OTP:", otpError?.message);
      }

      // Navigate to email verification
      router.push({
        pathname: "/(auth)/verifyEmail",
        params: {
          email: email.trim(),
          fromRegistration: "true",
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 50, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          className="bg-white"
        >
          <Pressable onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>

          {/* Title */}
          <Text className="text-3xl font-bold text-[24px] pt-[10%] text-black">
            {isFromOTP ? "Complete your profile" : "Let's get started"}
          </Text>
          <Text className="text-[16px] text-[#6B7280] my-6">
            {isFromOTP
              ? "We just need a bit more information to complete your registration."
              : "We just need a bit of more information. Please enter your details to get started."
            }
          </Text>

          {/* Full Name */}
          <Text className="text-[14px] text-black pb-2 pt-5 font-semibold">
            Full Name
          </Text>
          <TextInput
            className={[
              "border mt-1 px-4 py-3 rounded-xl bg-white",
              fullNameEmpty ? "border-red-300" : "border-gray-300",
            ].join(" ")}
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
          />
          {fullNameEmpty && (
            <Text className="text-red-600 text-xs mt-2">Full name is required</Text>
          )}

          {/* Email */}
          <Text className="text-[14px] text-black pb-2 font-semibold mt-8">
            Email Address
          </Text>
          <TextInput
            className={[
              "border mt-1 px-4 py-3 rounded-xl bg-white",
              emailEmpty || emailInvalid ? "border-red-300" : "border-gray-300",
            ].join(" ")}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailEmpty && (
            <Text className="text-red-600 text-xs mt-2">Email is required</Text>
          )}
          {emailInvalid && (
            <Text className="text-red-600 text-xs mt-2">Enter a valid email</Text>
          )}

          {/* Phone - Read-only if from OTP, editable otherwise */}
          <Text className="text-[14px] text-black pb-2 font-semibold mt-8">
            Phone Number
          </Text>
          {isFromOTP ? (
            <View className="border mt-1 px-4 py-3 rounded-xl bg-gray-100">
              <Text className="text-gray-600">{phone}</Text>
            </View>
          ) : (
            <>
              <TextInput
                className={[
                  "border mt-1 px-4 py-3 rounded-xl bg-white",
                  phoneEmpty || phoneInvalid ? "border-red-300" : "border-gray-300",
                ].join(" ")}
                placeholder="8123456789"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {phoneEmpty && (
                <Text className="text-red-600 text-xs mt-2">Phone number is required</Text>
              )}
              {phoneInvalid && (
                <Text className="text-red-600 text-xs mt-2">
                  Enter a valid phone number
                </Text>
              )}
            </>
          )}

          {/* Password */}
          <Text className="text-[14px] text-black font-semibold pb-2 mt-8">
            Password
          </Text>
          <View
            className={[
              "border mt-1 px-4 py-3 rounded-xl bg-white flex-row items-center",
              passwordEmpty || passwordRulesFail ? "border-red-300" : "border-gray-300",
            ].join(" ")}
          >
            <TextInput
              className="flex-1"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {passwordEmpty && (
            <Text className="text-red-600 text-xs mt-2">Password is required</Text>
          )}

          {/* Password Rules */}
          <View className="mt-3">
            <RuleRow ok={ruleLen} label="At least 8 characters" />
            <RuleRow ok={ruleSymbol} label="At least 1 symbol" />
            <RuleRow ok={ruleNumber} label="At least 1 number" />
          </View>

          {/* Confirm Password */}
          <Text className="text-[14px] text-black font-semibold pb-2 mt-8">
            Confirm password
          </Text>
          <View
            className={[
              "border mt-1 px-4 py-3 rounded-xl bg-white flex-row items-center",
              confirmEmpty || confirmMismatch ? "border-red-300" : "border-gray-300",
            ].join(" ")}
          >
            <TextInput
              className="flex-1"
              placeholder="Confirm your password"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? "eye-off" : "eye"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {confirmEmpty && (
            <Text className="text-red-600 text-xs mt-2">
              Confirm password is required
            </Text>
          )}
          {confirmMismatch && (
            <Text className="text-red-600 text-xs mt-2">
              Passwords do not match
            </Text>
          )}

          {/* Button */}
          <TouchableOpacity
            onPress={handleCreateAccount}
            disabled={!canSubmit || isLoading}
            activeOpacity={0.8}
            className={[
              "w-full py-4 rounded-xl mt-10 items-center",
              canSubmit && !isLoading ? "bg-[#E0F7A6]" : "bg-[#E0F7A6]/70",
            ].join(" ")}
          >
            {isLoading ? (
              <ActivityIndicator color="#0A8F83" />
            ) : (
              <Text className="text-center text-[#0A8F83] font-semibold">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <View className="pt-4">
            <Text className="text-center text-[14px] text-gray-600">
              By signing up, you agree to our{" "}
              <Text className="text-[#0A8F83]">Terms of Service</Text> and{" "}
              <Text className="text-[#0A8F83]">Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
