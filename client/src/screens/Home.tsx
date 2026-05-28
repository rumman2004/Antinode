import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { Folder, MoreVertical, Settings, Database, HardDrive, Trash2, Edit2, FolderInput, LogOut } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/layout/mainlayout';
import Avatar from '../components/ui/avatar';
import GsapReveal from '../components/ui/gsapRevel';
import FAB from '../components/ui/FAB';
import CreateFolderModal from '../components/ui/CreateFolderModal';
import MoveFileModal from '../components/ui/MoveFileModal';
import UploadFileModal from '../components/ui/uploadfilemodal';
import DocumentPreviewModal from '../components/ui/documentPreviewModal';
import FileViewerModal from '../components/ui/FileViewerModal';
import ActionSheet from '../components/ui/ActionSheet';
import FileCard from '../components/ui/FileCard';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import api, {
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  deleteFile,
  moveFile,
  getDownloadUrl,
  getUserStats,
} from '../services/api';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

interface Props {
  navigation: NativeStackNavigationProp<any, any>;
}

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useContext(AuthContext);

  // States
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState({ folders: 0, files: 0, usedStorage: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);

  // File Viewer States
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerFileName, setViewerFileName] = useState('');
  const [viewerMimeType, setViewerMimeType] = useState('');

  const [confirmModalConfig, setConfirmModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    danger: true,
    onConfirm: () => {},
  });

  // Context Action States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'folder' | 'file' | null>(null);
  const [folderActionSheetVisible, setFolderActionSheetVisible] = useState(false);
  const [fileActionSheetVisible, setFileActionSheetVisible] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [foldersRes, filesRes, statsRes] = await Promise.all([
        getFolders(null), // root folders
        api.get('/files'), // recent files
        getUserStats(),
      ]);

      setFolders(foldersRes.data.data);
      // Limit recent files to 10 for dashboard preview
      setFiles(filesRes.data.data.slice(0, 10));
      setStats(statsRes.data.data);
    } catch (e) {
      console.error('Failed to load home data:', e);
      Toast.show({
        type: 'error',
        text1: 'Sync Error',
        text2: 'Failed to update file manager data.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Global FAB listeners
    const folderSub = DeviceEventEmitter.addListener('openFolderModal', () => {
      setFolderModalVisible(true);
    });
    const uploadSub = DeviceEventEmitter.addListener('openUploadModal', () => {
      setUploadModalVisible(true);
    });

    return () => {
      folderSub.remove();
      uploadSub.remove();
    };
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Folders Operations
  const handleCreateFolder = async (name: string) => {
    setFolderModalVisible(false);
    try {
      await createFolder(name, null);
      Toast.show({
        type: 'success',
        text1: 'Folder Created',
        text2: `Successfully created "${name}"`,
      });
      loadData(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Creating Folder',
        text2: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleFolderLongPress = (folder: any) => {
    setSelectedItem(folder);
    setItemType('folder');
    setFolderActionSheetVisible(true);
  };

  const handleRenameFolder = async (newName: string) => {
    setRenameModalVisible(false);
    if (!selectedItem) return;
    try {
      await renameFolder(selectedItem._id, newName);
      Toast.show({
        type: 'success',
        text1: 'Folder Renamed',
        text2: `Renamed to "${newName}"`,
      });
      loadData(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Rename Failed',
        text2: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleDeleteFolderConfirm = () => {
    if (!selectedItem) return;
    setFolderActionSheetVisible(false);
    setConfirmModalConfig({
      visible: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await deleteFolder(selectedItem._id);
          Toast.show({
            type: 'success',
            text1: 'Folder Deleted',
            text2: `Successfully deleted "${selectedItem.name}"`,
          });
          setConfirmModalConfig({ ...confirmModalConfig, visible: false });
          loadData(true);
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Delete Failed',
            text2: error.response?.data?.message || 'Folder may not be empty.',
          });
        }
      },
    });
  };

  // Files Operations
  const handleFileLongPress = (file: any) => {
    setSelectedItem(file);
    setItemType('file');
    setFileActionSheetVisible(true);
  };

  const handleFilePress = async (file: any) => {
    setSelectedItem(file);
    setItemType('file');

    // Check if the file type is viewable in-app
    const viewable =
      file.mimeType?.startsWith('image/') ||
      file.mimeType === 'application/pdf' ||
      file.mimeType?.includes('word') ||
      file.mimeType?.includes('document') ||
      file.mimeType?.includes('spreadsheet') ||
      file.mimeType?.includes('excel') ||
      file.mimeType?.includes('presentation') ||
      file.mimeType?.includes('powerpoint') ||
      file.mimeType?.startsWith('text/');

    if (viewable) {
      try {
        Toast.show({
          type: 'info',
          text1: 'Opening...',
          text2: file.originalName,
          visibilityTime: 1500,
        });
        const res = await getDownloadUrl(file._id);
        const url = res.data.data.url;
        setViewerUrl(url);
        setViewerFileName(file.originalName);
        setViewerMimeType(file.mimeType);
        setViewerVisible(true);
      } catch (e) {
        console.error('Failed to get file URL:', e);
        // Fallback to metadata modal
        setPreviewModalVisible(true);
      }
    } else {
      // Non-viewable files show the metadata/actions modal
      setPreviewModalVisible(true);
    }
  };

  const handleDownloadFile = async (file = selectedItem) => {
    if (!file) return;
    try {
      Toast.show({
        type: 'info',
        text1: 'Downloading...',
        text2: 'Fetching download link',
        visibilityTime: 1500,
      });
      const res = await getDownloadUrl(file._id);
      const downloadUrl = res.data.data.url;

      if (Platform.OS === 'android' && (FileSystem as any).StorageAccessFramework) {
        const SAF = (FileSystem as any).StorageAccessFramework;
        const permissions = await SAF.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: 'Need permission to save file',
          });
          return;
        }

        Toast.show({
          type: 'info',
          text1: 'Saving file...',
          text2: file.originalName,
          autoHide: false,
        });

        const localUri = `${(FileSystem as any).cacheDirectory}${file.originalName}`;
        await (FileSystem as any).downloadAsync(downloadUrl, localUri);

        const base64Data = await (FileSystem as any).readAsStringAsync(localUri, { encoding: (FileSystem as any).EncodingType.Base64 });
        const targetUri = await SAF.createFileAsync(permissions.directoryUri, file.originalName, file.mimeType);
        await (FileSystem as any).writeAsStringAsync(targetUri, base64Data, { encoding: (FileSystem as any).EncodingType.Base64 });

        Toast.hide();
        Toast.show({
          type: 'success',
          text1: 'Download Complete',
          text2: `Saved ${file.originalName}`,
        });
      } else {
        const localUri = `${(FileSystem as any).documentDirectory}${file.originalName}`;

        Toast.show({
          type: 'info',
          text1: 'Saving file...',
          text2: file.originalName,
          autoHide: false,
        });

        const downloadRes = await (FileSystem as any).downloadAsync(downloadUrl, localUri);

        Toast.hide();
        // On iOS or fallback, the file is saved to the sandbox. 
        // We prompt the user to save it elsewhere or share it.
        await Sharing.shareAsync(downloadRes.uri);
        
        return null;
      }
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Could not download file',
      });
    }
  };

  const handleShareFile = async (file = selectedItem) => {
    if (!file) return;
    try {
      const localUri = await handleDownloadFile(file);
      if (localUri) {
        await Sharing.shareAsync(localUri);
      }
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Sharing Failed',
        text2: 'Could not trigger native share',
      });
    }
  };

  const handleMoveFile = async (destinationFolderId: string | null) => {
    if (!selectedItem) return;
    try {
      await moveFile(selectedItem._id, destinationFolderId);
      Toast.show({
        type: 'success',
        text1: 'File Moved',
        text2: 'Successfully relocated file',
      });
      setPreviewModalVisible(false);
      loadData(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Move Failed',
        text2: error.response?.data?.message || 'Failed to move file',
      });
    }
  };

  const handleDeleteFileConfirm = (file = selectedItem) => {
    if (!file) return;
    setFileActionSheetVisible(false);
    setPreviewModalVisible(false);
    setConfirmModalConfig({
      visible: true,
      title: 'Delete File',
      message: `Are you sure you want to delete "${file.originalName}"?`,
      danger: true,
      onConfirm: async () => {
        try {
          await deleteFile(file._id);
          Toast.show({
            type: 'success',
            text1: 'File Deleted',
            text2: `Successfully deleted "${file.originalName}"`,
          });
          setConfirmModalConfig({ ...confirmModalConfig, visible: false });
          loadData(true);
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Delete Failed',
            text2: error.response?.data?.message || 'Could not delete file',
          });
        }
      },
    });
  };

  // Horizontal folder list item render
  const renderFolderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <GsapReveal delay={index * 100} direction="right" style={styles.folderCardContainer}>
        <TouchableOpacity
          style={styles.folderCard}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('Dashboard', {
              folderId: item._id,
              folderName: item.name,
            })
          }
          onLongPress={() => handleFolderLongPress(item)}
          delayLongPress={200}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={styles.folderIconWrapper}>
              <Folder size={32} color="#FF9500" fill="#FF9500" />
            </View>
            <TouchableOpacity 
              onPress={() => handleFolderLongPress(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.folderNameText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.folderDateText}>{formatDate(item.createdAt)}</Text>
        </TouchableOpacity>
      </GsapReveal>
    );
  };

  // Header content component
  const headerContent = (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.headerSubtitle}>My storage</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" showGlow />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>
        {user?.firstName ? `${user.firstName}'s Space` : 'My Drive'}
      </Text>

      {/* Real statistics bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Folders</Text>
          <Text style={styles.statVal}>{stats.folders}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Files</Text>
          <Text style={styles.statVal}>{stats.files}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Storage</Text>
          <Text style={styles.statVal}>{formatSize(stats.usedStorage)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MainLayout headerHeight={270} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loaderText}>Syncing storage...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFD700']} />
            }
          >
            {/* My Folders Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Folders</Text>
            </View>

            {folders.length === 0 ? (
              <View style={styles.emptyBox}>
                <Folder size={32} color="#D1D5DB" />
                <Text style={styles.emptyText}>No folders created yet</Text>
              </View>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={folders}
                keyExtractor={(item) => item._id}
                renderItem={renderFolderItem}
                contentContainerStyle={styles.foldersList}
              />
            )}

            {/* Recent Files Section */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Last Files</Text>
            </View>

            {files.length === 0 ? (
              <View style={styles.emptyBox}>
                <Database size={32} color="#D1D5DB" />
                <Text style={styles.emptyText}>No files uploaded yet</Text>
              </View>
            ) : (
              <View style={styles.filesList}>
                {files.map((item, index) => (
                  <GsapReveal key={item._id} delay={index * 50} direction="up">
                    <FileCard
                      type="file"
                      name={item.originalName}
                      date={formatDate(item.createdAt)}
                      info={formatSize(item.size)}
                      mimeType={item.mimeType}
                      onPress={() => handleFilePress(item)}
                      onLongPress={() => handleFileLongPress(item)}
                    />
                  </GsapReveal>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </MainLayout>

      {/* Creation and Action Modals */}
      <CreateFolderModal
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
        onConfirm={handleCreateFolder}
      />

      <CreateFolderModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={itemType === 'folder' ? handleRenameFolder : () => {}}
        title={itemType === 'folder' ? 'Rename Folder' : 'Rename File'}
        initialValue={selectedItem ? (itemType === 'folder' ? selectedItem.name : selectedItem.originalName) : ''}
      />

      <UploadFileModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        folderId={null}
        onUploadComplete={() => {
          setUploadModalVisible(false);
          loadData(true);
        }}
      />

      <MoveFileModal
        visible={moveModalVisible}
        onClose={() => setMoveModalVisible(false)}
        onSelect={handleMoveFile}
        currentFolderId={selectedItem?.folder}
      />

      <DocumentPreviewModal
        visible={previewModalVisible}
        file={selectedItem}
        onClose={() => setPreviewModalVisible(false)}
        onOpen={() => handleFilePress(selectedItem)}
        onDownload={() => handleDownloadFile()}
        onShare={() => handleShareFile()}
        onMove={() => setMoveModalVisible(true)}
        onDelete={() => handleDeleteFileConfirm()}
      />

      <FileViewerModal
        visible={viewerVisible}
        fileUrl={viewerUrl}
        fileName={viewerFileName}
        mimeType={viewerMimeType}
        onClose={() => {
          setViewerVisible(false);
          setViewerUrl(null);
        }}
        onDownload={() => handleDownloadFile()}
        onShare={() => handleShareFile()}
      />

      {/* Context Menus */}
      <ActionSheet
        visible={folderActionSheetVisible}
        onClose={() => setFolderActionSheetVisible(false)}
        title={selectedItem?.name}
        actions={[
          {
            icon: <Edit2 size={20} color="#0D0D0D" />,
            label: 'Rename Folder',
            onPress: () => {
              setFolderActionSheetVisible(false);
              setTimeout(() => setRenameModalVisible(true), 300);
            },
          },
          {
            icon: <Trash2 size={20} color="#FF3B30" />,
            label: 'Delete Folder',
            onPress: () => handleDeleteFolderConfirm(),
            danger: true,
          },
        ]}
      />

      <ActionSheet
        visible={fileActionSheetVisible}
        onClose={() => setFileActionSheetVisible(false)}
        title={selectedItem?.originalName}
        actions={[
          {
            icon: <FolderInput size={18} color="#0D0D0D" />,
            label: 'Move to folder',
            onPress: () => setMoveModalVisible(true),
          },
          {
            icon: <Database size={18} color="#0D0D0D" />,
            label: 'Download file',
            onPress: () => handleDownloadFile(),
          },
          {
            icon: <Settings size={18} color="#0D0D0D" />,
            label: 'Share link',
            onPress: () => handleShareFile(),
          },
          {
            icon: <Trash2 size={18} color="#DC2626" />,
            label: 'Delete file',
            onPress: () => handleDeleteFileConfirm(),
            danger: true,
          },
        ]}
      />

      <ConfirmSheet
        visible={confirmModalConfig.visible}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        danger={confirmModalConfig.danger}
        confirmText="Delete"
        onClose={() => setConfirmModalConfig({ ...confirmModalConfig, visible: false })}
        onConfirm={confirmModalConfig.onConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  profileBtn: {
    padding: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statVal: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 140,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  foldersList: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  folderCardContainer: {
    marginRight: 12,
    paddingVertical: 4,
  },
  folderCard: {
    width: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  folderIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF2E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  folderNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 2,
  },
  folderDateText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  emptyBox: {
    marginHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  filesList: {
    paddingHorizontal: 24,
  },
});

export default HomeScreen;
