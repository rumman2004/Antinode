import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Star, Database, Trash2, Edit2, Settings, FolderInput } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../components/layout/mainlayout';
import GsapReveal from '../components/ui/gsapRevel';
import CreateFolderModal from '../components/ui/CreateFolderModal';
import MoveFileModal from '../components/ui/MoveFileModal';
import DocumentPreviewModal from '../components/ui/documentPreviewModal';
import FileViewerModal from '../components/ui/FileViewerModal';
import ActionSheet from '../components/ui/ActionSheet';
import FileCard from '../components/ui/FileCard';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import api, {
  deleteFile, moveFile, renameFile, getDownloadUrl,
} from '../services/api';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface Props { navigation: NativeStackNavigationProp<any, any>; }

const FavoritesScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  const [fileActionSheetVisible, setFileActionSheetVisible] = useState(false);

  // Note: Backend doesn't have a specific favorites API, this just shows 
  // recently uploaded files as a placeholder for a true favorites feature
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/files');
      // Just taking top 5 to simulate favorites
      setFavorites(res.data.data.slice(0, 5));
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load favorites.' });
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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

  const handleRenameFile = async (newName: string) => {
    setRenameModalVisible(false);
    if (!selectedItem) return;
    try {
      await renameFile(selectedItem._id, newName);
      Toast.show({ type: 'success', text1: 'Renamed', text2: `Renamed to "${newName}"` });
      loadData(true);
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Rename Failed' }); }
  };

  const handleFileLongPress = (file: any) => { setSelectedItem(file); setFileActionSheetVisible(true); };

  const handleFilePress = async (file: any) => {
    setSelectedItem(file);
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
      <View style={[styles.headerIconBox, { backgroundColor: colors.amber }]}>
        <View style={styles.iconShine} />
        <Star size={32} color={colors.walnut} fill={colors.walnut} />
      </View>
      <Text style={[styles.headerTitle, { color: colors.amber }]}>Favorites</Text>
      <Text style={[styles.headerSubtitle, { color: colors.stitch }]}>Your starred files and folders</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.parchment }]}>
      <MainLayout headerHeight={240} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.amber} />
            <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading favorites...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.amber]} />}>
            
            {favorites.length === 0 ? (
              <View style={[styles.emptyStateContainer, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.parchment }]}>
                  <Star size={40} color={colors.stitch} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No favorites yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Star items to access them quickly from here.</Text>
              </View>
            ) : (
              <View style={styles.filesList}>
                {favorites.map((item, index) => (
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

      <CreateFolderModal visible={renameModalVisible} onClose={() => setRenameModalVisible(false)}
        onConfirm={handleRenameFile} title="Rename File"
        initialValue={selectedItem?.originalName ? decodeURIComponent(selectedItem.originalName) : ''} />
      <MoveFileModal visible={moveModalVisible} onClose={() => setMoveModalVisible(false)} onSelect={handleMoveFile} currentFolderId={selectedItem?.folder} />
      <DocumentPreviewModal visible={previewModalVisible} file={selectedItem}
        onClose={() => setPreviewModalVisible(false)} onOpen={() => handleFilePress(selectedItem)}
        onDownload={() => handleDownloadFile()} onShare={() => handleShareFile()}
        onMove={() => setMoveModalVisible(true)} onDelete={() => handleDeleteFileConfirm()} />
      <FileViewerModal visible={viewerVisible} fileUrl={viewerUrl} fileName={viewerFileName} mimeType={viewerMimeType}
        onClose={() => { setViewerVisible(false); setViewerUrl(null); }}
        onDownload={() => handleDownloadFile()} onShare={() => handleShareFile()} />

      <ActionSheet visible={fileActionSheetVisible} onClose={() => setFileActionSheetVisible(false)}
        title={selectedItem?.originalName} actions={[
          { icon: <Edit2 size={18} color={colors.walnut} />, label: 'Rename File',
            onPress: () => { setFileActionSheetVisible(false); setTimeout(() => setRenameModalVisible(true), 300); } },
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
  headerContainer: { paddingHorizontal: 24, paddingTop: 30, alignItems: 'center' },
  headerIconBox: {
    width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  iconShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, fontWeight: '500' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  loaderText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingTop: 24, paddingBottom: 140, paddingHorizontal: 24 },
  filesList: { gap: 0 },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

export default FavoritesScreen;
