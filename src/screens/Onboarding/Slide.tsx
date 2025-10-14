import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';

type SlideProps = {
  title: string;
  description: string;
};

const Slide: React.FC<SlideProps> = ({ title, description }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width: width || '100%' }} className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-2 text-center">{title}</Text>
      <Text className="text-base text-center">{description}</Text>
    </View>
  );
};

export default Slide;