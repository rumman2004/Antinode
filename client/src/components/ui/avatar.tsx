import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

const SIZES = {
  sm: { outer: 40, inner: 34, icon: 18, fontSize: 14, borderRadius: 20 },
  md: { outer: 64, inner: 56, icon: 28, fontSize: 20, borderRadius: 32 },
  lg: { outer: 80, inner: 70, icon: 40, fontSize: 28, borderRadius: 40 },
};

/**
 * Skeuomorphic avatar with brass bezel ring,
 * leather inner, and gold embossed initials.
 */
const Avatar = ({ name, size = 'md', showGlow = true }: AvatarProps) => {
  const { colors } = useTheme();
  const dims = SIZES[size];

  const getInitials = () => {
    if (!name) return null;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const initials = getInitials();

  return (
    <View
      style={[
        styles.outerRing,
        {
          width: dims.outer,
          height: dims.outer,
          borderRadius: dims.borderRadius,
          backgroundColor: colors.brass,
        },
        showGlow && {
          shadowColor: colors.amber,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        },
      ]}
    >
      {/* Brass top highlight */}
      <View style={[styles.bezelHighlight, { borderRadius: dims.borderRadius }]} />
      <View
        style={[
          styles.innerRing,
          {
            width: dims.inner,
            height: dims.inner,
            borderRadius: dims.borderRadius - 4,
            backgroundColor: colors.leatherLight,
          },
        ]}
      >
        {initials ? (
          <Text style={[styles.initials, { fontSize: dims.fontSize, color: colors.amber }]}>
            {initials}
          </Text>
        ) : (
          <User size={dims.icon} color={colors.amber} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerRing: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bezelHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  innerRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default Avatar;
