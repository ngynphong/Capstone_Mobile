import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import SubjectsScreen from '../screens/Subjects/SubjectsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { Text } from 'react-native';
import { TabParamList } from '../types/types';
import ExamScreen from '../screens/Exam/ExamScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>H</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Subjects"
        component={SubjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>S</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Exams"
        component={ExamScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>E</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>P</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
