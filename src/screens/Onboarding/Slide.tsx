import React from 'react';
import { View, Text, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Target, Trophy, Users, Zap, Award } from 'lucide-react-native';

type SlideProps = {
  title: string;
  description: string;
  index: number;
};

const Slide: React.FC<SlideProps> = ({ title, description, index }) => {
  const { width, height } = useWindowDimensions();

  const getIcon = (index: number) => {
    const icons = [BookOpen, Target, Trophy, Users];
    const IconComponent = icons[index] || BookOpen;
    return IconComponent;
  };

  const getGradient = (index: number): readonly [string, string] => {
    const gradients: readonly [string, string][] = [
      ['#3CBCB2', '#2E8B8B'], // Teal gradient
      ['#667eea', '#764ba2'], // Purple gradient
      ['#f093fb', '#f5576c'], // Pink gradient
      ['#4facfe', '#00f2fe'], // Blue gradient
    ];
    return gradients[index] || gradients[0];
  };

  const IconComponent = getIcon(index);

  return (
    <View style={{ width: width || '100%' }} className="flex-1">
      <LinearGradient
        colors={getGradient(index)}
        className="flex-1 justify-center items-center p-6"
        style={{ width: '100%' }}
      >
        {/* Background Pattern */}
        <View className="absolute inset-0 opacity-10">
          <View className="w-full h-full">
            {/* Decorative circles */}
            <View className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white" />
            <View className="absolute top-40 right-20 w-24 h-24 rounded-full bg-white" />
            <View className="absolute bottom-32 left-20 w-20 h-20 rounded-full bg-white" />
            <View className="absolute bottom-48 right-10 w-28 h-28 rounded-full bg-white" />
          </View>
        </View>

        {/* Main Content */}
        <View className="items-center justify-center flex-1">
          {/* Icon Container */}
          <View className="mb-8">
            <View className="w-32 h-32 bg-white/30 rounded-full items-center justify-center">
              <IconComponent size={48} color="#FFFFFF" strokeWidth={1.5} />
            </View>
          </View>

          {/* Text Content */}
          <View className="items-center px-4">
            <Text className="text-3xl font-bold text-white text-center mb-4 leading-tight">
              {title}
            </Text>
            <Text className="text-lg text-white/90 text-center leading-relaxed max-w-sm">
              {description}
            </Text>
          </View>

          {/* Bottom Accent */}
          <View className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <View className="w-16 h-1 bg-white/40 rounded-full" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Slide;
