import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ExamResultsScreen from '../screens/Profile/ExamResultsScreen';
import ExamResultDetailScreen from '../screens/Profile/ExamResultDetailScreen';
import StudentExamStatsScreen from '../screens/Profile/StudentExamStatsScreen';
import StudentFinancialStatsScreen from '../screens/Profile/StudentFinancialStatsScreen';
import StoreScreen from '../screens/Store/StoreScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import SystemNotificationScreen from '../screens/Notification/SystemNotificationScreen';
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
      <Stack.Screen name="StudentExamStats" component={StudentExamStatsScreen} />
      <Stack.Screen name="StudentFinancialStats" component={StudentFinancialStatsScreen} />
      <Stack.Screen name="Store" component={StoreScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="SystemNotifications" component={SystemNotificationScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;

