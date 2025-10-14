import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slide from './Slide';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';

const slides = [
  {
    key: '1',
    title: 'Welcome to the App!',
    description: 'This is a brief introduction to the features of our application.',
  },
  {
    key: '2',
    title: 'Track Your Progress',
    description: 'Monitor your learning and see how you are improving over time.',
  },
  {
    key: '3',
    title: 'Get Started',
    description: 'Create an account or log in to start your learning journey.',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const renderItem = ({ item }: { item: { title: string; description: string } }) => {
    return <Slide title={item.title} description={item.description} />;
  };

  const renderPagination = () => {
   
    return null;
  };

  const onGetStarted = async () => {
    try {
      await AsyncStorage.setItem('onboardingViewed', 'true');
      navigation.navigate('Login');
    } catch (e) {
      console.error('Error saving onboarding status', e);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
      />
      {renderPagination()}
      <View className="absolute bottom-12 w-full px-5">
        <TouchableOpacity
          className="bg-backgroundColor py-3 px-6 rounded-lg items-center"
          onPress={onGetStarted}
        >
          <Text className="text-white font-semibold text-base">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;
