import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FlashcardStackParamList } from '../types/types';

import FlashcardScreen from '../screens/Flashcard/FlashcardScreen';
import FlashcardDetailScreen from '../screens/Flashcard/FlashcardDetailScreen';
import FlashcardQuizScreen from '../screens/Flashcard/FlashcardQuizScreen';

const Stack = createNativeStackNavigator<FlashcardStackParamList>();

const FlashcardStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="FlashcardMain" component={FlashcardScreen} />
            <Stack.Screen name="FlashcardDetail" component={FlashcardDetailScreen} />
            <Stack.Screen name="FlashcardQuiz" component={FlashcardQuizScreen} />
        </Stack.Navigator>
    );
};

export default FlashcardStack;
