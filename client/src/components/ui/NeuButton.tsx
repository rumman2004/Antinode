import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, Animated } from 'react-native';

interface NeuButtonProps extends TouchableOpacityProps {
  title: string;
}

const NeuButton = ({ title, style, ...props }: NeuButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    props.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    props.onPressOut?.(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, style]}
        {...props}
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default NeuButton;
