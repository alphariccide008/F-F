import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAddressStore } from "../../stores/addressStore";

export default function SelectAddressScreen() {
  const router = useRouter();
  const { addresses, defaultAddress, isLoading, fetchAddresses, setDefaultAddress } =
    useAddressStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (defaultAddress) {
      setSelectedId(defaultAddress.id);
    }
  }, [defaultAddress]);

  const handleSave = async () => {
    if (!selectedId) return;

    // If selected is already default, just go back
    if (selectedId === defaultAddress?.id) {
      router.back();
      return;
    }

    try {
      setIsUpdating(true);
      await setDefaultAddress(selectedId);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update default address");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 -ml-2 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-semibold text-[#111827]">
            Select Address
          </Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0A8F83" size="large" />
          <Text className="text-[12px] text-[#6B7280] mt-3">Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-[#F3F4F6] items-center justify-center mb-4">
            <Ionicons name="location-outline" size={32} color="#6B7280" />
          </View>
          <Text className="text-[16px] font-semibold text-[#111827] mb-2">
            No Addresses Yet
          </Text>
          <Text className="text-[12px] text-[#6B7280] text-center mb-6">
            Add a delivery address to continue with your order
          </Text>
          <Pressable
            onPress={() => router.push("/(modals)/add-address")}
            className="bg-[#0A8F83] px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold text-[14px]">Add Address</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {addresses.map((address) => {
              const isSelected = selectedId === address.id;
              const isDefault = address.isDefault;

              return (
                <Pressable
                  key={address.id}
                  onPress={() => setSelectedId(address.id)}
                  className={[
                    "mb-3 rounded-2xl border p-4",
                    isSelected
                      ? "border-[#0A8F83] bg-[#E7F6F4]"
                      : "border-[#E5E7EB] bg-white",
                  ].join(" ")}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start gap-3 flex-1">
                      <View
                        className={[
                          "w-10 h-10 rounded-xl items-center justify-center",
                          isSelected ? "bg-[#0A8F83]" : "bg-[#F3F4F6]",
                        ].join(" ")}
                      >
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color={isSelected ? "#FFFFFF" : "#6B7280"}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-[13px] font-semibold text-[#111827]">
                            {address.label}
                          </Text>
                          {isDefault && (
                            <View className="px-2 py-0.5 rounded-full bg-[#0A8F83]">
                              <Text className="text-[9px] font-semibold text-white">
                                DEFAULT
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-[11px] text-[#6B7280] leading-4">
                          {address.addressLine}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "radio-button-off"}
                      size={20}
                      color={isSelected ? "#0A8F83" : "#CBD5E1"}
                    />
                  </View>
                </Pressable>
              );
            })}

            {/* Add New Address Button */}
            <Pressable
              onPress={() => router.push("/(modals)/add-address")}
              className="mt-2 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-4 items-center"
            >
              <Ionicons name="add-circle-outline" size={24} color="#0A8F83" />
              <Text className="text-[13px] font-semibold text-[#0A8F83] mt-2">
                Add New Address
              </Text>
            </Pressable>
          </ScrollView>

          {/* Bottom CTA */}
          <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-white border-t border-[#E5E7EB]">
            <Pressable
              onPress={handleSave}
              disabled={!selectedId || isUpdating}
              className={[
                "h-12 rounded-xl items-center justify-center",
                selectedId && !isUpdating ? "bg-[#0A8F83]" : "bg-[#0A8F83]/35",
              ].join(" ")}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-[14px]">
                  Save & Continue
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
