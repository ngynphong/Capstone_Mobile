import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginApi,
  registerApi,
  verifyEmailApi,
  refreshTokenApi,
} from '../services/authService';
import { getUserProfile } from '../services/userService';
import {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  RefreshTokenRequest,
} from '../types/authTypes';
import { UserProfile } from '../types/userTypes';

export interface User extends UserProfile {}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  verifyEmail: (verificationData: VerifyEmailRequest) => Promise<boolean>;
  logout: () => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('AuthContext - isLoggedIn changed:', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto refresh token every 30 minutes
  useEffect(() => {
    if (isLoggedIn) {
      const timer = setInterval(() => {
        refreshToken();
      }, 30 * 60 * 1000); // 30 minutes

      setRefreshTimer(timer);

      // Cleanup timer on unmount
      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    } else {
      // Clear timer when user logs out
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
    }
  }, [isLoggedIn]);

  const storeTokens = async (token: string) => {
    await AsyncStorage.setItem('accessToken', token);
    // await AsyncStorage.setItem('refreshToken', refreshToken);
  };

  const getTokens = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    // const refreshToken = await AsyncStorage.getItem('refreshToken');
    return { accessToken }; // Removed refreshToken
  };

  const clearTokens = async () => {
    await AsyncStorage.removeItem('accessToken');
    // await AsyncStorage.removeItem('refreshToken');
  };

  const checkAuthStatus = async () => {
    try {
      const { accessToken } = await getTokens();
      if (accessToken) {
        setIsLoggedIn(true);
        // Fetch user profile when app starts and user is already logged in
        try {
          await fetchUserProfile();
        } catch (error) {
          console.error('Failed to fetch user profile on app start:', error);
        }
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false); // Kết thúc loading sau khi kiểm tra xong
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    try {
      const response = await getUserProfile();

      // API returns { code, data, message }, we need the data part
      let userProfile: UserProfile;
      if (response && typeof response === 'object' && 'data' in response) {
        // Response has { code, data, message } format
        userProfile = response.data as UserProfile;
      } else {
        // Response is directly the user profile
        userProfile = response as UserProfile;
      }

      setUser(userProfile);
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      // Don't logout user if profile fetch fails, just keep them logged in
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      if (response.data.authenticated) {
        // Store token first
        await storeTokens(response.data.token);

        // Fetch complete user profile
        try {
          await fetchUserProfile();
        } catch (profileError) {
          // If profile fetch fails, create basic user object
          const basicUser: User = {
            id: '',
            email: credentials.email,
            firstName: '',
            lastName: '',
            dob: '',
            roles: response.data.roles,
          };
          setUser(basicUser);
        }

        setIsLoggedIn(true);
        console.log('Login API Response Data:', response.data);
        return true;
      }
      return false;
    } catch (error) {
      // console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await registerApi(userData);
     
      if (response.data.id) {
       
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (verificationData: VerifyEmailRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await verifyEmailApi(verificationData);
      if (response.data) {
        // Email successfully verified
        return true;
      }
      return false;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await clearTokens();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const { accessToken } = await getTokens();
      if (!accessToken) {
        console.log('No access token found, cannot refresh');
        return;
      }

      const refreshRequest: RefreshTokenRequest = {
        token: accessToken
      };

      // Use publicAxios directly to avoid interceptor
      const { publicAxios } = await import('../configs/axios');
      const response = await publicAxios.post('/auth/refresh-token', refreshRequest);

      if (response.data.authenticated && response.data.token) {
        // Update token in AsyncStorage (using same key as requested)
        await storeTokens(response.data.token);
        console.log('Token refreshed successfully');
      } else {
        console.log('Token refresh failed - invalid response');
        // If refresh fails, logout user
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const refreshUser = async () => {
    await fetchUserProfile();
  };

  if (isLoading) {
    // Bạn có thể hiển thị một màn hình chờ (splash screen) ở đây
    return null;
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      isLoading,
      login,
      register,
      verifyEmail,
      logout,
      setIsLoggedIn,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
