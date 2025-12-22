import axiosInstance from '../configs/axios';
import {
  TokenPackage,
  SubscriptionPlan,
  Transaction,
  TokenPurchaseRequest,
  SubscriptionRequest,
  PaymentResponse,
  TransactionHistoryResponse,
  TransactionsResponse,
  UserTokenTransactionsResponse,
  MomoCreateResponse,
  PaymentsByUserResponse,
  WalletTransaction,
} from '../types/storeTypes';

// Mock data for development - replace with actual API calls
const MOCK_TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    tokenAmount: 10,
    price: 9.99,
    currency: 'USD',
    description: 'Perfect for trying out our features',
  },
  {
    id: 'popular',
    name: 'Popular Package',
    tokenAmount: 50,
    price: 39.99,
    currency: 'USD',
    description: 'Most popular choice',
    popular: true,
    discount: 20,
  },
  {
    id: 'premium',
    name: 'Premium Package',
    tokenAmount: 100,
    price: 69.99,
    currency: 'USD',
    description: 'Best value for heavy users',
    discount: 30,
  },
];

const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    type: 'free',
    duration: 'monthly',
    price: 0,
    currency: 'USD',
    features: [
      '5 practice exams per month',
      'Basic study materials',
      'Community access',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    type: 'premium',
    duration: 'monthly',
    price: 19.99,
    currency: 'USD',
    features: [
      'Unlimited practice exams',
      'All study materials',
      'Priority support',
      'Advanced analytics',
      'Offline access',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    type: 'premium',
    duration: 'yearly',
    price: 199.99,
    currency: 'USD',
    features: [
      'Unlimited practice exams',
      'All study materials',
      'Priority support',
      'Advanced analytics',
      'Offline access',
      '2 months free!',
    ],
    discount: 17,
  },
];

// Get available token packages
export const getTokenPackages = async (): Promise<TokenPackage[]> => {
  try {
    // TODO: Replace with actual API call
    // const response = await publicAxios.get('/store/token-packages');
    // return response.data.data;

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_TOKEN_PACKAGES);
      }, 500);
    });
  } catch (error) {
    console.error('Failed to fetch token packages:', error);
    throw error;
  }
};

// Get available subscription plans
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    // TODO: Replace with actual API call
    // const response = await publicAxios.get('/store/subscription-plans');
    // return response.data.data;

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_SUBSCRIPTION_PLANS);
      }, 500);
    });
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    throw error;
  }
};

// Purchase tokens
export const purchaseTokens = async (request: TokenPurchaseRequest): Promise<PaymentResponse> => {
  try {
    // TODO: Replace with actual API call
    // const response = await publicAxios.post('/store/purchase-tokens', request);
    // return response.data;

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'Token purchase initiated successfully',
          data: {
            transactionId: `txn_${Date.now()}`,
            status: 'pending',
            redirectUrl: `https://payment.example.com/${Date.now()}`,
          },
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Failed to purchase tokens:', error);
    throw error;
  }
};

// Subscribe to plan
export const subscribeToPlan = async (request: SubscriptionRequest): Promise<PaymentResponse> => {
  try {
    // TODO: Replace with actual API call
    // const response = await publicAxios.post('/store/subscribe', request);
    // return response.data;

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'Subscription initiated successfully',
          data: {
            transactionId: `sub_${Date.now()}`,
            status: 'pending',
            redirectUrl: `https://payment.example.com/${Date.now()}`,
          },
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Failed to subscribe to plan:', error);
    throw error;
  }
};

// Get transaction history cho user hiện tại - dùng API /api/token-transaction/user
export const getTransactionHistory = async (
  page: number = 1,
  limit: number = 10,
): Promise<TransactionHistoryResponse> => {
  try {
    const response = await axiosInstance.get<UserTokenTransactionsResponse>(
      '/api/token-transaction/user',
    );
    const body = response.data;
    
    // Xử lý cả trường hợp data là array hoặc object
    const walletTransactions = Array.isArray(body.data) 
      ? body.data 
      : body.data 
        ? [body.data] 
        : [];
    
    const list: Transaction[] = walletTransactions.map((wt) => ({
      id: wt.id,
      type: (wt.type?.name === 'subscription' ? 'subscription' : wt.type?.name === 'refund' ? 'refund' : 'token_purchase') as Transaction['type'],
      amount: wt.amount,
      currency: 'VND', // Default currency for wallet transactions
      description: wt.description ?? '',
      status: (['pending', 'completed', 'failed', 'cancelled'].includes(wt.status) ? wt.status : 'pending') as Transaction['status'],
      createdAt: wt.createdAt,
      referenceId: wt.externalReference,
    }));

    return {
      code: body.code ?? 1000,
      message: body.message ?? 'OK',
      data: {
        transactions: list,
        totalCount: list.length,
        currentPage: page,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    throw error;
  }
};

// Lấy toàn bộ transactions (nếu cần cho admin / thống kê) - API /api/transactions
export const getAllTransactions = async (): Promise<WalletTransaction[]> => {
  try {
    const response = await axiosInstance.get<TransactionsResponse>('/api/transactions');
    // API trả về array trực tiếp hoặc có thể wrap trong response.data
    const transactions = Array.isArray(response.data) 
      ? response.data 
      : (response.data as any)?.data || [];
    return transactions;
  } catch (error) {
    console.error('Failed to fetch all transactions:', error);
    throw error;
  }
};

// Tạo giao dịch thanh toán MoMo - API /payment/momo/create?amount=
export const createMomoPayment = async (
  amount: number,
): Promise<MomoCreateResponse> => {
  const response = await axiosInstance.post<MomoCreateResponse>(
    '/payment/momo/create',
    null,
    { params: { amount } },
  );
  return response.data;
};

// Lấy payments theo user hiện tại - API GET /payments/by-user
export const getPaymentsByUser = async (): Promise<PaymentsByUserResponse> => {
  try {
    const response = await axiosInstance.get<PaymentsByUserResponse>(
      '/payments/by-user',
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payments by user:', error);
    throw error;
  }
};

// Transfer from parent to student - API POST /payments/transfer-parent-to-student
export const transferParentToStudent = async (
  parentId: string,
  studentId: string,
  amount: number,
): Promise<PaymentResponse> => {
  try {
    const response = await axiosInstance.post<PaymentResponse>(
      '/payments/transfer-parent-to-student',
      null,
      { params: { parentId, studentId, amount } },
    );
    return response.data;
  } catch (error) {
    console.error('Failed to transfer to student:', error);
    throw error;
  }
};