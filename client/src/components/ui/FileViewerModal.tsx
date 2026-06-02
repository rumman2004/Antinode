import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ActivityIndicator, StatusBar, Image, Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Download, Share2, ChevronLeft, FileText, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FileViewerModalProps {
  visible: boolean;
  fileUrl: string | null;
  fileName: string;
  mimeType: string;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const FileViewerModal = ({
  visible, fileUrl, fileName, mimeType, onClose, onDownload, onShare,
}: FileViewerModalProps) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isImage = mimeType?.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';
  const isDoc = mimeType?.includes('word') || mimeType?.includes('document') ||
    mimeType?.includes('spreadsheet') || mimeType?.includes('excel') ||
    mimeType?.includes('presentation') || mimeType?.includes('powerpoint');
  const isText = mimeType?.startsWith('text/');
  const isViewable = isImage || isPdf || isDoc || isText;

  const getViewerUrl = (): string | null => {
    if (!fileUrl) return null;
    if (isImage) return fileUrl;
    if (isPdf || isDoc) return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
    if (isText) return fileUrl;
    return null;
  };

  const getFileTypeLabel = (): string => {
    if (isPdf) return 'PDF Document';
    if (isDoc) return 'Office Document';
    if (isImage) return 'Image';
    if (isText) return 'Text File';
    return 'File';
  };

  const handleLoad = () => { setLoading(false); setError(false); };
  const handleError = () => { setLoading(false); setError(true); };
  const handleClose = () => { setLoading(true); setError(false); onClose(); };

  const viewerUrl = getViewerUrl();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <StatusBar barStyle="light-content" backgroundColor={colors.leather} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.leather }]} edges={['top']}>
        {/* Leather Header */}
        <View style={[styles.header, { backgroundColor: colors.leather, borderBottomColor: colors.leatherDark }]}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.leatherLight }]} onPress={handleClose}>
            <ChevronLeft size={22} color={colors.amber} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.amber }]} numberOfLines={1}>{fileName}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.stitch }]}>{getFileTypeLabel()}</Text>
          </View>

          <View style={styles.headerActions}>
            {onShare && (
              <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.leatherLight }]} onPress={onShare}>
                <Share2 size={18} color={colors.amber} />
              </TouchableOpacity>
            )}
            {onDownload && (
              <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.leatherLight }]} onPress={onDownload}>
                <Download size={18} color={colors.amber} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.contentArea, { backgroundColor: colors.parchment }]}>
          {!isViewable ? (
            <View style={styles.unsupportedContainer}>
              <View style={[styles.unsupportedIcon, { backgroundColor: colors.cream }]}>
                <FileText size={44} color={colors.textMuted} />
              </View>
              <Text style={[styles.unsupportedTitle, { color: colors.text }]}>Preview Unavailable</Text>
              <Text style={[styles.unsupportedText, { color: colors.textSecondary }]}>
                This file type ({mimeType || 'unknown'}) cannot be previewed.
              </Text>
              {onDownload && (
                <TouchableOpacity style={[styles.downloadFallback, { backgroundColor: colors.amber, shadowColor: colors.amber }]} onPress={onDownload}>
                  <View style={styles.btnShine} />
                  <Download size={18} color={colors.walnut} />
                  <Text style={[styles.downloadFallbackText, { color: colors.walnut }]}>Download to View</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : error ? (
            <View style={styles.unsupportedContainer}>
              <View style={[styles.unsupportedIcon, { backgroundColor: colors.dangerBg }]}>
                <AlertTriangle size={44} color={colors.dangerRed} />
              </View>
              <Text style={[styles.unsupportedTitle, { color: colors.text }]}>Failed to Load</Text>
              <Text style={[styles.unsupportedText, { color: colors.textSecondary }]}>
                Could not load the file preview. Please try downloading instead.
              </Text>
              {onDownload && (
                <TouchableOpacity style={[styles.downloadFallback, { backgroundColor: colors.amber, shadowColor: colors.amber }]} onPress={onDownload}>
                  <View style={styles.btnShine} />
                  <Download size={18} color={colors.walnut} />
                  <Text style={[styles.downloadFallbackText, { color: colors.walnut }]}>Download File</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : isImage && fileUrl ? (
            <>
              {loading && (
                <View style={[styles.loaderOverlay, { backgroundColor: colors.parchment }]}>
                  <ActivityIndicator size="large" color={colors.amber} />
                  <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading image...</Text>
                </View>
              )}
              <Image source={{ uri: fileUrl }} style={[styles.imageViewer, { backgroundColor: colors.leatherDark }]} resizeMode="contain" onLoad={handleLoad} onError={handleError} />
            </>
          ) : viewerUrl ? (
            <>
              {loading && (
                <View style={[styles.loaderOverlay, { backgroundColor: colors.parchment }]}>
                  <ActivityIndicator size="large" color={colors.amber} />
                  <Text style={[styles.loaderText, { color: colors.textMuted }]}>Loading document...</Text>
                </View>
              )}
              <WebView source={{ uri: viewerUrl }} style={styles.webView} onLoad={handleLoad} onError={handleError} javaScriptEnabled domStorageEnabled startInLoadingState={false} scalesPageToFit allowFileAccess />
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  contentArea: { flex: 1 },
  webView: { flex: 1 },
  imageViewer: { flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 },
  loaderOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  unsupportedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  unsupportedIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  unsupportedTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  unsupportedText: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  downloadFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  downloadFallbackText: { fontSize: 15, fontWeight: '700' },
});

export default FileViewerModal;
