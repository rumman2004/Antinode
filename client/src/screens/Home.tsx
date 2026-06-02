import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, DeviceEventEmitter,
} from 'react-native';
import { Folder, MoreVertical, Database, Trash2, Edit2, FolderInput, Settings } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  getFolders, createFolder, renameFolder, deleteFolder,
  deleteFile, moveFile, renameFile, getDownloadUrl, getUserStats,
} from '../services/api';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { safeDecode } from '../utils/helpers';

interface Props { navigation: NativeStackNavigationProp<any, any>; }

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState({ folders: 0, files: 0, usedStorage: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerFileName, setViewerFileName] = useState('');
  const [viewerMimeType, setViewerMimeType] = useState('');

  const [confirmModalConfig, setConfirmModalConfig] = useState({
    visible: false, title: '', message: '', danger: true, onConfirm: () => {},
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'folder' | 'file' | null>(null);
  const [folderActionSheetVisible, setFolderActionSheetVisible] = useState(false);
  const [fileActionSheetVisible, setFileActionSheetVisible] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [foldersRes, filesRes, statsRes] = await Promise.all([
        getFolders(null), api.get('/files'), getUserStats(),
      ]);
      setFolders(foldersRes.data.data);
      const decodedFiles = filesRes.data.data.slice(0, 10).map((f: any) => ({
        ...f, originalName: safeDecode(f.originalName)
      }));
      setFiles(decodedFiles);
      setStats(statsRes.data.data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Sync Error', text2: 'Failed to update data.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const folderSub = DeviceEventEmitter.addListener('openFolderModal', () => setFolderModalVisible(true));
    const uploadSub = DeviceEventEmitter.addListener('openUploadModal', () => setUploadModalVisible(true));
    return () => { folderSub.remove(); uploadSub.remove(); };
  }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(true); };

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
  const handleCreateFolder = async (name: string) => {
    setFolderModalVisible(false);
    try {
      await createFolder(name, null);
      Toast.show({ type: 'success', text1: 'Folder Created', text2: `Created "${name}"` });
      loadData(true);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Please try again' });
    }
  };

  const handleFolderLongPress = (folder: any) => {
    setSelectedItem(folder); setItemType('folder'); setFolderActionSheetVisible(true);
  };

  const handleRenameFolder = async (newName: string) => {
    setRenameModalVisible(false);
    if (!selectedItem) return;
    try {
      await renameFolder(selectedItem._id, newName);
      Toast.show({ type: 'success', text1: 'Renamed', text2: `Renamed to "${newName}"` });
      loadData(true);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Rename Failed', text2: error.response?.data?.message || 'Try again' });
    }
  };

  const handleRenameFile = async (newName: string) => {
    setRenameModalVisible(false);
    if (!selectedItem) return;
    try {
      await renameFile(selectedItem._id, newName);
      Toast.show({ type: 'success', text1: 'File Renamed', text2: `Renamed to "${newName}"` });
      loadData(true);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Rename Failed', text2: error.response?.data?.message || 'Try again' });
    }
  };

  const handleDeleteFolderConfirm = () => {
    if (!selectedItem) return;
    setFolderActionSheetVisible(false);
    setConfirmModalConfig({
      visible: true, title: 'Delete Folder',
      message: `Delete "${selectedItem.name}"? This cannot be undone.`, danger: true,
      onConfirm: async () => {
        try {
          await deleteFolder(selectedItem._id);
          Toast.show({ type: 'success', text1: 'Deleted', text2: `Deleted "${selectedItem.name}"` });
          setConfirmModalConfig(prev => ({ ...prev, visible: false }));
          loadData(true);
        } catch (error: any) {
          Toast.show({ type: 'error', text1: 'Delete Failed', text2: error.response?.data?.message || 'Folder may not be empty.' });
        }
      },
    });
  };

  // File Operations
  const handleFileLongPress = (file: any) => {
    setSelectedItem(file); setItemType('file'); setFileActionSheetVisible(true);
  };

  const handleFilePress = async (file: any) => {
    setSelectedItem(file); setItemType('file');
    const viewable = file.mimeType?.startsWith('image/') || file.mimeType === 'application/pdf' ||
      file.mimeType?.includes('word') || file.mimeType?.includes('document') ||
      file.mimeType?.includes('spreadsheet') || file.mimeType?.includes('excel') ||
      file.mimeType?.includes('presentation') || file.mimeType?.includes('powerpoint') ||
      file.mimeType?.startsWith('text/');

    if (viewable) {
      try {
        Toast.show({ type: 'info', text1: 'Opening...', text2: file.originalName, visibilityTime: 1500 });
        const res = await getDownloadUrl(file._id);
        setViewerUrl(res.data.data.url);
        setViewerFileName(file.originalName);
        setViewerMimeType(file.mimeType);
        setViewerVisible(true);
      } catch (e) { setPreviewModalVisible(true); }
    } else { setPreviewModalVisible(true); }
  };

  const handleDownloadFile = async (file = selectedItem) => {
    if (!file) return;
    try {
      Toast.show({ type: 'info', text1: 'Downloading...', text2: 'Fetching link', visibilityTime: 1500 });
      const res = await getDownloadUrl(file._id);
      const downloadUrl = res.data.data.url;
      if (Platform.OS === 'android' && (FileSystem as any).StorageAccessFramework) {
        const SAF = (FileSystem as any).StorageAccessFramework;
        const permissions = await SAF.requestDirectoryPermissionsAsync();
        if (!permissions.granted) { Toast.show({ type: 'error', text1: 'Permission Denied' }); return; }
        const localUri = `${(FileSystem as any).cacheDirectory}${file.originalName}`;
        await (FileSystem as any).downloadAsync(downloadUrl, localUri);
        const base64 = await (FileSystem as any).readAsStringAsync(localUri, { encoding: (FileSystem as any).EncodingType.Base64 });
        const targetUri = await SAF.createFileAsync(permissions.directoryUri, file.originalName, file.mimeType);
        await (FileSystem as any).writeAsStringAsync(targetUri, base64, { encoding: (FileSystem as any).EncodingType.Base64 });
        Toast.hide();
        Toast.show({ type: 'success', text1: 'Downloaded', text2: file.originalName });
      } else {
        const localUri = `${(FileSystem as any).documentDirectory}${file.originalName}`;
        const downloadRes = await (FileSystem as any).downloadAsync(downloadUrl, localUri);
        Toast.hide();
        await Sharing.shareAsync(downloadRes.uri);
        return null;
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Download Failed' });
    }
  };

  const handleShareFile = async (file = selectedItem) => {
    if (!file) return;
    try {
      const localUri = await handleDownloadFile(file);
      if (localUri) await Sharing.shareAsync(localUri);
    } catch (e) { Toast.show({ type: 'error', text1: 'Share Failed' }); }
  };

  const handleMoveFile = async (destinationFolderId: string | null) => {
    if (!selectedItem) return;
    try {
      await moveFile(selectedItem._id, destinationFolderId);
      Toast.show({ type: 'success', text1: 'File Moved' });
      setPreviewModalVisible(false);
      loadData(true);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Move Failed', text2: error.response?.data?.message || 'Failed' });
    }
  };

  const handleDeleteFileConfirm = (file = selectedItem) => {
    if (!file) return;
    setFileActionSheetVisible(false); setPreviewModalVisible(false);
    setConfirmModalConfig({
      visible: true, title: 'Delete File',
      message: `Delete "${file.originalName}"?`, danger: true,
      onConfirm: async () => {
        try {
          await deleteFile(file._id);
          Toast.show({ type: 'success', text1: 'Deleted', text2: file.originalName });
          setConfirmModalConfig(prev => ({ ...prev, visible: false }));
          loadData(true);
        } catch (error: any) {
          Toast.show({ type: 'error', text1: 'Delete Failed' });
        }
      },
    });
  };

  const renderFolderItem = ({ item, index }: { item: any; index: number }) => (
    <GsapReveal delay={index * 100} direction="right" style={styles.folderCardContainer}>
      <TouchableOpacity
        style={[styles.folderCard, { backgroundColor: colors.cream, borderColor: colors.cardBorder, shadowColor: colors.walnut }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Dashboard', { folderId: item._id, folderName: item.name })}
        onLongPress={() => handleFolderLongPress(item)}
        delayLongPress={200}
      >
        <View style={[styles.folderTopEdge, { backgroundColor: colors.emboss }]} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={[styles.folderIconWrapper, { backgroundColor: colors.amber }]}>
            <View style={styles.iconShine} />
            <Folder size={28} color={colors.walnut} fill={colors.amber} />
          </View>
          <TouchableOpacity onPress={() => handleFolderLongPress(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MoreVertical size={16} color={colors.brass} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.folderNameText, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.folderDateText, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
      </TouchableOpacity>
    </GsapReveal>
  );

  const headerContent = (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerSubtitle, { color: colors.stitch }]}>My storage</Text>
        <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" showGlow />
        </TouchableOpacity>
      </View>

      <Text style={[styles.headerTitle, { color: colors.amber }]}>
        {user?.firstName ? `${user.firstName}'s Space` : 'My Drive'}
      </Text>

      <View style={[styles.statsBar, { backgroundColor: colors.leatherLight, borderColor: colors.stitch }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.stitch }]}>Folders</Text>
          <Text style={[styles.statVal, { color: colors.amber }]}>{stats.folders}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.stitch }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.stitch }]}>Files</Text>
          <Text style={[styles.statVal, { color: colors.amber }]}>{stats.files}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.stitch }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.stitch }]}>Storage</Text>
          <Text style={[styles.statVal, { color: colors.amber }]}>{formatSize(stats.usedStorage)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.parchment }]}>
      <MainLayout headerHeight={310} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.amber} />
            <Text style={[styles.loaderText, { color: colors.textMuted }]}>Syncing storage...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.amber]} />}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Folders</Text>
            </View>

            {folders.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
                <Folder size={28} color={colors.stitch} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No folders created yet</Text>
              </View>
            ) : (
              <FlatList horizontal showsHorizontalScrollIndicator={false} data={folders}
                keyExtractor={(item) => item._id} renderItem={renderFolderItem} contentContainerStyle={styles.foldersList} />
            )}

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Files</Text>
            </View>

            {files.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
                <Database size={28} color={colors.stitch} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No files uploaded yet</Text>
              </View>
            ) : (
              <View style={styles.filesList}>
                {files.map((item, index) => (
                  <GsapReveal key={item._id} delay={index * 50} direction="up">
                    <FileCard type="file" name={item.originalName} date={formatDate(item.createdAt)}
                      info={formatSize(item.size)} mimeType={item.mimeType}
                      onPress={() => handleFilePress(item)} onLongPress={() => handleFileLongPress(item)} />
                  </GsapReveal>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </MainLayout>

      <CreateFolderModal visible={folderModalVisible} onClose={() => setFolderModalVisible(false)} onConfirm={handleCreateFolder} />
      <CreateFolderModal visible={renameModalVisible} onClose={() => setRenameModalVisible(false)}
        onConfirm={itemType === 'folder' ? handleRenameFolder : handleRenameFile}
        title={itemType === 'folder' ? 'Rename Folder' : 'Rename File'}
        initialValue={selectedItem ? decodeURIComponent(itemType === 'folder' ? selectedItem.name : selectedItem.originalName) : ''} />
      <UploadFileModal visible={uploadModalVisible} onClose={() => setUploadModalVisible(false)} folderId={null}
        onUploadComplete={() => { setUploadModalVisible(false); loadData(true); }} />
      <MoveFileModal visible={moveModalVisible} onClose={() => setMoveModalVisible(false)} onSelect={handleMoveFile} currentFolderId={selectedItem?.folder} />
      <DocumentPreviewModal visible={previewModalVisible} file={selectedItem}
        onClose={() => setPreviewModalVisible(false)} onOpen={() => handleFilePress(selectedItem)}
        onDownload={() => handleDownloadFile()} onShare={() => handleShareFile()}
        onMove={() => setMoveModalVisible(true)} onDelete={() => handleDeleteFileConfirm()} />
      <FileViewerModal visible={viewerVisible} fileUrl={viewerUrl} fileName={viewerFileName} mimeType={viewerMimeType}
        onClose={() => { setViewerVisible(false); setViewerUrl(null); }}
        onDownload={() => handleDownloadFile()} onShare={() => handleShareFile()} />

      <ActionSheet visible={folderActionSheetVisible} onClose={() => setFolderActionSheetVisible(false)}
        title={selectedItem?.name} actions={[
          { icon: <Edit2 size={18} color={colors.walnut} />, label: 'Rename Folder',
            onPress: () => { setFolderActionSheetVisible(false); setTimeout(() => setRenameModalVisible(true), 300); } },
          { icon: <Trash2 size={18} color={colors.dangerRed} />, label: 'Delete Folder', onPress: () => handleDeleteFolderConfirm(), danger: true },
        ]} />

      <ActionSheet visible={fileActionSheetVisible} onClose={() => setFileActionSheetVisible(false)}
        title={selectedItem?.originalName} actions={[
          { icon: <Edit2 size={18} color={colors.walnut} />, label: 'Rename File',
            onPress: () => { setFileActionSheetVisible(false); setItemType('file'); setTimeout(() => setRenameModalVisible(true), 300); } },
          { icon: <FolderInput size={18} color={colors.walnut} />, label: 'Move to folder', onPress: () => setMoveModalVisible(true) },
          { icon: <Database size={18} color={colors.walnut} />, label: 'Download file', onPress: () => handleDownloadFile() },
          { icon: <Settings size={18} color={colors.walnut} />, label: 'Share link', onPress: () => handleShareFile() },
          { icon: <Trash2 size={18} color={colors.dangerRed} />, label: 'Delete file', onPress: () => handleDeleteFileConfirm(), danger: true },
        ]} />

      <ConfirmSheet visible={confirmModalConfig.visible} title={confirmModalConfig.title}
        message={confirmModalConfig.message} danger={confirmModalConfig.danger} confirmText="Delete"
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, visible: false }))} onConfirm={confirmModalConfig.onConfirm} />


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 24, paddingTop: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  profileBtn: { padding: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800', marginBottom: 18 },
  statsBar: {
    flexDirection: 'row', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderStyle: 'dashed',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', marginBottom: 2 },
  statVal: { fontSize: 16, fontWeight: '800' },
  statDivider: { width: 1, height: 24, opacity: 0.3 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  loaderText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingTop: 8, paddingBottom: 140 },
  sectionHeader: { paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  foldersList: { paddingLeft: 24, paddingRight: 12 },
  folderCardContainer: { marginRight: 12, paddingVertical: 4 },
  folderCard: {
    width: 125, borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  folderTopEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  folderIconWrapper: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden',
  },
  iconShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(255,255,255,0.18)' },
  folderNameText: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  folderDateText: { fontSize: 11 },
  emptyBox: {
    marginHorizontal: 24, paddingVertical: 24, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed',
  },
  emptyText: { marginTop: 8, fontSize: 13, fontWeight: '500' },
  filesList: { paddingHorizontal: 24 },
});

export default HomeScreen;
