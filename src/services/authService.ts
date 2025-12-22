import { isAxiosError } from 'axios';
import api, { publicAxios } from './../configs/axios';
import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from '../types/authTypes';

const handleApiError = (error: unknown, defaultMessage: string): never => {
  // console.error('API Error Details:', {
  //   error,
  //   response: isAxiosError(error) ? error.response : undefined, 
  //   message: error instanceof Error ? error.message : 'Unknown error',
  // });

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
    const response = await api.post<RegisterResponse>('/auth/register', userData);
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
    const response = await publicAxios.post<RefreshTokenResponse>('/auth/refresh-token', data);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Token refresh failed');
  }
};

export const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to send password reset email');
  }
};

export const verifyOTPApi = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  try {
    const response = await api.post<VerifyOTPResponse>('/auth/verify-otp', data);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to verify OTP');
  }
};
