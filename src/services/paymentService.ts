import { publicAxios } from '../configs/axios';
import {
  TokenPackage,
  SubscriptionPlan,
  Transaction,
  TokenPurchaseRequest,
  SubscriptionRequest,
  PaymentResponse,
  TransactionHistoryResponse
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

// Get transaction history
export const getTransactionHistory = async (
  page: number = 1,
  limit: number = 10
): Promise<TransactionHistoryResponse> => {
  try {
    // TODO: Replace with actual API call
    // const response = await publicAxios.get(`/store/transactions?page=${page}&limit=${limit}`);
    // return response.data;

    // Mock implementation
    const MOCK_TRANSACTIONS: Transaction[] = [
      {
        id: `txn_${Date.now()}`,
        type: 'token_purchase',
        amount: 39.99,
        currency: 'USD',
        description: 'Purchased 50 tokens',
        status: 'completed',
        createdAt: new Date().toISOString(),
        paymentMethod: 'Credit Card',
        referenceId: 'pkg_popular',
      },
      {
        id: `sub_${Date.now() - 86400000}`,
        type: 'subscription',
        amount: 19.99,
        currency: 'USD',
        description: 'Premium Monthly Subscription',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        paymentMethod: 'Credit Card',
        referenceId: 'premium_monthly',
      },
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'Transaction history fetched successfully',
          data: {
            transactions: MOCK_TRANSACTIONS,
            totalCount: MOCK_TRANSACTIONS.length,
            currentPage: page,
            totalPages: 1,
          },
        });
      }, 500);
    });
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    throw error;
  }
};
