import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParentProfileStackParamList } from '../types/types';
import ParentProfileScreen from '../screens/Parent/ParentProfileScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';

const Stack = createNativeStackNavigator<ParentProfileStackParamList>();

const ParentProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ParentProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
        </Stack.Navigator>
    );
};

export default ParentProfileStack;
