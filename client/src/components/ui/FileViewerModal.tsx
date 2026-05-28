import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  X,
  Download,
  Share2,
  ChevronLeft,
  FileText,
  AlertTriangle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

/**
 * In-app file viewer that renders PDFs, Docs, images, and text files.
 * Uses Google Docs Viewer for documents and native Image for images.
 */
const FileViewerModal = ({
  visible,
  fileUrl,
  fileName,
  mimeType,
  onClose,
  onDownload,
  onShare,
}: FileViewerModalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isImage = mimeType?.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';
  const isDoc =
    mimeType?.includes('word') ||
    mimeType?.includes('document') ||
    mimeType?.includes('spreadsheet') ||
    mimeType?.includes('excel') ||
    mimeType?.includes('presentation') ||
    mimeType?.includes('powerpoint');
  const isText = mimeType?.startsWith('text/');
  const isViewable = isImage || isPdf || isDoc || isText;

  const getViewerUrl = (): string | null => {
    if (!fileUrl) return null;

    if (isImage) {
      return fileUrl; // Rendered by <Image /> directly
    }

    if (isPdf || isDoc) {
      // Use Google Docs Viewer to render PDF/DOCX/XLSX/PPTX inline
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
    }

    if (isText) {
      return fileUrl; // WebView can render raw text
    }

    return null;
  };

  const getFileTypeLabel = (): string => {
    if (isPdf) return 'PDF Document';
    if (isDoc) return 'Office Document';
    if (isImage) return 'Image';
    if (isText) return 'Text File';
    return 'File';
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleClose = () => {
    setLoading(true);
    setError(false);
    onClose();
  };

  const viewerUrl = getViewerUrl();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.headerSubtitle}>{getFileTypeLabel()}</Text>
          </View>

          <View style={styles.headerActions}>
            {onShare && (
              <TouchableOpacity style={styles.headerBtn} onPress={onShare}>
                <Share2 size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {onDownload && (
              <TouchableOpacity style={styles.headerBtn} onPress={onDownload}>
                <Download size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {!isViewable ? (
            // Unsupported file type
            <View style={styles.unsupportedContainer}>
              <View style={styles.unsupportedIcon}>
                <FileText size={48} color="#94A3B8" />
              </View>
              <Text style={styles.unsupportedTitle}>Preview Unavailable</Text>
              <Text style={styles.unsupportedText}>
                This file type ({mimeType || 'unknown'}) cannot be previewed in the app.
              </Text>
              {onDownload && (
                <TouchableOpacity style={styles.downloadFallback} onPress={onDownload}>
                  <Download size={18} color="#0D0D0D" />
                  <Text style={styles.downloadFallbackText}>Download to View</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : error ? (
            // Error state
            <View style={styles.unsupportedContainer}>
              <View style={[styles.unsupportedIcon, { backgroundColor: '#FEF2F2' }]}>
                <AlertTriangle size={48} color="#EF4444" />
              </View>
              <Text style={styles.unsupportedTitle}>Failed to Load</Text>
              <Text style={styles.unsupportedText}>
                Could not load the file preview. Please try downloading instead.
              </Text>
              {onDownload && (
                <TouchableOpacity style={styles.downloadFallback} onPress={onDownload}>
                  <Download size={18} color="#0D0D0D" />
                  <Text style={styles.downloadFallbackText}>Download File</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : isImage && fileUrl ? (
            // Image viewer
            <>
              {loading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loaderText}>Loading image...</Text>
                </View>
              )}
              <Image
                source={{ uri: fileUrl }}
                style={styles.imageViewer}
                resizeMode="contain"
                onLoad={handleLoad}
                onError={handleError}
              />
            </>
          ) : viewerUrl ? (
            // WebView for PDF/Docs/Text
            <>
              {loading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loaderText}>Loading document...</Text>
                </View>
              )}
              <WebView
                source={{ uri: viewerUrl }}
                style={styles.webView}
                onLoad={handleLoad}
                onError={handleError}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState={false}
                scalesPageToFit
                allowFileAccess
              />
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#0D0D0D',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
  },
  imageViewer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#0D0D0D',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    zIndex: 10,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unsupportedIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  unsupportedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0D0D',
    marginBottom: 8,
  },
  unsupportedText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  downloadFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadFallbackText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D0D0D',
  },
});

export default FileViewerModal;
