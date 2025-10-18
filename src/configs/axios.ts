import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokenApi } from '../services/authService';
import { RefreshTokenRequest } from '../types/authTypes';

const API_URL = process.env.EXPO_PUBLIC_API_URL; // Use EXPO_PUBLIC_API_URL for Expo

// Main axios instance with authentication interceptor
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});

// Public axios instance without authentication (for public endpoints)
export const publicAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});


// Add request interceptor to automatically add token
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken'); // Changed to accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration and refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is due to token expiration (401) and not already retried
        // Also skip refresh for the refresh token endpoint itself to avoid infinite loop
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh-token')) {
            originalRequest._retry = true;

            try {
                // Get current token for refresh
                const currentToken = await AsyncStorage.getItem('accessToken');

                if (!currentToken) {
                    console.log('No token found for refresh');
                    await AsyncStorage.removeItem('accessToken');
                    return Promise.reject(error);
                }

                const refreshRequest: RefreshTokenRequest = {
                    token: currentToken
                };

                const refreshResponse = await refreshTokenApi(refreshRequest);

                if (refreshResponse.data.authenticated && refreshResponse.data.token) {
                    // Update token in AsyncStorage
                    await AsyncStorage.setItem('accessToken', refreshResponse.data.token);

                    // Update authorization header in original request
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;

                    console.log('Token refreshed successfully, retrying original request');

                    // Retry the original request with new token
                    return axiosInstance(originalRequest);
                } else {
                    console.log('Token refresh failed - invalid response');
                    await AsyncStorage.removeItem('accessToken');
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
                await AsyncStorage.removeItem('accessToken');
                console.log('Authentication failed - user needs to login again');
                return Promise.reject(refreshError);
            }
        }

        // For other errors, log detailed error information and reject
        console.error('API Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            fullError: error
        });
        return Promise.reject(error);
    }
);

export default axiosInstance;
