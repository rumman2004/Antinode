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
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { ArrowLeft, Folder, MoreVertical, Settings, Database, Trash2, Edit2, FolderInput, LayoutGrid, List } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/layout/mainlayout';
import Avatar from '../components/ui/avatar';
import GsapReveal from '../components/ui/gsapRevel';
import FAB from '../components/ui/FAB';
import CreateFolderModal from '../components/ui/CreateFolderModal';
import MoveFileModal from '../components/ui/MoveFileModal';
import UploadFileModal from '../components/ui/uploadfilemodal';
import DocumentPreviewModal from '../components/ui/documentPreviewModal';
import ActionSheet from '../components/ui/ActionSheet';
import FileCard from '../components/ui/FileCard';
import FileViewerModal from '../components/ui/FileViewerModal';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import api, {
  getFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
  deleteFile,
  moveFile,
  getDownloadUrl,
} from '../services/api';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Platform } from 'react-native';

type RootStackParamList = {
  Dashboard: { folderId: string; folderName: string };
  Profile: undefined;
};

type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: NativeStackNavigationProp<any, any>;
  route: DashboardScreenRouteProp;
}

const FolderContentsScreen = ({ navigation, route }: any) => {
  const { user } = useContext(AuthContext);
  const { folderId, folderName } = route?.params || {};

  // When opened from the tab bar without params, this is the root "All Files" view
  const isRootView = !folderId;

  // States
  const [folder, setFolder] = useState<any>(null);
  const [subFolders, setSubFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);

  // Context Action States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'folder' | 'file' | null>(null);
  const [folderActionSheetVisible, setFolderActionSheetVisible] = useState(false);
  const [fileActionSheetVisible, setFileActionSheetVisible] = useState(false);
  const [parentActionSheetVisible, setParentActionSheetVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerFileName, setViewerFileName] = useState('');
  const [viewerMimeType, setViewerMimeType] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [confirmModalConfig, setConfirmModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    danger: true,
    onConfirm: () => {},
  });

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (isRootView) {
        // Load root folders and all files
        const [foldersRes, filesRes] = await Promise.all([
          api.get('/folders'),
          api.get('/files'),
        ]);
        setSubFolders(foldersRes.data.data || []);
        setFiles(filesRes.data.data || []);
        setFolder(null);
      } else {
        const res = await getFolderContents(folderId);
        const data = res.data.data;
        setFolder(data.folder);
        setSubFolders(data.subFolders);
        setFiles(data.files);
      }
    } catch (e) {
      console.error('Failed to load folder contents:', e);
      Toast.show({
        type: 'error',
        text1: 'Sync Error',
        text2: 'Failed to retrieve folder contents.',
      });
      if (!isRootView) navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [folderId, navigation, isRootView]);

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

  // Folder Operations
  const handleCreateSubFolder = async (name: string) => {
    setFolderModalVisible(false);
    try {
      await createFolder(name, folderId);
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

  const handleFolderLongPress = (subFolder: any) => {
    setSelectedItem(subFolder);
    setItemType('folder');
    setFolderActionSheetVisible(true);
  };

  const handleRenameFolder = async (newName: string) => {
    setRenameModalVisible(false);
    const targetId = selectedItem ? selectedItem._id : folderId;
    const isCurrent = !selectedItem;
    try {
      await renameFolder(targetId, newName);
      Toast.show({
        type: 'success',
        text1: 'Folder Renamed',
        text2: `Renamed to "${newName}"`,
      });
      if (isCurrent) {
        navigation.setParams({ folderName: newName });
      }
      loadData(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Rename Failed',
        text2: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleDeleteFolderConfirm = (targetFolder = selectedItem) => {
    const idToDelete = targetFolder ? targetFolder._id : folderId;
    const nameToDelete = targetFolder ? targetFolder.name : folderName;
    const isCurrent = !targetFolder;

    setConfirmModalConfig({
      visible: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${nameToDelete}"? This action cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await deleteFolder(idToDelete);
          Toast.show({
            type: 'success',
            text1: 'Folder Deleted',
            text2: `Successfully deleted "${nameToDelete}"`,
          });
          if (isCurrent) {
            navigation.goBack();
          } else {
            loadData(true);
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Delete Failed',
            text2: error.response?.data?.message || 'Could not delete folder',
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
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Cannot open file',
          text2: 'Failed to retrieve file URL',
        });
      }
    } else {
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
        return targetUri;
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
        // Prompt to share/save since sandbox storage is hidden
        await Sharing.shareAsync(downloadRes.uri);
        return null; // Return null so handleShareFile doesn't share again
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
          setPreviewModalVisible(false);
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

  // Header content component
  const headerContent = (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        {!isRootView ? (
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.moreBtn}
            activeOpacity={0.7}
            onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List size={24} color="#FFFFFF" />
            ) : (
              <LayoutGrid size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {!isRootView && (
            <TouchableOpacity
              style={styles.moreBtn}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedItem(null);
                setItemType('folder');
                setParentActionSheetVisible(true);
              }}
            >
              <MoreVertical size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.profileBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profile')}
          >
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" showGlow={false} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {isRootView ? 'All Files' : folderName}
      </Text>

      <Text style={styles.headerSubtitle} numberOfLines={1}>
        {isRootView ? 'Browse all your folders and files' : `Home · My storage · ${folderName}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MainLayout headerHeight={220} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loaderText}>Syncing folder contents...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFD700']} />
            }
          >
            {/* Sub-Folders Section */}
            {subFolders.length > 0 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{isRootView ? 'Folders' : 'Sub-Folders'}</Text>
                </View>
                <View style={viewMode === 'grid' ? styles.foldersGrid : styles.filesList}>
                  {subFolders.map((item, index) => (
                    <GsapReveal 
                      key={item._id} 
                      delay={index * 50} 
                      direction={viewMode === 'grid' ? "up" : "right"} 
                      style={viewMode === 'grid' ? { width: '48%', marginBottom: 12 } : { width: '100%' }}
                    >
                      <FileCard
                        type="folder"
                        name={item.name}
                        date={formatDate(item.createdAt)}
                        info="Folder"
                        viewMode={viewMode}
                        onPress={() =>
                          navigation.push('Dashboard', {
                            folderId: item._id,
                            folderName: item.name,
                          })
                        }
                        onLongPress={() => handleFolderLongPress(item)}
                      />
                    </GsapReveal>
                  ))}
                </View>
              </View>
            )}

            {/* Files Section */}
            <View style={[styles.sectionHeader, { marginTop: subFolders.length > 0 ? 20 : 8 }]}>
              <Text style={styles.sectionTitle}>Files</Text>
            </View>

            {files.length === 0 ? (
              <View style={styles.emptyBox}>
                <Database size={32} color="#D1D5DB" />
                <Text style={styles.emptyText}>This folder is empty</Text>
              </View>
            ) : (
              <View style={viewMode === 'grid' ? styles.foldersGrid : styles.filesList}>
                {files.map((item, index) => (
                  <GsapReveal 
                    key={item._id} 
                    delay={index * 50} 
                    direction={viewMode === 'grid' ? "up" : "right"}
                    style={viewMode === 'grid' ? { width: '48%', marginBottom: 12 } : { width: '100%' }}
                  >
                    <FileCard
                      type="file"
                      name={item.originalName}
                      date={formatDate(item.createdAt)}
                      info={formatSize(item.size)}
                      mimeType={item.mimeType}
                      viewMode={viewMode}
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
        onConfirm={handleCreateSubFolder}
      />

      <CreateFolderModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={handleRenameFolder}
        title={selectedItem ? 'Rename Sub-Folder' : 'Rename Folder'}
        initialValue={selectedItem ? selectedItem.name : folderName}
      />

      <UploadFileModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        folderId={folderId}
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

      {/* Action Sheets */}
      {/* ActionSheet for sub-folders long press */}
      <ActionSheet
        visible={folderActionSheetVisible}
        onClose={() => setFolderActionSheetVisible(false)}
        title={selectedItem?.name}
        actions={[
          {
            icon: <Edit2 size={18} color="#0D0D0D" />,
            label: 'Rename',
            onPress: () => setRenameModalVisible(true),
          },
          {
            icon: <Trash2 size={18} color="#DC2626" />,
            label: 'Delete',
            onPress: () => handleDeleteFolderConfirm(selectedItem),
            danger: true,
          },
        ]}
      />

      {/* ActionSheet for files long press */}
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

      {/* ActionSheet for parent folder menu (More button in header) */}
      <ActionSheet
        visible={parentActionSheetVisible}
        onClose={() => setParentActionSheetVisible(false)}
        title={folderName}
        actions={[
          {
            icon: <Edit2 size={20} color="#0D0D0D" />,
            label: 'Rename Folder',
            onPress: () => {
              setParentActionSheetVisible(false);
              setTimeout(() => setRenameModalVisible(true), 300);
            },
          },
          {
            icon: <Trash2 size={20} color="#FF3B30" />,
            label: 'Delete Folder',
            onPress: () => handleDeleteFolderConfirm(null),
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
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moreBtn: {
    padding: 4,
  },
  profileBtn: {
    padding: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  foldersGrid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  folderCard: {
    width: (Dimensions.get('window').width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  folderIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF2E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  folderInfo: {
    flex: 1,
  },
  folderNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 2,
  },
  folderDateText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  emptyBox: {
    marginHorizontal: 24,
    paddingVertical: 32,
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

export default FolderContentsScreen;
