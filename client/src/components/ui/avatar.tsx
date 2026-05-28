import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

const SIZES = {
  sm: { outer: 40, inner: 34, icon: 18, fontSize: 14, borderRadius: 12 },
  md: { outer: 64, inner: 56, icon: 28, fontSize: 20, borderRadius: 18 },
  lg: { outer: 80, inner: 70, icon: 40, fontSize: 28, borderRadius: 24 },
};

/**
 * Avatar component with:
 *  – Initials fallback (User icon if no name)
 *  – Red outer glow shadow
 *  – Gold inner ring
 */
const Avatar = ({ name, size = 'md', showGlow = true }: AvatarProps) => {
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
        },
        showGlow && styles.glow,
      ]}
    >
      <View
        style={[
          styles.innerRing,
          {
            width: dims.inner,
            height: dims.inner,
            borderRadius: dims.borderRadius - 4,
          },
        ]}
      >
        {initials ? (
          <Text style={[styles.initials, { fontSize: dims.fontSize }]}>
            {initials}
          </Text>
        ) : (
          <User size={dims.icon} color="#0D0D0D" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerRing: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  innerRing: {
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#0D0D0D',
    fontWeight: '700',
  },
});

export default Avatar;
