import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, BookOpen, User, FileText, Users, Route } from 'lucide-react-native';
import HomeStack from './HomeStack';

import ExamScreen from '../screens/Exam/ExamScreen';
import { TabParamList } from '../types/types';
import { useScroll } from '../context/ScrollContext';
import MaterialsStack from './MaterialsStack';
import ProfileStack from './ProfileStack';
import CommunityStack from './CommunityStack';

import RoadmapScreen from '../screens/Roadmap/RoadmapScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const { width } = Dimensions.get('window');
// Đảm bảo tab bar không vượt quá màn hình, để margin 20px mỗi bên
const TAB_BAR_WIDTH = width - 40;

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  // Debug: Log số lượng routes
  React.useEffect(() => {
    console.log('=== TAB BAR DEBUG ===');
    console.log('Total routes:', state.routes.length);
    console.log('Route names:', state.routes.map((r: any) => r.name));
    console.log('Current index:', state.index);
  }, [state.routes, state.index]);

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
    Community: Users,
    Roadmap: Route,
    Profile: User,
  };

  const labelMap = {
    Home: 'Home',
    Materials: 'Materials',
    Exams: 'Exams',
    Community: 'Groups',
    Roadmap: 'Roadmap',
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
      <View style={{ borderRadius: 24, overflow: 'hidden' }}>
        <BlurView
          intensity={25}
          tint="light"
          className="border border-white/30 shadow-lg"
          style={{
            width: TAB_BAR_WIDTH,
            height: 54,
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              height: '100%',
              paddingHorizontal: 2,
            }}
          >
            {state.routes.map((route: any, index: number) => {
              const isActive = state.index === index;
              const IconComponent = iconMap[route.name as keyof typeof iconMap];

              const scaleValue = animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              });

              const opacityValue = animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              });

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => {
                    try {
                      navigation.navigate(route.name);
                    } catch (e) {
                      console.error('Navigation error when pressing tab:', route.name, e);
                    }
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: [{ scale: scaleValue }],
                      opacity: opacityValue,
                    }}
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -3,
                          width: 20,
                          height: 2,
                          backgroundColor: '#3CBCB2',
                          borderRadius: 1,
                        }}
                      />
                    )}

                    {/* Icon container */}
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 3,
                        borderRadius: 8,
                        backgroundColor: isActive ? 'rgba(60, 188, 178, 0.15)' : 'transparent',
                      }}
                    >
                      <IconComponent
                        size={16}
                        color={isActive ? '#3CBCB2' : '#9CA3AF'}
                        fill={isActive ? '#3CBCB2' : 'none'}
                        strokeWidth={isActive ? 0 : 1.5}
                      />
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
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
      <Tab.Screen name="Home" component={HomeStack} />

      <Tab.Screen name="Roadmap" component={RoadmapScreen} />
      <Tab.Screen name="Exams" component={ExamScreen} />
      <Tab.Screen name="Materials" component={MaterialsStack} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
