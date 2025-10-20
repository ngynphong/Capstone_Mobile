import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Preparing your AP exam experience..."
}) => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <View className="items-center justify-center px-5">
        {/* AP Logo/Branding Area */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-backgroundColor items-center justify-center mb-4 shadow-lg"
                style={{
                  shadowColor: '#3CBCB2',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}>
            <Text className="text-2xl font-bold text-white tracking-wider">AP</Text>
          </View>
          <Text className="text-lg font-semibold text-backgroundColor tracking-wide">ExamPrep Pro</Text>
        </View>

        {/* Loading Animation */}
        <View className="items-center mb-8">
          <ActivityIndicator size="large" color="#3CBCB2" />
          <Text className="mt-4 text-base text-gray-600 text-center leading-6">{message}</Text>
        </View>

        {/* Progress Dots */}
        <View className="flex-row items-center gap-2">
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-backgroundColor' : 'bg-gray-300'}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default LoadingScreen;
