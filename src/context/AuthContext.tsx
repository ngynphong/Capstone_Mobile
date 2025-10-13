import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'TUTOR' | 'PARENT';
  dob?: Date;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, dob: Date) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Fake authentication logic for testing
      const fakeUsers = [
        { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User', role: 'STUDENT' as const },
        { email: 'admin@test.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'ADMIN' as const },
        { email: 'teacher@test.com', password: 'teacher123', firstName: 'Teacher', lastName: 'User', role: 'TEACHER' as const },
        { email: 'tutor@test.com', password: 'tutor123', firstName: 'Tutor', lastName: 'User', role: 'TUTOR' as const },
        { email: 'parent@test.com', password: 'parent123', firstName: 'Parent', lastName: 'User', role: 'PARENT' as const },
      ];

      const foundUser = fakeUsers.find(user => user.email === email && user.password === password);

      if (foundUser) {
        const userData: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          role: foundUser.role,
        };
        setUser(userData);
        setIsLoggedIn(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, dob: Date): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Fake registration logic for testing
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        firstName,
        lastName,
        role: 'STUDENT', // Default role for new registrations
        dob,
      };

      setUser(newUser);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      isLoading,
      login,
      register,
      logout,
      setIsLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};
