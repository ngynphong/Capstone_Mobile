import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { Animated } from 'react-native';

interface ScrollContextType {
  isTabBarVisible: boolean;
  tabBarTranslateY: Animated.Value;
  handleScroll: (event: any) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

interface ScrollProviderProps {
  children: ReactNode;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
      return; // Ignore small scroll movements
    }

    if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      // Scrolling down and past threshold - hide tab bar
      if (isTabBarVisible) {
        setIsTabBarVisible(false);
        Animated.timing(tabBarTranslateY, {
          toValue: 100, // Hide tab bar by moving it down
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    } else if (currentScrollY < lastScrollY.current) {
      // Scrolling up - show tab bar
      if (!isTabBarVisible) {
        setIsTabBarVisible(true);
        Animated.timing(tabBarTranslateY, {
          toValue: 0, // Show tab bar by moving it back to original position
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }

    lastScrollY.current = currentScrollY;
  };

  const value: ScrollContextType = {
    isTabBarVisible,
    tabBarTranslateY,
    handleScroll,
  };

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = (): ScrollContextType => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
