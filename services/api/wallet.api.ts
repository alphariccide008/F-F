import apiClient, { handleApiError } from './client';
import { ApiResponse, Wallet, Transaction } from '../../types/api';

/**
 * Get wallet balance
 */
export const getBalance = async (): Promise<{ balance: number; currency: string }> => {
  try {
    const response = await apiClient.get<ApiResponse>('/wallet/balance');

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get full wallet details
 */
export const getWallet = async (): Promise<Wallet> => {
  try {
    const response = await apiClient.get<ApiResponse<Wallet>>('/wallet');

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Initialize wallet top-up
 */
export const initializeTopUp = async (
  amount: number,
  paymentMethod: 'card' | 'bank_transfer' | 'ussd'
): Promise<{
  transaction: Transaction;
  paymentUrl: string;
  reference: string;
}> => {
  try {
    const response = await apiClient.post<ApiResponse>('/wallet/top-up', {
      amount,
      paymentMethod,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get transactions
 */
export const getTransactions = async (params?: {
  type?: 'top_up' | 'debit' | 'refund';
  status?: 'pending' | 'completed' | 'failed';
  page?: number;
  limit?: number;
}): Promise<{ transactions: Transaction[]; pagination: any }> => {
  try {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      '/wallet/transactions',
      { params }
    );

    return {
      transactions: response.data.data!,
      pagination: response.data.pagination!,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId: string): Promise<Transaction> => {
  try {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `/wallet/transactions/${transactionId}`
    );

    return response.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
