import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Download,
  Share2,
  FolderInput,
  Trash2,
  X,
  HardDrive,
  Cloud,
  Calendar,
  Database,
  Eye,
} from 'lucide-react-native';

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

/**
 * Document preview modal showing file metadata
 * with action buttons for Download, Share, Move, Delete.
 */
const DocumentPreviewModal = ({
  visible,
  file,
  onClose,
  onOpen,
  onDownload,
  onShare,
  onMove,
  onDelete,
}: DocumentPreviewModalProps) => {
  if (!file) return null;

  const getFileIcon = () => {
    if (file.mimeType?.startsWith('image/')) return <ImageIcon size={36} color="#FFFFFF" />;
    if (file.mimeType?.startsWith('video/')) return <Film size={36} color="#FFFFFF" />;
    if (file.mimeType?.startsWith('audio/')) return <Music size={36} color="#FFFFFF" />;
    if (file.mimeType?.includes('zip') || file.mimeType?.includes('rar'))
      return <Archive size={36} color="#FFFFFF" />;
    return <FileText size={36} color="#FFFFFF" />;
  };

  const getIconColor = (): string => {
    if (file.mimeType?.startsWith('image/')) return '#EC4899';
    if (file.mimeType?.startsWith('video/')) return '#8B5CF6';
    if (file.mimeType?.startsWith('audio/')) return '#06B6D4';
    return '#FFD700';
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {/* Close Button */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* File Icon & Name */}
              <View style={styles.fileHeader}>
                <View style={[styles.iconBox, { backgroundColor: getIconColor() }]}>
                  {getFileIcon()}
                </View>
                <Text style={styles.fileName} numberOfLines={2}>
                  {file.originalName}
                </Text>
              </View>

              {/* Metadata */}
              <View style={styles.metaSection}>
                <View style={styles.metaRow}>
                  <Calendar size={16} color="#94A3B8" />
                  <Text style={styles.metaLabel}>Date</Text>
                  <Text style={styles.metaValue}>{formatDate(file.createdAt)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Database size={16} color="#94A3B8" />
                  <Text style={styles.metaLabel}>Size</Text>
                  <Text style={styles.metaValue}>{formatSize(file.size)}</Text>
                </View>
              </View>
              {/* Action Buttons */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.actionsContainer}
                contentContainerStyle={styles.actionsRow}
              >
                {onOpen && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onOpen)}>
                    <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                      <Eye size={18} color="#9333EA" />
                    </View>
                    <Text style={styles.actionLabel}>Open</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleAction(onDownload)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                    <Download size={18} color="#3B82F6" />
                  </View>
                  <Text style={styles.actionLabel}>Download</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onShare)}>
                  <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Share2 size={18} color="#10B981" />
                  </View>
                  <Text style={styles.actionLabel}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onMove)}>
                  <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                    <FolderInput size={18} color="#F59E0B" />
                  </View>
                  <Text style={styles.actionLabel}>Move</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(onDelete)}>
                  <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                    <Trash2 size={18} color="#EF4444" />
                  </View>
                  <Text style={styles.actionLabel}>Delete</Text>
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
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D0D',
    textAlign: 'center',
  },
  metaSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 10,
    flex: 1,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  actionBtn: {
    alignItems: 'center',
    width: 60,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default DocumentPreviewModal;
