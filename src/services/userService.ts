import { isAxiosError } from 'axios';
import api from './../configs/axios';
import {
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/userTypes';

const handleApiError = (error: unknown, defaultMessage: string): never => {
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

/**
 * Get current user's profile information
 * GET /users/me
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>('/users/me');
    
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch user profile');
  }
};

/**
 * Update current user's profile information
 * PUT /users/me
 */
export const updateUserProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  try {
    const response = await api.put<UpdateProfileResponse>('/users/me', data);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update user profile');
  }
};

/**
 * Change user's password
 * POST /auth/change-password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post<ChangePasswordResponse>('/auth/change-password', data);
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to change password');
  }
};
