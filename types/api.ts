// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  role: 'consumer' | 'rider' | 'admin';
  isVerified: boolean;
  profileCompleted: boolean;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

// Order types
export type OrderStatus =
  | 'pending'
  | 'rider_assigned'
  | 'en_route'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export type DeliveryMode = 'standard' | 'priority';
export type PaymentMethod = 'wallet' | 'card' | 'bank_transfer';

export interface Order {
  id: string;
  orderNumber: string;
  consumerId: string;
  riderId?: string;
  fuelQuantity: number;
  pricePerLiter: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryMode: DeliveryMode;
  deliveryAddressId: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  status: OrderStatus;
  confirmationCode?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  deliveryAddress?: Address;
  consumer?: Partial<User>;
  rider?: Partial<User>;
}

// Address types
export interface Address {
  id: string;
  userId: string;
  label: 'Home' | 'Office' | 'Other';
  addressLine: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Wallet types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'top_up' | 'debit' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  paymentReference?: string;
  description?: string;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}
