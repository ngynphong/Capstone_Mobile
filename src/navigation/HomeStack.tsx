import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import TeacherDetailScreen from '../screens/Home/TeacherDetailScreen';
import { HomeStackParamList } from '../types/types';
import NotificationScreen from '../screens/Notification/NotificationScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="TeacherDetail" component={TeacherDetailScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
        </Stack.Navigator>
    );
};

export default HomeStack;
