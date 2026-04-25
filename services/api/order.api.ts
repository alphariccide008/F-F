import apiClient, { handleApiError } from './client';
import { ApiResponse, Order, DeliveryMode, PaymentMethod } from '../../types/api';

/**
 * Create new order
 */
export const createOrder = async (data: {
  fuelQuantity: number;
  deliveryAddressId: string;
  deliveryMode: DeliveryMode;
  paymentMethod: PaymentMethod;
}): Promise<Order> => {
  try {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get orders
 */
export const getOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; pagination: any }> => {
  try {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders', {
      params,
    });

    return {
      orders: response.data.data!,
      pagination: response.data.pagination!,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get active order
 */
export const getActiveOrder = async (): Promise<Order | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Order>>('/orders/active');

    return response.data.data!;
  } catch (error) {
    // Return null if no active order
    if ((error as any).status === 404) {
      return null;
    }
    throw new Error(handleApiError(error));
  }
};

/**
 * Get order tracking info
 */
export const getOrderTracking = async (orderId: string): Promise<Order> => {
  try {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}/track`);

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${orderId}/cancel`
    );

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
