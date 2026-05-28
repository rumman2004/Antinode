import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, User, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Avatar from '../components/ui/avatar';
import GsapReveal from '../components/ui/gsapRevel';
import { getUserStats } from '../services/api';
import Toast from 'react-native-toast-message';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const ProfileScreen = ({ navigation }: Props) => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ folders: 0, files: 0, usedStorage: 0 });
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await getUserStats();
      setStats(res.data.data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
      Toast.show({
        type: 'error',
        text1: 'Sync Error',
        text2: 'Failed to retrieve storage details.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'See you next time!',
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Please try again.',
      });
    }
  };

  const renderSettingItem = (
    icon: any,
    title: string,
    subtitle: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingCard}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconContainer}>{icon}</View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const headerContent = (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Settings size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.pageTitle}>My Profile</Text>

        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" showGlow />

        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userRole}>Team Leader</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#FFD700" style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Folders</Text>
              <Text style={styles.statValue}>{stats.folders}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Items</Text>
              <Text style={styles.statValue}>{stats.files}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Used</Text>
              <Text style={styles.statValue}>{formatSize(stats.usedStorage)}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      {/* Top Black Section */}
      <View style={styles.topSection}>
        {headerContent}
        <View style={styles.curve} />
      </View>

      {/* Bottom White Section */}
      <ScrollView
        style={styles.bottomSection}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings List with GSAP animations */}
        <GsapReveal delay={200} direction="up">
          {renderSettingItem(
            <User size={24} color="#0D0D0D" />,
            'Profile & Account',
            'Edit your profile details'
          )}
        </GsapReveal>

        <GsapReveal delay={300} direction="up">
          {renderSettingItem(
            <Bell size={24} color="#0D0D0D" />,
            'Push-Notifications',
            'Set up push notifications',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: '#FFD700', false: '#e2e8f0' }}
              thumbColor={notificationsEnabled ? '#0D0D0D' : '#f4f3f4'}
            />
          )}
        </GsapReveal>

        <GsapReveal delay={400} direction="up">
          {renderSettingItem(
            <HelpCircle size={24} color="#0D0D0D" />,
            'FAQs',
            'Frequently Asked Questions'
          )}
        </GsapReveal>

        <GsapReveal delay={500} direction="up">
          {renderSettingItem(
            <LogOut size={24} color="#0D0D0D" />,
            'Logout',
            'Sign out of your account securely',
            <View style={styles.logoutArrowBtn}>
              <ChevronRight size={16} color="#FFD700" />
            </View>,
            handleLogout
          )}
        </GsapReveal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topSection: {
    backgroundColor: '#0D0D0D',
    paddingBottom: 80, // Gives room for the white curve at the bottom
    position: 'relative',
  },
  safeArea: {
    // flex: 1 removed so it can wrap content naturally
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 0,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  userRole: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 60,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 100,
  },
  upgradeCard: {
    backgroundColor: '#FF3B30',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  upgradeTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginRight: 16,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  upgradeBtn: {
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeBtnText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logoutArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
