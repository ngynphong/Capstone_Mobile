import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MessageCircle, Bot } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ChatBotBubble = () => {
  const navigation = useNavigation();
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(bounce, 3000); // Repeat every 3 seconds
      });
    };
    bounce();
  }, [bounceAnim]);

  const handlePress = () => {
    navigation.navigate('ChatBot' as never);
  };

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      className="absolute bottom-28 right-6 z-50"
      style={{ transform: [{ translateY }] }}
    >
      <TouchableOpacity
        onPress={handlePress}
        className="bg-backgroundColor rounded-full p-4 shadow-xl"
        style={{
          shadowColor: '#3CBCB2',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className="relative">
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
            <Bot size={24} color="#3CBCB2" />
          </View>

          {/* Chat bubble tail */}
          <View className="absolute -bottom-2 right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-backgroundColor" />

          {/* Notification dot */}
          <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">?</Text>
          </View>
        </View>
      </TouchableOpacity>  
    </Animated.View>
  );
};

export default ChatBotBubble;
