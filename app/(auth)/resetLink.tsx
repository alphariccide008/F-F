// app/(auth)/resend-link.tsx
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter, useLocalSearchParams } from "expo-router";

export default function ResendLinkScreen() {
  const nav = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  // simple resend cooldown (matches common UX)
  const [cooldown, setCooldown] = useState(0);

  const safeEmail = useMemo(() => {
    const e = (email ?? "").toString().trim();
    return e.length ? e : "your email";
  }, [email]);

  const startCooldown = () => {
    setCooldown(30);
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    if (cooldown > 0) return;

    // ✅ call your resend API here
    // await resendResetLink(safeEmail)

    startCooldown();
  };

  return (
    <View className="flex-1 bg-white px-6">
      <Pressable onPress={() => nav.canGoBack() ? nav.back() : nav.replace("/(auth)/signIn")} className="mt-14 mb-2">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
      <View className="flex-1 items-center justify-center">
        {/* Check Icon */}
        <View className="h-[90px] w-[90px] items-center justify-center rounded-full bg-teal-600">
          <Feather name="check" size={28} color="white" />
        </View>

        {/* Title */}
        <Text className="mt-6 text-[24px] font-extrabold text-black text-center">
          Password reset sent!
        </Text>

        {/* Subtitle */}
        <Text className="mt-6 text-center text-[17px] text-gray-500 px-4">
          A link to reset your password has been sent to{"\n"}
          <Text className="text-gray-700 font-medium">{safeEmail}</Text>.
        </Text>

        {/* Button */}
        <View className="mt-10 w-full max-w-[360px]">
          <Pressable
            onPress={() => router.replace("/(auth)/signIn")}
            className="h-12 w-full items-center justify-center rounded-xl bg-lime-300"
          >
            <Text className="text-[15px] font-bold text-teal-700">
              Back to Login
            </Text>
          </Pressable>

          {/* Resend */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-[14px] text-gray-600">
              Didn’t receive email?{" "}
            </Text>

            <Pressable onPress={handleResend} disabled={cooldown > 0}>
              <Text
                className={[
                  "text-[14px] font-semibold",
                  cooldown > 0 ? "text-teal-700/50" : "text-teal-700",
                ].join(" ")}
              >
                {cooldown > 0 ? `Resend link (${cooldown}s)` : "Resend link"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
