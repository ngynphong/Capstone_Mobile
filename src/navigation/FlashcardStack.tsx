import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FlashcardStackParamList } from '../types/types';

import FlashcardScreen from '../screens/Flashcard/FlashcardScreen';
import FlashcardDetailScreen from '../screens/Flashcard/FlashcardDetailScreen';
import FlashcardQuizScreen from '../screens/Flashcard/FlashcardQuizScreen';
import MyFlashcardsScreen from '../screens/Flashcard/MyFlashcardsScreen';
import FlashcardCreateScreen from '../screens/Flashcard/FlashcardCreateScreen';
import FlashcardEditScreen from '../screens/Flashcard/FlashcardEditScreen';

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
            <Stack.Screen name="MyFlashcards" component={MyFlashcardsScreen} />
            <Stack.Screen name="FlashcardCreate" component={FlashcardCreateScreen} />
            <Stack.Screen name="FlashcardEdit" component={FlashcardEditScreen} />
        </Stack.Navigator>
    );
};

export default FlashcardStack;

