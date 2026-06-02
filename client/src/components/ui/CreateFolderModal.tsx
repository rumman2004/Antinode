import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableWithoutFeedback, TouchableOpacity,
  Animated, Dimensions, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  title?: string;
  initialValue?: string;
}

const CreateFolderModal = ({
  visible, onClose, onConfirm, title = 'New Folder', initialValue = '',
}: CreateFolderModalProps) => {
  const { colors } = useTheme();
  const [folderName, setFolderName] = useState('');
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setFolderName(initialValue);
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
  }, [visible, initialValue]);

  const handleConfirm = () => {
    if (!folderName.trim()) return;
    onClose();
    setTimeout(() => onConfirm(folderName.trim()), 300);
    setFolderName('');
  };

  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: colors.overlay }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }], backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.brass }]} />

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {title.toLowerCase().includes('rename') ? 'Enter a new name' : 'Enter a name for this folder'}
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.parchment, color: colors.text, borderColor: colors.cardBorder }]}
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            value={folderName}
            onChangeText={setFolderName}
            autoFocus
            onSubmitEditing={handleConfirm}
            returnKeyType="done"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.parchment, borderColor: colors.cardBorder, borderWidth: 1 }]} 
              activeOpacity={0.7} 
              onPress={handleClose}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: colors.amber },
                !folderName.trim() && styles.disabledButton,
              ]} 
              activeOpacity={0.7} 
              onPress={handleConfirm}
              disabled={!folderName.trim()}
            >
              <View style={styles.btnHighlight} />
              <Text style={[styles.confirmText, { color: colors.walnut }]}>
                {title.toLowerCase().includes('rename') ? 'Save' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  keyboardAvoid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 24,
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
  disabledButton: {
    opacity: 0.5,
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

export default CreateFolderModal;
