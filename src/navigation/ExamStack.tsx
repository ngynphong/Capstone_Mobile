import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExamStackParamList } from '../types/examTypes';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Import all exam screens
import ExamLibraryScreen from '../screens/Exam/ExamLibraryScreen';
import ExamDetailScreen from '../screens/Exam/ExamDetailScreen';
import PracticeModeScreen from '../screens/Exam/PracticeModeScreen';
import FlashCardScreen from '../screens/Exam/FlashCardScreen';
import QuizScreen from '../screens/Exam/QuizScreen';
import FRQScreen from '../screens/Exam/FRQScreen';
import FullTestScreen from '../screens/Exam/FullTestScreen';
import TestResultsScreen from '../screens/Exam/TestResultsScreen';

const Stack = createNativeStackNavigator<ExamStackParamList>();

// Wrapper component to add ErrorBoundary to FullTestScreen
const FullTestScreenWithErrorBoundary = (props: any) => (
  <ErrorBoundary>
    <FullTestScreen {...props} />
  </ErrorBoundary>
);

const ExamStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ExamLibrary" component={ExamLibraryScreen} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="PracticeMode" component={PracticeModeScreen} />
      <Stack.Screen name="FlashCard" component={FlashCardScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="FRQ" component={FRQScreen} />
      <Stack.Screen name="FullTest" component={FullTestScreenWithErrorBoundary} />
      <Stack.Screen name="TestResults" component={TestResultsScreen} />
    </Stack.Navigator>
  );
};

export default ExamStack;

