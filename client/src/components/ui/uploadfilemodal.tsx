import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TouchableWithoutFeedback, ActivityIndicator,
} from 'react-native';
import { Upload, File as FileIcon } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';

interface UploadFileModalProps {
  visible: boolean;
  onClose: () => void;
  folderId?: string | null;
  onUploadComplete: () => void;
}

const UploadFileModal = ({ visible, onClose, folderId, onUploadComplete }: UploadFileModalProps) => {
  const { colors } = useTheme();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
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
      if (folderId) formData.append('folderId', folderId);

      await api.post('/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      Toast.show({ type: 'success', text1: 'Upload Complete', text2: `${selectedFile.name} uploaded successfully` });
      setSelectedFile(null);
      onUploadComplete();
      onClose();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: error?.response?.data?.message || 'Something went wrong' });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) { setSelectedFile(null); onClose(); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
              {/* Embossed top edge */}
              <View style={[styles.topEdge, { backgroundColor: colors.emboss }]} />

              <Text style={[styles.title, { color: colors.text }]}>Upload File</Text>

              {!selectedFile ? (
                <TouchableOpacity
                  style={[styles.dropZone, { borderColor: colors.stitch, backgroundColor: colors.parchment }]}
                  onPress={pickFile}
                  activeOpacity={0.7}
                >
                  <View style={[styles.uploadIconContainer, { backgroundColor: colors.amber }]}>
                    <View style={styles.iconShine} />
                    <Upload size={28} color={colors.walnut} />
                  </View>
                  <Text style={[styles.dropText, { color: colors.text }]}>Tap to select a file</Text>
                  <Text style={[styles.dropHint, { color: colors.textMuted }]}>Max 50MB · Any file type</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.filePreview, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}>
                  <View style={[styles.fileIconContainer, { backgroundColor: colors.amber }]}>
                    <FileIcon size={22} color={colors.walnut} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{selectedFile.name}</Text>
                    <Text style={[styles.fileSize, { color: colors.textMuted }]}>{formatSize(selectedFile.size)}</Text>
                  </View>
                  {!uploading && (
                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                      <Text style={[styles.changeText, { color: colors.amber }]}>Change</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}
                  onPress={handleClose}
                  disabled={uploading}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: colors.amber, shadowColor: colors.amber }, (!selectedFile || uploading) && styles.disabledBtn]}
                  onPress={handleUpload}
                  disabled={!selectedFile || uploading}
                  activeOpacity={0.8}
                >
                  <View style={styles.btnHighlight} />
                  {uploading ? (
                    <ActivityIndicator color={colors.walnut} size="small" />
                  ) : (
                    <Text style={[styles.uploadText, { color: colors.walnut }]}>Upload</Text>
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
  overlay: { flex: 1, justifyContent: 'center', padding: 24 },
  content: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  topEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  iconShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dropText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  dropHint: { fontSize: 13 },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  fileIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  fileSize: { fontSize: 12 },
  changeText: { fontSize: 13, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: { fontSize: 16, fontWeight: '600' },
  uploadBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: { opacity: 0.5 },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  uploadText: { fontSize: 16, fontWeight: '700' },
});

export default UploadFileModal;
