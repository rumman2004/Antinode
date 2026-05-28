import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface GsapRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  style?: ViewStyle;
}

/**
 * GSAP-inspired reveal wrapper using React Native Animated API.
 * Provides fade-in + slide animations on mount with configurable
 * direction and stagger delay for list items.
 */
const GsapReveal = ({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  style,
}: GsapRevealProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(getInitialOffset(direction))).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(translate, {
          toValue: 0,
          damping: 18,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const transform = getTransformStyle(direction, translate);

  return (
    <Animated.View style={[{ opacity }, transform, style]}>
      {children}
    </Animated.View>
  );
};

function getInitialOffset(direction: string): number {
  switch (direction) {
    case 'up':
      return 30;
    case 'down':
      return -30;
    case 'left':
      return 30;
    case 'right':
      return -30;
    case 'none':
      return 0;
    default:
      return 30;
  }
}

function getTransformStyle(direction: string, translate: Animated.Value) {
  switch (direction) {
    case 'up':
    case 'down':
      return { transform: [{ translateY: translate }] };
    case 'left':
    case 'right':
      return { transform: [{ translateX: translate }] };
    case 'none':
      return {};
    default:
      return { transform: [{ translateY: translate }] };
  }
}

export default GsapReveal;
