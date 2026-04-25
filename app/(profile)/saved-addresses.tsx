import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAddressStore } from '../../stores/addressStore';
import ErrorModal from '../../components/ErrorModal';

export default function SavedAddressesScreen() {
  const router = useRouter();
  const { addresses, isLoading, fetchAddresses, deleteAddress, setDefaultAddress } =
    useAddressStore();
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      await fetchAddresses();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to load addresses');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to set default address');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F6F9FB] items-center justify-center">
        <ActivityIndicator size="large" color="#0A8F83" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-[#F6F9FB]">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white items-center justify-center border border-[#EEF2F7] mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[#111827] text-[18px] font-bold">
          Saved Addresses
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0A8F83']}
            tintColor="#0A8F83"
          />
        }
      >
        {addresses.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="w-20 h-20 rounded-full bg-[#E7F6F4] items-center justify-center mb-4">
              <Ionicons name="location-outline" size={40} color="#0A8F83" />
            </View>
            <Text className="text-[#111827] text-[16px] font-semibold mb-2">
              No Saved Addresses
            </Text>
            <Text className="text-[#6B7280] text-[14px] text-center mb-6">
              Add your first delivery address to get started
            </Text>
            <Pressable
              onPress={() => router.push('/(modals)/add-address')}
              className="bg-[#0A8F83] px-6 py-3 rounded-xl"
            >
              <Text className="text-white text-[14px] font-semibold">
                Add Address
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {addresses.map((address) => (
              <View
                key={address.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-[#EEF2F7]"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-[#111827] text-[14px] font-semibold">
                        {address.label}
                      </Text>
                      {address.isDefault && (
                        <View className="bg-[#E7F6F4] px-2 py-1 rounded">
                          <Text className="text-[#0A8F83] text-[10px] font-semibold">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[#6B7280] text-[13px] leading-5">
                      {address.addressLine}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(address.id)}
                    className="p-2"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </Pressable>
                </View>

                {!address.isDefault && (
                  <Pressable
                    onPress={() => handleSetDefault(address.id)}
                    className="border-t border-[#EEF2F7] pt-3"
                  >
                    <Text className="text-[#0A8F83] text-[13px] font-semibold text-center">
                      Set as Default
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}

            {/* Add New Button */}
            <Pressable
              onPress={() => router.push('/(modals)/add-address')}
              className="bg-white rounded-2xl p-4 border border-dashed border-[#0A8F83] flex-row items-center justify-center"
            >
              <Ionicons name="add-circle-outline" size={20} color="#0A8F83" />
              <Text className="text-[#0A8F83] text-[14px] font-semibold ml-2">
                Add New Address
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <ErrorModal
        visible={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </View>
  );
}
