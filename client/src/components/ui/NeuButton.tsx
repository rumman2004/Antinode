import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, Animated, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface NeuButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

const NeuButton = ({ title, style, variant = 'primary', ...props }: NeuButtonProps) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    props.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    props.onPressOut?.(e);
  };

  const getBg = () => {
    if (variant === 'danger') return colors.dangerRed;
    if (variant === 'secondary') return colors.cream;
    return colors.amber;
  };

  const getTextColor = () => {
    if (variant === 'secondary') return colors.text;
    if (variant === 'danger') return '#FFFFFF';
    return colors.walnut;
  };

  const getShadowColor = () => {
    if (variant === 'danger') return colors.dangerRed;
    if (variant === 'secondary') return '#000';
    return colors.amber;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: getBg(),
            shadowColor: getShadowColor(),
            borderColor: variant === 'secondary' ? colors.cardBorder : 'transparent',
            borderWidth: variant === 'secondary' ? 1 : 0,
          },
          style,
        ]}
        {...props}
      >
        {/* Top highlight for 3D glossy effect */}
        <View style={[styles.topHighlight, { backgroundColor: colors.emboss }]} />
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default NeuButton;
