import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TouchableWithoutFeedback, ScrollView,
} from 'react-native';
import {
  FileText, Image as ImageIcon, Film, Music, Archive,
  Download, Share2, FolderInput, Trash2, X,
  Calendar, Database, Eye,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface FileData {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageProvider: 's3' | 'cloudinary';
  createdAt: string;
}

interface DocumentPreviewModalProps {
  visible: boolean;
  file: FileData | null;
  onClose: () => void;
  onOpen?: () => void;
  onDownload: () => void;
  onShare: () => void;
  onMove: () => void;
  onDelete: () => void;
}

const DocumentPreviewModal = ({
  visible, file, onClose, onOpen, onDownload, onShare, onMove, onDelete,
}: DocumentPreviewModalProps) => {
  const { colors } = useTheme();
  if (!file) return null;

  const getFileIcon = () => {
    if (file.mimeType?.startsWith('image/')) return <ImageIcon size={32} color="#FFFFFF" />;
    if (file.mimeType?.startsWith('video/')) return <Film size={32} color="#FFFFFF" />;
    if (file.mimeType?.startsWith('audio/')) return <Music size={32} color="#FFFFFF" />;
    if (file.mimeType?.includes('zip') || file.mimeType?.includes('rar'))
      return <Archive size={32} color="#FFFFFF" />;
    return <FileText size={32} color="#FFFFFF" />;
  };

  const getIconColor = (): string => {
    if (file.mimeType?.startsWith('image/')) return '#B5545B';
    if (file.mimeType?.startsWith('video/')) return '#7B5EA7';
    if (file.mimeType?.startsWith('audio/')) return '#5A8A7A';
    return colors.amber;
  };

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  };

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(action, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
              <View style={[styles.topEdge, { backgroundColor: colors.emboss }]} />

              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.parchment }]} onPress={onClose}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.fileHeader}>
                <View style={[styles.iconBox, { backgroundColor: getIconColor() }]}>
                  <View style={styles.iconShine} />
                  {getFileIcon()}
                </View>
                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                  {file.originalName}
                </Text>
              </View>

              <View style={[styles.metaSection, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}>
                <View style={styles.metaRow}>
                  <Calendar size={16} color={colors.textMuted} />
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Date</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{formatDate(file.createdAt)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Database size={16} color={colors.textMuted} />
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Size</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{formatSize(file.size)}</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={styles.actionsContainer} contentContainerStyle={styles.actionsRow}>
                {onOpen && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onOpen)}>
                    <View style={[styles.actionIcon, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}>
                      <Eye size={18} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Open</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onDownload)}>
                  <View style={[styles.actionIcon, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}>
                    <Download size={18} color={colors.brass} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onShare)}>
                  <View style={[styles.actionIcon, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}>
                    <Share2 size={18} color={colors.successGreen} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onMove)}>
                  <View style={[styles.actionIcon, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}>
                    <FolderInput size={18} color={colors.amber} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Move</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onDelete)}>
                  <View style={[styles.actionIcon, { backgroundColor: colors.dangerBg, borderColor: colors.cardBorder }]}>
                    <Trash2 size={18} color={colors.dangerRed} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Delete</Text>
                </TouchableOpacity>
              </ScrollView>
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
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fileHeader: { alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fileName: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  metaSection: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 10,
    borderWidth: 1,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { fontSize: 13, marginLeft: 10, flex: 1 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  actionsContainer: { marginTop: 4 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 2, paddingBottom: 8 },
  actionBtn: { alignItems: 'center', width: 60 },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  actionLabel: { fontSize: 11, fontWeight: '600' },
});

export default DocumentPreviewModal;
