import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginApi,
  registerApi,
  verifyEmailApi,
} from '../services/authService';
import {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from '../types/authTypes';

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  dob?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  verifyEmail: (verificationData: VerifyEmailRequest) => Promise<boolean>;
  logout: () => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
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

  useEffect(() => {
    console.log('AuthContext - isLoggedIn changed:', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
        // Giả sử nếu có token là đã đăng nhập.
        // Bạn có thể thêm logic gọi API để xác thực token ở đây nếu cần.
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false); // Kết thúc loading sau khi kiểm tra xong
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      if (response.data.authenticated) {
        const newUser: User = {
          email: credentials.email,
          firstName: '',
          lastName: '',
          roles: response.data.roles,
        };
        setUser(newUser);
        setIsLoggedIn(true);
        console.log('Login API Response Data:', response.data);
        await storeTokens(response.data.token);
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
      setIsLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};
