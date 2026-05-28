import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Star, FileText, Database } from 'lucide-react-native';
import MainLayout from '../components/layout/mainlayout';
import FileCard from '../components/ui/FileCard';
import GsapReveal from '../components/ui/gsapRevel';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const FavoritesScreen = ({ navigation }: any) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // In a full implementation, this would fetch only starred/favorited files.
      // For now, we fetch recent files as a placeholder for important items.
      const res = await api.get('/files');
      setFiles(res.data.data.slice(0, 5)); // Just showing a few files for the UI
    } catch (e) {
      console.error('Failed to load favorites:', e);
      Toast.show({
        type: 'error',
        text1: 'Sync Error',
        text2: 'Failed to retrieve favorite files.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
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

  const headerContent = (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Favorites</Text>
      <Text style={styles.headerSubtitle}>Your most important files, quickly accessible.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MainLayout headerHeight={160} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loaderText}>Loading favorites...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFD700']} />}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Star size={20} color="#FFD700" fill="#FFD700" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Starred Files</Text>
              </View>
            </View>

            {files.length === 0 ? (
              <View style={styles.emptyBox}>
                <Database size={32} color="#D1D5DB" />
                <Text style={styles.emptyText}>No favorites added yet</Text>
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
                      onPress={() => {}}
                    />
                  </GsapReveal>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </MainLayout>
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
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D0D',
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

export default FavoritesScreen;
