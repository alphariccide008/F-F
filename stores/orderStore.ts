import { create } from 'zustand';
import { Order } from '../types/api';
import * as orderApi from '../services/api/order.api';
import { useNotificationStore } from './notificationStore';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchActiveOrder: () => Promise<void>;
  createOrder: (data: {
    fuelQuantity: number;
    deliveryAddressId: string;
    deliveryMode: 'standard' | 'priority';
    paymentMethod: 'wallet' | 'card' | 'bank_transfer';
  }) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  setSelectedOrder: (order: Order | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  selectedOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });

      const result = await orderApi.getOrders({ limit: 50 });

      set({
        orders: result.orders,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchActiveOrder: async () => {
    try {
      set({ error: null });

      const order = await orderApi.getActiveOrder();

      set({ activeOrder: order });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch active order error:', error);
    }
  },

  createOrder: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const order = await orderApi.createOrder(data);

      set((state) => ({
        orders: [order, ...state.orders],
        activeOrder: order,
        isLoading: false,
      }));

      useNotificationStore.getState().addNotification({
        title: 'Order Placed! 🛵',
        message: `Your order #${order.orderNumber} has been placed. We're finding a rider for you.`,
        type: 'order',
        relatedId: order.id,
      });

      return order;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const order = await orderApi.getOrderById(orderId);

      set({ selectedOrder: order, isLoading: false });

      return order;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const cancelledOrder = await orderApi.cancelOrder(orderId);

      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? cancelledOrder : o)),
        activeOrder: state.activeOrder?.id === orderId ? null : state.activeOrder,
        isLoading: false,
      }));

      useNotificationStore.getState().addNotification({
        title: 'Order Cancelled',
        message: `Your order #${cancelledOrder.orderNumber} has been cancelled and your wallet refunded.`,
        type: 'order',
        relatedId: orderId,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  clearError: () => set({ error: null }),
}));
