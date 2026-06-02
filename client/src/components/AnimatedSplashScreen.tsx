import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { BookOpen } from 'lucide-react-native';

const AnimatedSplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const scaleValue = useRef(new Animated.Value(0.5)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const shineValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reveal logo
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Shine sweep effect
      Animated.timing(shineValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Hold briefly, then fade out everything
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacityValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(onFinish);
        }, 600);
      });
    });
  }, []);

  const shineTranslate = shineValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 200],
  });

  return (
    <View style={styles.container}>
      {/* Leather grain background */}
      <View style={styles.grainOverlay} />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <BookOpen size={64} color="#3E2B1E" strokeWidth={1.5} />
        
        {/* Animated Shine */}
        <Animated.View
          style={[
            styles.shine,
            { transform: [{ translateX: shineTranslate }, { rotate: '45deg' }] },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A3728', // Leather theme color
    justifyContent: 'center',
    alignItems: 'center',
  },
  grainOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FFF',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 36,
    backgroundColor: '#D4A03C', // Amber theme color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: -50,
    bottom: -50,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default AnimatedSplashScreen;
