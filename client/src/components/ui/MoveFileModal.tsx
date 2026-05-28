import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Folder, Home, ChevronRight } from 'lucide-react-native';
import api from '../../services/api';

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

/**
 * Modal for selecting a destination folder to move a file into.
 * Fetches all user folders and displays them as a selectable list.
 */
const MoveFileModal = ({ visible, onClose, onSelect, currentFolderId }: MoveFileModalProps) => {
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>Move to…</Text>

              {loading ? (
                <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
              ) : (
                <FlatList<FolderItem>
                  data={[{ _id: null, name: 'Root (Home)' }, ...folders]}
                  keyExtractor={(item) => item._id || 'root'}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const isCurrentFolder = item._id === currentFolderId;
                    return (
                      <TouchableOpacity
                        style={[styles.folderItem, isCurrentFolder && styles.disabledItem]}
                        onPress={() => handleSelect(item._id)}
                        disabled={isCurrentFolder}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.folderIcon, item._id === null && styles.homeIcon]}>
                          {item._id === null ? (
                            <Home size={20} color="#0D0D0D" />
                          ) : (
                            <Folder size={20} color="#FFFFFF" />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.folderName,
                            { paddingLeft: (item.depth || 0) * 12 },
                            isCurrentFolder && styles.disabledText,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {isCurrentFolder && (
                          <Text style={styles.currentBadge}>Current</Text>
                        )}
                        {!isCurrentFolder && (
                          <ChevronRight size={18} color="#CBD5E1" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
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
    padding: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0D0D',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  loader: {
    marginVertical: 40,
  },
  list: {
    maxHeight: 300,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  disabledItem: {
    opacity: 0.4,
  },
  folderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  homeIcon: {
    backgroundColor: '#E2E8F0',
  },
  folderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0D0D0D',
  },
  disabledText: {
    color: '#94A3B8',
  },
  currentBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default MoveFileModal;
