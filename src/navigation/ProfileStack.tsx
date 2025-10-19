import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ExamResultsScreen from '../screens/Profile/ExamResultsScreen';
import ExamResultDetailScreen from '../screens/Profile/ExamResultDetailScreen';
import StoreScreen from '../screens/Store/StoreScreen';
import { ProfileStackParamList } from '../types/types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ExamResults" component={ExamResultsScreen} />
      <Stack.Screen name="ExamResultDetail" component={ExamResultDetailScreen} />
      <Stack.Screen name="Store" component={StoreScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
