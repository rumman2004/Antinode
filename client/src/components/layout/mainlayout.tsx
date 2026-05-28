import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MainLayoutProps {
  headerHeight?: number;
  headerContent: ReactNode;
  children: ReactNode;
}

/**
 * Shared layout providing:
 *  – Dark header section (#0D0D0D) with configurable height
 *  – Smooth curved transition to white content area
 *  – SafeAreaView for notch-safe rendering
 */
const MainLayout = ({
  headerHeight = 280,
  headerContent,
  children,
}: MainLayoutProps) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Dark Header */}
      <View style={[styles.topSection, { height: headerHeight }]}>
        <SafeAreaView style={styles.safeArea}>{headerContent}</SafeAreaView>
        <View style={styles.curve} />
      </View>

      {/* White Content Area */}
      <View style={styles.bottomSection}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#0D0D0D',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 0,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default MainLayout;
