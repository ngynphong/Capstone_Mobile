import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slide from './Slide';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Master AP Exams',
    description: 'Practice with thousands of real AP questions, detailed explanations, and comprehensive study guides to ace your exams.',
  },
  {
    key: '2',
    title: 'Track Your Progress',
    description: 'Monitor your performance with detailed analytics, identify weak areas, and watch your scores improve over time.',
  },
  {
    key: '3',
    title: 'Join the Community',
    description: 'Connect with fellow AP students, share study tips, and get motivated by the achievements of others.',
  },
  {
    key: '4',
    title: 'Achieve Excellence',
    description: 'Unlock your full potential with personalized learning paths and expert-curated content for every AP subject.',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: { key: string; title: string; description: string } }) => {
    const index = parseInt(item.key) - 1;
    return <Slide title={item.title} description={item.description} index={index} />;
  };

  const renderPagination = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              className="mx-2 bg-white rounded-full"
              style={{
                width: dotWidth,
                height: 8,
                opacity,
              }}
            />
          );
        })}
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const onSkip = () => {
    flatListRef.current?.scrollToIndex({
      index: slides.length - 1,
      animated: true,
    });
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
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Pagination */}
      <View className="absolute bottom-32 left-0 right-0">
        {renderPagination()}
      </View>

      {/* Bottom Controls */}
      <View className="absolute bottom-12 left-0 right-0 px-6">
        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity onPress={onGetStarted} className='flex px-4 py-6 rounded-2xl bg-backgroundColor items-center justify-center shadow-lg'>

            <Text className="text-white font-bold text-lg">Get Started</Text>

          </TouchableOpacity>
        ) : (
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onSkip}>
              <Text className="text-white/80 text-base font-medium">Skip</Text>
            </TouchableOpacity>

              <TouchableOpacity onPress={onNext} className='flex items-center justify-center py-3 px-6 rounded-xl shadow-lg bg-backgroundColor'>
             
                <Text className="text-white font-semibold text-base">Next</Text>
              
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;
