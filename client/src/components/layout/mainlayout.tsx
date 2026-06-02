import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface MainLayoutProps {
  headerHeight?: number;
  headerContent: ReactNode;
  children: ReactNode;
}

/**
 * Skeuomorphic layout with leather header
 * and stitched seam transition to parchment content.
 */
const MainLayout = ({
  headerHeight = 280,
  headerContent,
  children,
}: MainLayoutProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.parchment }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.leather} />

      {/* Leather Header */}
      <View style={[styles.topSection, { height: headerHeight, backgroundColor: colors.leather }]}>
        {/* Subtle grain overlay */}
        <View style={styles.grainOverlay} />
        <SafeAreaView style={styles.safeArea}>{headerContent}</SafeAreaView>
        {/* Plain curve */}
        <View style={[styles.curve, { backgroundColor: colors.parchment }]} />
      </View>

      {/* Parchment Content Area */}
      <View style={[styles.bottomSection, { backgroundColor: colors.parchment }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    position: 'relative',
    overflow: 'hidden',
  },
  grainOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
    backgroundColor: '#FFF',
  },
  safeArea: {
    flex: 1,
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 0,
  },
  bottomSection: {
    flex: 1,
  },
});

export default MainLayout;
