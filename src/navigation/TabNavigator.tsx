import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, BookOpen, User, FileText } from 'lucide-react-native';
import HomeScreen from '../screens/Home/HomeScreen';

import ProfileScreen from '../screens/Profile/ProfileScreen';
import ExamScreen from '../screens/Exam/ExamScreen';
import { TabParamList } from '../types/types';
import { useScroll } from '../context/ScrollContext';
import MaterialsScreen from '../screens/Materials/MaterialsScreen';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator<TabParamList>();

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width * 0.9;
const TAB_WIDTH = TAB_BAR_WIDTH / 4;

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const animatedValues = React.useRef(state.routes.map(() => new Animated.Value(0))).current;
  const { tabBarTranslateY } = useScroll();

  React.useEffect(() => {
    // Animate to active state
    Animated.spring(animatedValues[state.index], {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();

    // Animate inactive states back to 0
    state.routes.forEach((_: any, index: number) => {
      if (index !== state.index) {
        Animated.spring(animatedValues[index], {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
      }
    });
  }, [state.index]);

  const iconMap = {
    Home: Home,
    Materials: BookOpen,
    Exams: FileText,
    Profile: User,
  };

  const labelMap = {
    Home: 'Home',
    Materials: 'Materials',
    Exams: 'Exams',
    Profile: 'Profile',
  };

  return (
    <Animated.View
      className="absolute bottom-6 left-1/2"
      style={{
        transform: [
          { translateX: -TAB_BAR_WIDTH / 2 },
          { translateY: tabBarTranslateY }
        ],
      }}
    >
      <BlurView
        intensity={25}
        tint="light"
        className="border border-white/30 shadow-lg"
        style={{
          width: TAB_BAR_WIDTH,
          height: 70,
          backgroundColor: 'rgba(255, 255, 255, 0.10)',
          borderRadius: 24, // rounded-3xl equivalent
        }}
      >
        <View className="flex-row items-center justify-around bg-white rounded-3xl h-full px-2">
          {state.routes.map((route: any, index: number) => {
            const isActive = state.index === index;
            const IconComponent = iconMap[route.name as keyof typeof iconMap];

            const scaleValue = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            });

            const opacityValue = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            });

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                className="items-center justify-center "
                style={{ width: TAB_WIDTH }}
              >
                <Animated.View
                  className="items-center justify-center"
                  style={{
                    transform: [{ scale: scaleValue }],
                    opacity: opacityValue,
                  }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <View className="absolute -top-1 w-8 h-1 bg-teal-400 rounded-full" />
                  )}

                  {/* Icon container with pill background for active state */}
                  <View
                    className={`items-center justify-center p-2 rounded-xl ${
                      isActive ? 'bg-teal-400/20' : ''
                    }`}
                  >
                    <IconComponent
                      size={22}
                      color={isActive ? '#3CBCB2' : '#9CA3AF'}
                      fill={isActive ? '#3CBCB2' : 'none'}
                      strokeWidth={isActive ? 0 : 1.5}
                    />
                  </View>

                  {/* Active label */}
                  {isActive && (
                    <Text
                      className="text-xs font-medium text-gray-700 mt-1"
                      style={{
                        color: '#3CBCB2',
                        fontFamily: 'System',
                      }}
                    >
                      {labelMap[route.name as keyof typeof labelMap]}
                    </Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,       
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Materials" component={MaterialsScreen} />
      <Tab.Screen name="Exams" component={ExamScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
