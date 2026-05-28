import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Upload, File as FileIcon, CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

interface UploadFileModalProps {
  visible: boolean;
  onClose: () => void;
  folderId?: string | null;
  onUploadComplete: () => void;
}

/**
 * Upload file modal using expo-document-picker.
 * Shows selected file info and upload progress.
 */
const UploadFileModal = ({
  visible,
  onClose,
  folderId,
  onUploadComplete,
}: UploadFileModalProps) => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('File pick error:', error);
    }
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      } as any);

      if (folderId) {
        formData.append('folderId', folderId);
      }

      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Toast.show({
        type: 'success',
        text1: 'Upload Complete',
        text2: `${selectedFile.name} uploaded successfully`,
      });

      setSelectedFile(null);
      onUploadComplete();
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>Upload File</Text>

              {!selectedFile ? (
                <TouchableOpacity style={styles.dropZone} onPress={pickFile} activeOpacity={0.7}>
                  <View style={styles.uploadIconContainer}>
                    <Upload size={32} color="#FFD700" />
                  </View>
                  <Text style={styles.dropText}>Tap to select a file</Text>
                  <Text style={styles.dropHint}>Max 50MB · Any file type</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.filePreview}>
                  <View style={styles.fileIconContainer}>
                    <FileIcon size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatSize(selectedFile.size)}</Text>
                  </View>
                  {!uploading && (
                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                      <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
                  disabled={uploading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadBtn, (!selectedFile || uploading) && styles.disabledBtn]}
                  onPress={handleUpload}
                  disabled={!selectedFile || uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator color="#0D0D0D" size="small" />
                  ) : (
                    <Text style={styles.uploadText}>Upload</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D0D0D',
    marginBottom: 20,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 4,
  },
  dropHint: {
    fontSize: 13,
    color: '#94A3B8',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#94A3B8',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  uploadBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D0D0D',
  },
});

export default UploadFileModal;
