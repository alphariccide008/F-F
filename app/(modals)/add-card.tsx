import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWalletStore } from "../../stores/walletStore";

const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  }
  return cleaned;
};

export default function AddCardScreen() {
  const router = useRouter();
  const { initializeTopUp } = useWalletStore();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const rawCardNumber = cardNumber.replace(/\s/g, "");
  const isCardNumberValid = rawCardNumber.length === 16;
  const isExpiryValid = expiry.length === 5;
  const isCvvValid = cvv.length >= 3;
  const isCardHolderValid = cardHolder.trim().length >= 2;

  const canSubmit = isCardNumberValid && isExpiryValid && isCvvValid && isCardHolderValid;

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryChange = (text: string) => {
    const prev = expiry;
    // Allow deletion of "/"
    if (text.length < prev.length) {
      setExpiry(text.replace(/\/$/, ""));
      return;
    }
    setExpiry(formatExpiry(text));
  };

  const handleAddCard = async () => {
    setSubmitted(true);
    if (!canSubmit) return;

    try {
      setIsProcessing(true);

      // Initiate Paystack flow with card method to tokenize the card
      const result = await initializeTopUp(100, "card");

      const canOpen = await Linking.canOpenURL(result.paymentUrl);
      if (canOpen) {
        await Linking.openURL(result.paymentUrl);
        Alert.alert(
          "Verify Your Card",
          "A small verification charge of ₦100 will be made and refunded. Complete the payment in the browser to save your card.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        throw new Error("Cannot open payment URL");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add card");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="px-6 pt-14 pb-4 bg-white border-b border-[#E5E7EB]">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 -ml-2 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
            <Text className="text-[16px] font-semibold text-[#111827]">Add Card</Text>
            <View className="w-10 h-10" />
          </View>
        </View>

        <View className="flex-1 px-6 pt-6">
          {/* Card Preview */}
          <View className="rounded-2xl bg-[#0A8F83] p-5 mb-6">
            <View className="flex-row justify-between items-start mb-6">
              <Ionicons name="card" size={28} color="rgba(255,255,255,0.9)" />
              <Text className="text-white/60 text-[13px] font-semibold">
                {rawCardNumber.slice(0, 4) || "****"}
              </Text>
            </View>
            <Text className="text-white text-[18px] font-bold tracking-widest mb-4">
              {cardNumber || "**** **** **** ****"}
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-white/60 text-[10px] mb-0.5">CARD HOLDER</Text>
                <Text className="text-white text-[13px] font-semibold">
                  {cardHolder.trim().toUpperCase() || "YOUR NAME"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white/60 text-[10px] mb-0.5">EXPIRES</Text>
                <Text className="text-white text-[13px] font-semibold">
                  {expiry || "MM/YY"}
                </Text>
              </View>
            </View>
          </View>

          {/* Card Holder Name */}
          <View className="mb-4">
            <Text className="text-[13px] font-semibold text-[#111827] mb-2">
              Card Holder Name
            </Text>
            <TextInput
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Name on card"
              autoCapitalize="words"
              className={[
                "rounded-xl border-2 px-4 py-3 text-[14px] text-[#111827] bg-white",
                submitted && !isCardHolderValid ? "border-[#DC2626]" : "border-[#E5E7EB]",
              ].join(" ")}
              placeholderTextColor="#CBD5E1"
            />
            {submitted && !isCardHolderValid && (
              <Text className="text-[11px] text-[#DC2626] mt-1">Enter the name on your card</Text>
            )}
          </View>

          {/* Card Number */}
          <View className="mb-4">
            <Text className="text-[13px] font-semibold text-[#111827] mb-2">Card Number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              maxLength={19}
              className={[
                "rounded-xl border-2 px-4 py-3 text-[14px] text-[#111827] bg-white tracking-widest",
                submitted && !isCardNumberValid ? "border-[#DC2626]" : "border-[#E5E7EB]",
              ].join(" ")}
              placeholderTextColor="#CBD5E1"
            />
            {submitted && !isCardNumberValid && (
              <Text className="text-[11px] text-[#DC2626] mt-1">Enter a valid 16-digit card number</Text>
            )}
          </View>

          {/* Expiry + CVV */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-[#111827] mb-2">Expiry Date</Text>
              <TextInput
                value={expiry}
                onChangeText={handleExpiryChange}
                placeholder="MM/YY"
                keyboardType="number-pad"
                maxLength={5}
                className={[
                  "rounded-xl border-2 px-4 py-3 text-[14px] text-[#111827] bg-white",
                  submitted && !isExpiryValid ? "border-[#DC2626]" : "border-[#E5E7EB]",
                ].join(" ")}
                placeholderTextColor="#CBD5E1"
              />
              {submitted && !isExpiryValid && (
                <Text className="text-[11px] text-[#DC2626] mt-1">Enter expiry date</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-[#111827] mb-2">CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
                placeholder="***"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                className={[
                  "rounded-xl border-2 px-4 py-3 text-[14px] text-[#111827] bg-white",
                  submitted && !isCvvValid ? "border-[#DC2626]" : "border-[#E5E7EB]",
                ].join(" ")}
                placeholderTextColor="#CBD5E1"
              />
              {submitted && !isCvvValid && (
                <Text className="text-[11px] text-[#DC2626] mt-1">Enter CVV</Text>
              )}
            </View>
          </View>

          {/* Security note */}
          <View className="flex-row items-start gap-2 p-3 bg-[#F9FAFB] rounded-xl mb-4">
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#0A8F83"
              style={{ marginTop: 1 }}
            />
            <Text className="flex-1 text-[11px] text-[#6B7280]">
              Your card details are securely processed by Paystack. A ₦100 verification
              charge will be made and refunded to confirm your card.
            </Text>
          </View>
        </View>

        {/* Bottom CTA */}
        <View className="px-6 pb-6 pt-4 bg-white border-t border-[#E5E7EB]">
          <Pressable
            onPress={handleAddCard}
            disabled={isProcessing}
            className={[
              "h-12 rounded-xl items-center justify-center",
              !isProcessing ? "bg-[#0A8F83]" : "bg-[#0A8F83]/50",
            ].join(" ")}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-[14px]">Add Card</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
