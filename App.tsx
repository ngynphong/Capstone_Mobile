import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastProvider } from 'react-native-toast-notifications';
// import { StatusBar } from 'expo-status-bar';

import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import LoginScreen from './src/screens/Login/LoginScreen';
import SignUpScreen from './src/screens/SignUp/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPassword/ForgotPasswordScreen';
import VerifyOTPScreen from './src/screens/VerifyOTP/VerifyOTPScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { RootStackParamList } from './src/types/types';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent: React.FC = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    AsyncStorage.getItem('onboardingViewed').then(value => {
      if (value === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch === null) {
    return null; 
  }

  return (
    <>
      <NavigationContainer key={isLoggedIn ? 'loggedIn' : 'loggedOut'}> 
        {isLoggedIn ? (
          <TabNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      animationDuration={250}
      successColor="#4CAF50"
      dangerColor="#F44336"
      warningColor="#FF9800"
      normalColor="#2196F3"
      textStyle={{ fontSize: 16 }}
      offset={50}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
