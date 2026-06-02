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

interface ConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmSheet = ({ 
  visible, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', danger = false 
}: ConfirmSheetProps) => {
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

  const handleConfirm = () => {
    onClose();
    setTimeout(onConfirm, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: colors.overlay }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
        <View style={[styles.handleBar, { backgroundColor: colors.brass }]} />

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.parchment, borderColor: colors.cardBorder, borderWidth: 1 }]} 
            activeOpacity={0.7} 
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>{cancelText}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: danger ? colors.dangerRed : colors.amber }]} 
            activeOpacity={0.7} 
            onPress={handleConfirm}
          >
            <View style={styles.btnHighlight} />
            <Text style={[styles.confirmText, { color: danger ? '#FFFFFF' : colors.walnut }]}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ConfirmSheet;
