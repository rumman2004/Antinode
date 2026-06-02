import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionItem[];
}

const ActionSheet = ({ visible, onClose, title, actions }: ActionSheetProps) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 150, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (action: ActionItem) => {
    onClose();
    setTimeout(action.onPress, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: colors.overlay }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
        {/* Brass handle bar */}
        <View style={[styles.handleBar, { backgroundColor: colors.brass }]} />

        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionItem, { borderBottomColor: colors.divider }]}
            activeOpacity={0.7}
            onPress={() => handleAction(action)}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: action.danger ? colors.dangerBg : colors.amber },
            ]}>
              {action.icon}
            </View>
            <Text style={[
              styles.actionLabel,
              { color: action.danger ? colors.dangerRed : colors.text },
            ]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActionSheet;
