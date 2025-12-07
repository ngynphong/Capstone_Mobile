import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Users, FileText, User, BarChart3 } from 'lucide-react-native';
import { ParentTabParamList } from '../types/types';
import { useScroll } from '../context/ScrollContext';
import ParentDashboardScreen from '../screens/Parent/ParentDashboardScreen';
import ChildManagementScreen from '../screens/Parent/ChildManagementScreen';
import ChildProgressScreen from '../screens/Parent/ChildProgressScreen';
import ParentExamStatsScreen from '../screens/Parent/ParentExamStatsScreen';
import ParentProfileScreen from '../screens/Parent/ParentProfileScreen';

const Tab = createBottomTabNavigator<ParentTabParamList>();

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width * 0.9;
const TAB_WIDTH = TAB_BAR_WIDTH / 5; // 5 tabs for parents now

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const animatedValues = React.useRef(state.routes.map(() => new Animated.Value(0))).current;

  const { tabBarTranslateY } = useScroll();

  React.useEffect(() => {
    Animated.spring(animatedValues[state.index], {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();

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
    Dashboard: Home,
    Children: Users,
    Reports: FileText,
    ExamStats: BarChart3,
    Profile: User,
  };

  const labelMap = {
    Dashboard: 'Home',
    Children: 'Children',
    Reports: 'Reports',
    ExamStats: 'Stats',
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
            height: 70,
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
          }}
        >
          <View className="flex-row items-center justify-around h-full">
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
                  onPress={() => {
                    try {
                      navigation.navigate(route.name);
                    } catch (e) {
                      console.error('Navigation error when pressing tab:', route.name, e);
                    }
                  }}
                  className="items-center justify-center"
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
                      className={`items-center justify-center p-2 rounded-xl ${isActive ? 'bg-teal-400/20' : ''
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
      </View>
    </Animated.View>
  );
};

const ParentTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Children" component={ChildManagementScreen} />
      <Tab.Screen name="Reports" component={ChildProgressScreen} />
      <Tab.Screen name="ExamStats" component={ParentExamStatsScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
};

export default ParentTabNavigator;

