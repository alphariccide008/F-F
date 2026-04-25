// app/(auth)/create-password.tsx
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";

function hasMinLen(pw: string) {
  return pw.length >= 8;
}
function hasSymbol(pw: string) {
  return /[^A-Za-z0-9]/.test(pw);
}
function hasNumber(pw: string) {
  return /\d/.test(pw);
}

function RuleRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View className="mt-2 flex-row items-center">
      <View
        className={[
          "mr-3 h-5 w-5 items-center justify-center rounded-full",
          ok ? "bg-green-100" : "bg-red-100",
        ].join(" ")}
      >
        <Feather
          name={ok ? "check" : "x"}
          size={14}
          color={ok ? "#16A34A" : "#DC2626"}
        />
      </View>
      <Text className="text-sm text-gray-500">{label}</Text>
    </View>
  );
}

export default function CreatePasswordScreen() {
  const nav = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hideConfirm, setHideConfirm] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const ruleLen = useMemo(() => hasMinLen(password), [password]);
  const ruleSymbol = useMemo(() => hasSymbol(password), [password]);
  const ruleNumber = useMemo(() => hasNumber(password), [password]);

  const confirmMatch = useMemo(() => confirm.length > 0 && confirm === password, [
    confirm,
    password,
  ]);

  const canSubmit = ruleLen && ruleSymbol && ruleNumber && confirmMatch;

  const showConfirmError = submitted && !confirmMatch;

  const handleCreate = () => {
    setSubmitted(true);
    if (!canSubmit) return;

    // ✅ Do your API call here to update password
    // then route to login or success page
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-white px-6">
      <Pressable onPress={() => nav.canGoBack() ? nav.back() : nav.replace("/(auth)/signIn")} className="mt-14 mb-2">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
      <View className="flex-1 items-center justify-center">
        {/* Title */}
        <Text className="text-3xl font-extrabold text-black text-center">
          Create new password
        </Text>

        {/* Subtitle */}
        <Text className="mt-3 text-center text-base text-gray-500">
          Enter a strong password to secure your{"\n"}account.
        </Text>

        {/* Form */}
        <View className="mt-10 w-full max-w-[380px]">
          {/* New Password */}
          <Text className="mb-2 text-sm font-semibold text-black">
            New Password
          </Text>

          <TextInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (submitted) setSubmitted(false);
            }}
            placeholder="Enter new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-[14px] text-black"
          />

          {/* Rules */}
          <View className="mt-3">
            <RuleRow ok={ruleLen} label="At least 8 characters" />
            <RuleRow ok={ruleSymbol} label="At least 1 symbol" />
            <RuleRow ok={ruleNumber} label="At least 1 number" />
          </View>

          {/* Confirm Password */}
          <Text className="mb-2 mt-10 text-sm font-semibold text-black">
            Confirm new password
          </Text>

          <View className="relative">
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={hideConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              className={[
                "h-12 w-full rounded-xl border px-4 pr-12 text-[14px] text-black",
                showConfirmError ? "border-red-300" : "border-gray-200",
              ].join(" ")}
            />

            <Pressable
              onPress={() => setHideConfirm((v) => !v)}
              className="absolute right-3 top-0 h-12 items-center justify-center"
            >
              <Feather
                name={hideConfirm ? "eye-off" : "eye"}
                size={18}
                color="#111827"
              />
            </Pressable>
          </View>

          {showConfirmError ? (
            <Text className="mt-2 text-sm font-medium text-red-600">
              Passwords do not match
            </Text>
          ) : null}

          {/* Button */}
          <Pressable
            onPress={handleCreate}
            className={[
              "mt-8 h-12 w-full items-center justify-center rounded-xl",
              canSubmit ? "bg-lime-300" : "bg-lime-200",
            ].join(" ")}
          >
            <Text className="text-[15px] font-bold text-teal-700">
              Create Account
            </Text>
          </Pressable>

          {/* Footer */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-[14px] text-gray-500">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text className="text-[14px] font-semibold text-teal-700">
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
