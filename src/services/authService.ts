import { isAxiosError } from 'axios'; 
import api from './../configs/axios'; 
import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/authTypes';

const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error('API Error Details:', {
    error,
    response: isAxiosError(error) ? error.response : undefined, 
    message: error instanceof Error ? error.message : 'Unknown error',
  });

  if (isAxiosError(error) && error.response) { 
    const responseData = error.response.data;
    if (responseData && responseData.message) {
      throw new Error(responseData.message);
    }
    if (responseData && responseData.error) {
      throw new Error(responseData.error);
    }
  }
  throw new Error(defaultMessage);
};

export const loginApi = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/token', credentials); 
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Login failed'); 
  }
};

export const registerApi = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>('/users', userData); 
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Registration failed'); 
  }
};

export const verifyEmailApi = async (verificationData: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  try {
    const response = await api.post<VerifyEmailResponse>('/auth/verify-email', verificationData); 
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Email verification failed'); 
  }
};

export const refreshTokenApi = async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  try {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token', data); 
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Token refresh failed'); 
  }
};
