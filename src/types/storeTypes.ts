// Store & Subscriptions Types

// Token Package Definition
export interface TokenPackage {
  id: string;
  name: string;
  tokenAmount: number;
  price: number;
  currency: string;
  description?: string;
  popular?: boolean;
  discount?: number; // Percentage discount
}

// Subscription Plan Definition
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'premium';
  duration: 'monthly' | 'yearly';
  price: number;
  currency: string;
  features: string[];
  maxExams?: number;
  maxPracticeTests?: number;
  prioritySupport?: boolean;
  discount?: number;
}

// Transaction Record
export interface Transaction {
  id: string;
  type: 'token_purchase' | 'subscription' | 'refund';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  paymentMethod?: string;
  referenceId?: string;
}

// Payment Request Types
export interface TokenPurchaseRequest {
  packageId: string;
  paymentMethod: string;
}

export interface SubscriptionRequest {
  planId: string;
  paymentMethod: string;
}

// Payment Response Types
export interface PaymentResponse {
  code: number;
  message: string;
  data: {
    transactionId: string;
    status: string;
    redirectUrl?: string;
  };
}

// Transaction History Response (UI đang dùng)
export interface TransactionHistoryResponse {
  code: number;
  message: string;
  data: {
    transactions: Transaction[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

// Transaction theo schema của API ví (token-transaction)
export interface WalletTransaction {
  id: string;
  amount: number;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  balanceAfter?: number;
  externalReference?: string;
  errorMessage?: string;
  userId?: string;
  type?: {
    id: string;
    name: string;
    description?: string;
  };
}

// API /api/transactions - toàn bộ giao dịch (trả về array thuần)
export type TransactionsResponse = WalletTransaction[];

// API /api/token-transaction/user - lịch sử giao dịch theo user hiện tại
export interface UserTokenTransactionsResponse {
  code: number;
  message: string;
  data: WalletTransaction[];
}

// API /payment/momo/create - tạo giao dịch thanh toán MoMo (query: amount)
export type MomoCreateResponse = Record<string, unknown>;

// API /payments/by-user - lấy payments theo user
export interface PaymentsByUserResponse {
  code: number;
  message: string;
  data: Record<string, unknown>;
}

// Store Screen State
export interface StoreState {
  tokenBalance: number;
  currentSubscription?: SubscriptionPlan;
  isLoading: boolean;
  error?: string;
}
