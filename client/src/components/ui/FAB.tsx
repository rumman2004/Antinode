import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { Plus, FolderPlus, Upload } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface FABProps {
  onNewFolder: () => void;
  onUploadFile: () => void;
  isCenter?: boolean;
}

/**
 * Skeuomorphic FAB — glossy brass dome with expanding sub-actions.
 */
const FAB = ({ onNewFolder, onUploadFile, isCenter = false }: FABProps) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.spring(rotation, {
        toValue,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded(!expanded);
  };

  const handleAction = (action: () => void) => {
    toggle();
    setTimeout(action, 200);
  };

  const folderTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -130],
  });

  const uploadTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const rotateZ = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <>
      {/* Overlay */}
      {expanded && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={expanded ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={toggle}
          />
        </Animated.View>
      )}

      <View 
        style={[
          styles.container,
          isCenter && { right: 'auto', left: '50%', transform: [{ translateX: -75 }], bottom: 5, alignItems: 'center' }
        ]} 
        pointerEvents="box-none"
      >
        {/* New Folder Sub-action */}
        <Animated.View
          style={[
            styles.subAction,
            isCenter && { right: 'auto', left: '50%', marginLeft: -24 },
            {
              transform: [{ translateY: folderTranslate }],
              opacity: animation,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.subActionBtn, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}
            onPress={() => handleAction(onNewFolder)}
            activeOpacity={0.8}
          >
            <FolderPlus size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.subLabel, { backgroundColor: colors.leather, color: colors.amberGlow }]}>
            New Folder
          </Text>
        </Animated.View>

        {/* Upload File Sub-action */}
        <Animated.View
          style={[
            styles.subAction,
            isCenter && { right: 'auto', left: '50%', marginLeft: -24 },
            {
              transform: [{ translateY: uploadTranslate }],
              opacity: animation,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.subActionBtn, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}
            onPress={() => handleAction(onUploadFile)}
            activeOpacity={0.8}
          >
            <Upload size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.subLabel, { backgroundColor: colors.leather, color: colors.amberGlow }]}>
            Upload
          </Text>
        </Animated.View>

        {/* Main FAB Button — glossy brass dome */}
        <Animated.View style={{ transform: [{ rotate: rotateZ }] }}>
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: colors.amber, shadowColor: colors.amber }]}
            onPress={toggle}
            activeOpacity={0.85}
          >
            {/* Glossy shine */}
            <View style={styles.mainBtnShine} />
            <Plus size={28} color={colors.walnut} strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 90,
  },
  container: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 150,
    height: 250,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  mainBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  mainBtnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  subAction: {
    position: 'absolute',
    bottom: 0,
    right: 6,
    alignItems: 'center',
    flexDirection: 'row',
  },
  subActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  subLabel: {
    position: 'absolute',
    right: 58,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    width: 90,
    textAlign: 'center',
  },
});

export default FAB;
