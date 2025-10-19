import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '../types/communityTypes';
import CommunityScreen from '../screens/Community/CommunityScreen';
import StudyGroupDetailScreen from '../screens/Community/StudyGroupDetailScreen';
import PostDetailScreen from '../screens/Community/PostDetailScreen';
import MembersScreen from '../screens/Community/MembersScreen';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

const CommunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      <Stack.Screen name="StudyGroupDetail" component={StudyGroupDetailScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Members" component={MembersScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStack;
