import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import LoginScreen from './src/screens/Login/LoginScreen';
import SignUpScreen from './src/screens/SignUp/SignUpScreen';
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
    return null; // or a loading screen
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        {isLoggedIn ? (
          <TabNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
