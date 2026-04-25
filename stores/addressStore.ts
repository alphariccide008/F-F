import { create } from 'zustand';
import { Address } from '../types/api';
import * as addressApi from '../services/api/address.api';

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  defaultAddress: Address | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAddresses: () => Promise<void>;
  createAddress: (data: {
    label: 'Home' | 'Office' | 'Other';
    addressLine: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }) => Promise<Address>;
  updateAddress: (
    addressId: string,
    data: {
      label?: 'Home' | 'Office' | 'Other';
      addressLine?: string;
      latitude?: number;
      longitude?: number;
    }
  ) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  setSelectedAddress: (address: Address | null) => void;
  clearError: () => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  selectedAddress: null,
  defaultAddress: null,
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    try {
      set({ isLoading: true, error: null });

      const addresses = await addressApi.getAddresses();

      const defaultAddr = addresses.find((a) => a.isDefault) || null;

      set({
        addresses,
        defaultAddress: defaultAddr,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  createAddress: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const address = await addressApi.createAddress(data);

      set((state) => ({
        addresses: [...state.addresses, address],
        defaultAddress: data.isDefault ? address : state.defaultAddress,
        isLoading: false,
      }));

      return address;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updateAddress: async (addressId, data) => {
    try {
      set({ isLoading: true, error: null });

      const updated = await addressApi.updateAddress(addressId, data);

      set((state) => ({
        addresses: state.addresses.map((a) => (a.id === addressId ? updated : a)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      set({ isLoading: true, error: null });

      await addressApi.deleteAddress(addressId);

      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== addressId),
        defaultAddress:
          state.defaultAddress?.id === addressId ? null : state.defaultAddress,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      set({ isLoading: true, error: null });

      const updated = await addressApi.setDefaultAddress(addressId);

      set((state) => ({
        addresses: state.addresses.map((a) =>
          a.id === addressId
            ? updated
            : { ...a, isDefault: false }
        ),
        defaultAddress: updated,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  setSelectedAddress: (address) => set({ selectedAddress: address }),

  clearError: () => set({ error: null }),
}));
