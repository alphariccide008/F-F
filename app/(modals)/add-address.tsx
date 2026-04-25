import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAddressStore } from "../../stores/addressStore";

type AddressLabel = "Home" | "Office" | "Other";

export default function AddAddressScreen() {
  const router = useRouter();
  const { createAddress, addresses } = useAddressStore();

  const [label, setLabel] = useState<AddressLabel>("Home");
  const [addressLine, setAddressLine] = useState("");
  const [isDefault, setIsDefault] = useState(addresses.length === 0); // First address is default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addressEmpty = submitted && addressLine.trim().length === 0;
  const canSubmit = addressLine.trim().length > 0;

  const handleSave = async () => {
    setSubmitted(true);

    if (!canSubmit) return;

    try {
      setIsSubmitting(true);

      await createAddress({
        label,
        addressLine: addressLine.trim(),
        isDefault,
      });

      Alert.alert("Success", "Address added successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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

          <Text className="text-[16px] font-semibold text-[#111827]">Add Address</Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Label Selection */}
        <Text className="text-[13px] font-semibold text-[#111827] mb-3">
          Address Label
        </Text>
        <View className="flex-row gap-2 mb-6">
          {(["Home", "Office", "Other"] as AddressLabel[]).map((lbl) => (
            <Pressable
              key={lbl}
              onPress={() => setLabel(lbl)}
              className={[
                "flex-1 py-3 px-4 rounded-xl border",
                label === lbl
                  ? "border-[#0A8F83] bg-[#E7F6F4]"
                  : "border-[#E5E7EB] bg-white",
              ].join(" ")}
            >
              <Text
                className={[
                  "text-[13px] font-semibold text-center",
                  label === lbl ? "text-[#0A8F83]" : "text-[#6B7280]",
                ].join(" ")}
              >
                {lbl}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Address Input */}
        <Text className="text-[13px] font-semibold text-[#111827] mb-2">
          Full Address
        </Text>
        <TextInput
          value={addressLine}
          onChangeText={setAddressLine}
          placeholder="Enter street address, area, and landmarks"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className={[
            "border rounded-xl p-4 text-[13px] text-[#111827] bg-white",
            addressEmpty ? "border-[#DC2626]" : "border-[#E5E7EB]",
          ].join(" ")}
          style={{ minHeight: 100 }}
        />
        {addressEmpty && (
          <Text className="text-[11px] text-[#DC2626] mt-2">Address is required</Text>
        )}

        {/* Location Hint */}
        <View className="mt-3 flex-row items-start gap-2 p-3 bg-[#F9FAFB] rounded-xl">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#6B7280"
            style={{ marginTop: 1 }}
          />
          <Text className="flex-1 text-[11px] text-[#6B7280]">
            Provide detailed address including street name, building number, and nearby
            landmarks for accurate delivery.
          </Text>
        </View>

        {/* Set as Default */}
        <Pressable
          onPress={() => setIsDefault(!isDefault)}
          className="mt-6 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-[13px] font-semibold text-[#111827]">
              Set as default address
            </Text>
            <Text className="text-[11px] text-[#6B7280] mt-0.5">
              Use this address for future orders
            </Text>
          </View>
          <Pressable
            onPress={() => setIsDefault(!isDefault)}
            className={[
              "w-12 h-7 rounded-full justify-center",
              isDefault ? "bg-[#0A8F83]" : "bg-[#E5E7EB]",
            ].join(" ")}
          >
            <View
              className={[
                "w-5 h-5 rounded-full bg-white",
                isDefault ? "ml-6" : "ml-1",
              ].join(" ")}
              style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.5, elevation: 2 }}
            />
          </Pressable>
        </Pressable>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-4 bg-white border-t border-[#E5E7EB]">
        <Pressable
          onPress={handleSave}
          disabled={isSubmitting || !canSubmit}
          className={[
            "h-12 rounded-xl items-center justify-center",
            canSubmit && !isSubmitting ? "bg-[#0A8F83]" : "bg-[#0A8F83]/35",
          ].join(" ")}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-[14px]">Save Address</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
