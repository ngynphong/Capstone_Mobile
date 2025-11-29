import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialsScreen from '../screens/Materials/MaterialsScreen';
import MaterialDetailScreen from '../screens/Materials/MaterialDetailScreen';
import type { MaterialStackParamList } from '../types/types';

const Stack = createNativeStackNavigator<MaterialStackParamList>();

const MaterialsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MaterialMain" component={MaterialsScreen} />
      <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
    </Stack.Navigator>
  );
};

export default MaterialsStack;

