import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TouchableWithoutFeedback, FlatList, ActivityIndicator,
} from 'react-native';
import { Folder, Home, ChevronRight } from 'lucide-react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface MoveFileModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (folderId: string | null) => void;
  currentFolderId?: string | null;
}

interface FolderItem {
  _id: string | null;
  name: string;
  depth?: number;
}

const MoveFileModal = ({ visible, onClose, onSelect, currentFolderId }: MoveFileModalProps) => {
  const { colors } = useTheme();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) loadFolders();
  }, [visible]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const collectFolders = async (parentId: string | null = null, depth = 0): Promise<FolderItem[]> => {
        const res = await api.get(parentId ? `/folders?parentId=${parentId}` : '/folders');
        const currentLevel = res.data.data || [];
        const nested = await Promise.all(
          currentLevel.map(async (folder: any) => [
            { _id: folder._id, name: folder.name, depth },
            ...(await collectFolders(folder._id, depth + 1)),
          ])
        );
        return nested.flat();
      };
      setFolders(await collectFolders());
    } catch (e) {
      console.error('Failed to load folders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (folderId: string | null) => {
    onSelect(folderId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
              <View style={[styles.topEdge, { backgroundColor: colors.emboss }]} />
              <Text style={[styles.title, { color: colors.text }]}>Move to…</Text>

              {loading ? (
                <ActivityIndicator size="large" color={colors.amber} style={styles.loader} />
              ) : (
                <FlatList<FolderItem>
                  data={[{ _id: null, name: 'Root (Home)' }, ...folders]}
                  keyExtractor={(item) => item._id || 'root'}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const isCurrentFolder = item._id === currentFolderId;
                    return (
                      <TouchableOpacity
                        style={[styles.folderItem, { borderBottomColor: colors.divider }, isCurrentFolder && styles.disabledItem]}
                        onPress={() => handleSelect(item._id)}
                        disabled={isCurrentFolder}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.folderIcon,
                          { backgroundColor: item._id === null ? colors.parchment : colors.amber },
                          item._id === null && { borderColor: colors.cardBorder, borderWidth: 1 },
                        ]}>
                          {item._id === null ? (
                            <Home size={18} color={colors.text} />
                          ) : (
                            <Folder size={18} color={colors.walnut} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.folderName,
                            { paddingLeft: (item.depth || 0) * 12, color: isCurrentFolder ? colors.textMuted : colors.text },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {isCurrentFolder && (
                          <Text style={[styles.currentBadge, { color: colors.textMuted, backgroundColor: colors.parchment }]}>
                            Current
                          </Text>
                        )}
                        {!isCurrentFolder && <ChevronRight size={16} color={colors.stitch} />}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.parchment, borderColor: colors.cardBorder }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
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
    padding: 20,
    maxHeight: '70%',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  topEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, paddingHorizontal: 4 },
  loader: { marginVertical: 40 },
  list: { maxHeight: 300 },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disabledItem: { opacity: 0.4 },
  folderIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderName: { flex: 1, fontSize: 15, fontWeight: '500' },
  currentBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelText: { fontSize: 16, fontWeight: '600' },
});

export default MoveFileModal;
