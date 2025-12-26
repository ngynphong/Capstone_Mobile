import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParentProfileStackParamList } from '../types/types';
import ParentProfileScreen from '../screens/Parent/ParentProfileScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import SystemNotificationScreen from '../screens/Notification/SystemNotificationScreen';

const Stack = createNativeStackNavigator<ParentProfileStackParamList>();

const ParentProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ParentProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="SystemNotifications" component={SystemNotificationScreen} />
        </Stack.Navigator>
    );
};

export default ParentProfileStack;
