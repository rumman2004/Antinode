import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback, 
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  title?: string;
  initialValue?: string;
}

/**
 * Bottom sheet modal for entering a folder or file name.
 */
const CreateFolderModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'New Folder',
  initialValue = '',
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setFolderName(initialValue);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
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
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {title.toLowerCase().includes('rename') ? 'Enter a new name' : 'Enter a name for this folder'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#94A3B8"
            value={folderName}
            onChangeText={setFolderName}
            autoFocus
            onSubmitEditing={handleConfirm}
            returnKeyType="done"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              activeOpacity={0.7} 
              onPress={handleClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton, 
                !folderName.trim() && styles.disabledButton
              ]} 
              activeOpacity={0.7} 
              onPress={handleConfirm}
              disabled={!folderName.trim()}
            >
              <Text style={styles.confirmText}>
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  keyboardAvoid: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D0D0D',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0D0D',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateFolderModal;
