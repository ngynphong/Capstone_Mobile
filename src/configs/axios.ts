import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
        if (error.response?.status === 401 && !originalRequest._retry) {

            originalRequest._retry = true;
           

            try {
               
                await AsyncStorage.removeItem('accessToken'); // Clear access token on 401
                
                console.log('Access token expired. User needs to re-login.');
                return Promise.reject(error); // Reject the original request
            } catch (refreshError) {
                
                await AsyncStorage.removeItem('accessToken'); // Changed from 'token' to 'accessToken'
                
                console.error('Token refresh failed:', refreshError);
                console.log('Authentication failed - user needs to login again');

               
                return Promise.reject(refreshError);
            } finally {
                
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
