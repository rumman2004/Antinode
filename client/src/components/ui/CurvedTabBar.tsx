import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions, DeviceEventEmitter } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import FAB from './FAB';
import { useTheme } from '../../context/ThemeContext';

const TAB_BAR_HEIGHT = 70;

const CurvedTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const getPath = () => {
    const center = width / 2;
    return `
      M 0 0 
      L ${center - 45} 0
      C ${center - 35} 0, ${center - 30} 35, ${center} 35
      C ${center + 30} 35, ${center + 35} 0, ${center + 45} 0
      L ${width} 0
      L ${width} ${TAB_BAR_HEIGHT}
      L 0 ${TAB_BAR_HEIGHT}
      Z
    `;
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={TAB_BAR_HEIGHT} style={styles.svg}>
        <Path d={getPath()} fill={colors.leather} />
      </Svg>

      {/* Embossed top edge highlight */}
      <View style={[styles.topHighlight, { backgroundColor: colors.emboss }]} />

      <View style={styles.tabContent}>
        {state.routes.map((route, index) => {
          if (route.name === 'Spacer') {
            return <View key={route.key} style={styles.tabItem} pointerEvents="none" />;
          }

          if (route.name === 'UploadPlaceholder') {
            return (
              <View key={route.key} style={styles.centerButtonContainer}>
                <FAB 
                  isCenter={true}
                  onNewFolder={() => DeviceEventEmitter.emit('openFolderModal')} 
                  onUploadFile={() => DeviceEventEmitter.emit('openUploadModal')} 
                />
              </View>
            );
          }

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
            >
              {options.tabBarIcon && options.tabBarIcon({ 
                focused: isFocused, 
                color: isFocused ? colors.amber : colors.stitch, 
                size: 26 
              })}
              {/* Active indicator dot */}
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.amber }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  svg: {
    position: 'absolute',
    top: 0,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },
});

export default CurvedTabBar;
