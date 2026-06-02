import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface NeuInputProps extends TextInputProps {
  label: string;
}

const NeuInput = ({ label, ...props }: NeuInputProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
      {/* Top inset shadow */}
      <View style={[styles.insetTop, { backgroundColor: colors.insetShadow }]} />
      {/* Bottom highlight */}
      <View style={[styles.insetBottom, { backgroundColor: colors.emboss }]} />
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  insetTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.15,
  },
  insetBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    height: 26,
  },
});

export default NeuInput;
