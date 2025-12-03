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

// Transaction History Response
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

// API /api/transactions - toàn bộ giao dịch (admin / thống kê)
export interface TransactionsResponse {
  code: number;
  message: string;
  data: Transaction[];
}

// API /api/token-transaction/user - lịch sử giao dịch theo user hiện tại
export interface UserTokenTransactionsResponse {
  code: number;
  message: string;
  data: Transaction[];
}

// API /payment/momo/create - tạo giao dịch thanh toán MoMo
export interface MomoCreateRequest {
  amount: number;
  orderInfo: string;
  extraData?: string;
}

export interface MomoCreateResponse {
  code: number;
  message: string;
  data: {
    payUrl: string;
    deeplink?: string;
    orderId: string;
    requestId: string;
  };
}

// Store Screen State
export interface StoreState {
  tokenBalance: number;
  currentSubscription?: SubscriptionPlan;
  isLoading: boolean;
  error?: string;
}
