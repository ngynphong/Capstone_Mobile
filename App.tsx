import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastProvider } from 'react-native-toast-notifications';
// import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/Login/LoginScreen';
import SignUpScreen from './src/screens/SignUp/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPassword/ForgotPasswordScreen';
import VerifyOTPScreen from './src/screens/VerifyOTP/VerifyOTPScreen';
import TabNavigator from './src/navigation/TabNavigator';
import ParentTabNavigator from './src/navigation/ParentTabNavigator';
import ChatBotScreen from './src/screens/ChatBotScreen';
import LoadingScreen from './src/components/LoadingScreen';
import { RootStackParamList } from './src/types/types';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ScrollProvider } from './src/context/ScrollContext';

// Disable console logs in production
if (!__DEV__) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
  console.info = () => { };
  console.debug = () => { };
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent: React.FC = () => {
  const { isLoggedIn, isLoading, user } = useAuth();

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen />;
  }

  const isParent = user?.roles?.includes('PARENT');


  return (
    <>
      <NavigationContainer>
        {isLoggedIn ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isParent ? (
              <>
                <Stack.Screen name="MainTabs" component={ParentTabNavigator} />
                <Stack.Screen name="ChatBot" component={ChatBotScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="ChatBot" component={ChatBotScreen} />
              </>
            )}
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        <ScrollProvider>
          <AppContent />
        </ScrollProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
