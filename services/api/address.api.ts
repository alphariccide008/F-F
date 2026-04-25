import apiClient, { handleApiError } from './client';
import { ApiResponse, Address } from '../../types/api';

/**
 * Get all addresses
 */
export const getAddresses = async (): Promise<Address[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Address[]>>('/addresses');

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get address by ID
 */
export const getAddressById = async (addressId: string): Promise<Address> => {
  try {
    const response = await apiClient.get<ApiResponse<Address>>(`/addresses/${addressId}`);

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create new address
 */
export const createAddress = async (data: {
  label: 'Home' | 'Office' | 'Other';
  addressLine: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}): Promise<Address> => {
  try {
    const response = await apiClient.post<ApiResponse<Address>>('/addresses', data);

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update address
 */
export const updateAddress = async (
  addressId: string,
  data: {
    label?: 'Home' | 'Office' | 'Other';
    addressLine?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<Address> => {
  try {
    const response = await apiClient.patch<ApiResponse<Address>>(
      `/addresses/${addressId}`,
      data
    );

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    await apiClient.delete(`/addresses/${addressId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (addressId: string): Promise<Address> => {
  try {
    const response = await apiClient.patch<ApiResponse<Address>>(
      `/addresses/${addressId}/set-default`
    );

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
