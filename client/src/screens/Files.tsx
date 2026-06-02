import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, DeviceEventEmitter,
} from 'react-native';
import { Folder, MoreVertical, LayoutGrid, List, ChevronLeft, Trash2, Edit2, Database, Settings, FolderInput } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../components/layout/mainlayout';
import FAB from '../components/ui/FAB';
import GsapReveal from '../components/ui/gsapRevel';
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
  deleteFile, moveFile, renameFile, getDownloadUrl,
} from '../services/api';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

type RootStackParamList = { Dashboard: { folderId?: string; folderName?: string }; };
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;
interface Props { navigation?: NativeStackNavigationProp<any, any>; route?: DashboardScreenRouteProp; }

const DashboardScreen = ({ navigation, route }: Props) => {
  const { colors } = useTheme();
  const folderId = route?.params?.folderId || null;
  const folderName = route?.params?.folderName || 'Files';

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
      const [foldersRes, filesRes] = await Promise.all([
        getFolders(folderId), api.get(folderId ? `/files?folderId=${folderId}` : '/files'),
      ]);
      setFolders(foldersRes.data.data);
      setFiles(filesRes.data.data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load folder contents.' });
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [folderId]);

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

  const handleCreateFolder = async (name: string) => {
    setFolderModalVisible(false);
    try {
      await createFolder(name, folderId);
      Toast.show({ type: 'success', text1: 'Folder Created' });
      loadData(true);
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Error' }); }
  };

  const handleFolderLongPress = (folder: any) => { setSelectedItem(folder); setItemType('folder'); setFolderActionSheetVisible(true); };

  const handleRenameFolder = async (newName: string) => {
    setRenameModalVisible(false);
    if (!selectedItem) return;
    try {
      await renameFolder(selectedItem._id, newName);
      Toast.show({ type: 'success', text1: 'Renamed', text2: `Renamed to "${newName}"` });
      loadData(true);
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Rename Failed' }); }
  };

  const handleRenameFile = async (newName: string) => {
    setRenameModalVisible(false);
    if (!selectedItem) return;
    try {
      await renameFile(selectedItem._id, newName);
      Toast.show({ type: 'success', text1: 'Renamed', text2: `Renamed to "${newName}"` });
      loadData(true);
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Rename Failed' }); }
  };

  const handleDeleteFolderConfirm = () => {
    if (!selectedItem) return;
    setFolderActionSheetVisible(false);
    setConfirmModalConfig({
      visible: true, title: 'Delete Folder', message: `Delete "${selectedItem.name}"?`, danger: true,
      onConfirm: async () => {
        try {
          await deleteFolder(selectedItem._id);
          Toast.show({ type: 'success', text1: 'Deleted' });
          setConfirmModalConfig(prev => ({ ...prev, visible: false }));
          loadData(true);
        } catch (error: any) { Toast.show({ type: 'error', text1: 'Delete Failed' }); }
      },
    });
  };

  const handleFileLongPress = (file: any) => { setSelectedItem(file); setItemType('file'); setFileActionSheetVisible(true); };

  const handleFilePress = async (file: any) => {
    setSelectedItem(file); setItemType('file');
    const viewable = file.mimeType?.startsWith('image/') || file.mimeType === 'application/pdf' ||
      file.mimeType?.includes('word') || file.mimeType?.includes('document') || file.mimeType?.startsWith('text/');
    if (viewable) {
      try {
        Toast.show({ type: 'info', text1: 'Opening...', text2: file.originalName, visibilityTime: 1500 });
        const res = await getDownloadUrl(file._id);
        setViewerUrl(res.data.data.url); setViewerFileName(file.originalName); setViewerMimeType(file.mimeType);
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
        Toast.hide(); Toast.show({ type: 'success', text1: 'Downloaded' });
      } else {
        const localUri = `${(FileSystem as any).documentDirectory}${file.originalName}`;
        const downloadRes = await (FileSystem as any).downloadAsync(downloadUrl, localUri);
        Toast.hide(); await Sharing.shareAsync(downloadRes.uri); return null;
      }
    } catch (e) { Toast.show({ type: 'error', text1: 'Download Failed' }); }
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
      setPreviewModalVisible(false); loadData(true);
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Move Failed' }); }
  };

  const handleDeleteFileConfirm = (file = selectedItem) => {
    if (!file) return;
    setFileActionSheetVisible(false); setPreviewModalVisible(false);
    setConfirmModalConfig({
      visible: true, title: 'Delete File', message: `Delete "${file.originalName}"?`, danger: true,
      onConfirm: async () => {
        try {
          await deleteFile(file._id);
          Toast.show({ type: 'success', text1: 'Deleted' });
          setConfirmModalConfig(prev => ({ ...prev, visible: false }));
          loadData(true);
        } catch (error: any) { Toast.show({ type: 'error', text1: 'Delete Failed' }); }
      },
    });
  };

  const headerContent = (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.leatherLight }]} onPress={() => navigation?.goBack()}>
          <ChevronLeft size={24} color={colors.amber} />
        </TouchableOpacity>
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity style={[styles.viewToggleBtn, viewMode === 'list' && { backgroundColor: colors.leatherLight }]} onPress={() => setViewMode('list')}>
            <List size={20} color={viewMode === 'list' ? colors.amber : colors.stitch} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.viewToggleBtn, viewMode === 'grid' && { backgroundColor: colors.leatherLight }]} onPress={() => setViewMode('grid')}>
            <LayoutGrid size={20} color={viewMode === 'grid' ? colors.amber : colors.stitch} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.titleContainer}>
        <Text style={[styles.headerSubtitle, { color: colors.stitch }]}>
          {folderId ? 'Subfolder' : 'Root'}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.amber }]} numberOfLines={1}>{folderName}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.parchment }]}>
      <MainLayout headerHeight={190} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.amber} />
            <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading contents...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.amber]} />}>
            
            {(folders.length === 0 && files.length === 0) ? (
              <View style={[styles.emptyStateContainer, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.parchment }]}>
                  <Folder size={40} color={colors.stitch} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>This folder is empty</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Use the + button below to upload files or create subfolders.</Text>
              </View>
            ) : (
              <View style={[viewMode === 'grid' ? styles.gridContainer : styles.listContainer]}>
                {folders.map((item, index) => (
                  <GsapReveal key={item._id} delay={index * 50} direction="up" style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
                    <FileCard type="folder" name={item.name} date={formatDate(item.createdAt)} info="Folder" viewMode={viewMode}
                      onPress={() => navigation?.push('Dashboard', { folderId: item._id, folderName: item.name })}
                      onLongPress={() => handleFolderLongPress(item)} />
                  </GsapReveal>
                ))}
                {files.map((item, index) => (
                  <GsapReveal key={item._id} delay={(folders.length + index) * 50} direction="up" style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
                    <FileCard type="file" name={item.originalName} date={formatDate(item.createdAt)} info={formatSize(item.size)} mimeType={item.mimeType} viewMode={viewMode}
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
      <UploadFileModal visible={uploadModalVisible} onClose={() => setUploadModalVisible(false)} folderId={folderId}
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  viewToggleContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  viewToggleBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { paddingLeft: 4 },
  headerSubtitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  loaderText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingTop: 20, paddingBottom: 140, paddingHorizontal: 24 },
  listContainer: { gap: 0 },
  listItem: { width: '100%' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

export default DashboardScreen;
