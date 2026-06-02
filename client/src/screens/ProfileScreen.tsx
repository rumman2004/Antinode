import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, ActivityIndicator,
} from 'react-native';
import { Settings, Shield, Bell, CircleHelp, LogOut, ChevronRight, Moon, Sun } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../components/layout/mainlayout';
import Avatar from '../components/ui/avatar';
import GsapReveal from '../components/ui/gsapRevel';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import api from '../services/api';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  
  const [stats, setStats] = useState({ files: 0, folders: 0, storage: 0 });
  const [loading, setLoading] = useState(true);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/files/stats');
        setStats({
          files: res.data.data.files,
          folders: res.data.data.folders,
          storage: res.data.data.usedStorage,
        });
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const menuItems = [
    { icon: <Settings size={22} color={colors.text} />, title: 'Account Settings', subtitle: 'Personal information, email' },
    { icon: <Shield size={22} color={colors.text} />, title: 'Security', subtitle: 'Password, 2FA' },
    { icon: <Bell size={22} color={colors.text} />, title: 'Notifications', subtitle: 'Push alerts, email digests' },
    { icon: <CircleHelp size={22} color={colors.text} />, title: 'Help & Support', subtitle: 'FAQ, contact us' },
  ];

  const headerContent = (
    <View style={styles.headerContainer}>
      <View style={styles.avatarWrapper}>
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" showGlow />
      </View>
      <Text style={[styles.userName, { color: colors.walnut }]}>
        {user?.firstName} {user?.lastName}
      </Text>
      <Text style={[styles.userEmail, { color: colors.stitch }]}>{user?.email}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.parchment }]}>
      <MainLayout headerHeight={300} headerContent={headerContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.amber} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Skeuomorphic Stats Panel */}
            <GsapReveal delay={100} direction="up">
              <View style={[styles.statsPanel, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
                {/* Embossed edge */}
                <View style={[styles.panelEdge, { backgroundColor: colors.emboss }]} />
                
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stats.folders}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Folders</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stats.files}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Files</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{formatSize(stats.storage)}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Storage</Text>
                </View>
              </View>
            </GsapReveal>

            {/* Dark Mode Toggle */}
            <GsapReveal delay={200} direction="up">
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
              </View>
              <View style={[styles.themeCard, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
                <View style={[styles.panelEdge, { backgroundColor: colors.emboss }]} />
                <View style={[styles.iconBox, { backgroundColor: colors.parchment }]}>
                  {isDark ? <Moon size={22} color={colors.text} /> : <Sun size={22} color={colors.text} />}
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>
                    Toggle leather aesthetic
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: colors.parchment, true: colors.amber }}
                  thumbColor={colors.brass}
                  onValueChange={toggleTheme}
                  value={isDark}
                />
              </View>
            </GsapReveal>

            {/* Menu Items */}
            <View style={[styles.sectionHeader, { marginTop: 32 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
            </View>
            
            <View style={[styles.menuContainer, { backgroundColor: colors.cream, borderColor: colors.cardBorder }]}>
              <View style={[styles.panelEdge, { backgroundColor: colors.emboss }]} />
              
              {menuItems.map((item, index) => (
                <GsapReveal key={index} delay={300 + index * 50} direction="up">
                  <TouchableOpacity
                    style={[styles.menuItem, index !== menuItems.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: StyleSheet.hairlineWidth }]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: colors.parchment }]}>
                      {item.icon}
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </GsapReveal>
              ))}
            </View>

            {/* Logout Button */}
            <GsapReveal delay={600} direction="up">
              <TouchableOpacity
                style={[styles.logoutBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerRed }]}
                activeOpacity={0.8}
                onPress={() => setLogoutConfirmVisible(true)}
              >
                <LogOut size={20} color={colors.dangerRed} />
                <Text style={[styles.logoutText, { color: colors.dangerRed }]}>Log Out</Text>
              </TouchableOpacity>
            </GsapReveal>

          </ScrollView>
        )}
      </MainLayout>

      <ConfirmSheet
        visible={logoutConfirmVisible}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        danger={true}
        confirmText="Log Out"
        onClose={() => setLogoutConfirmVisible(false)}
        onConfirm={() => {
          setLogoutConfirmVisible(false);
          logout();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { alignItems: 'center', paddingTop: 20 },
  avatarWrapper: { marginBottom: 16 },
  userName: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 14, fontWeight: '500' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 20, paddingHorizontal: 24, paddingBottom: 140 },
  statsPanel: {
    flexDirection: 'row', borderRadius: 16, paddingVertical: 20, marginBottom: 32,
    borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    overflow: 'hidden',
  },
  panelEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: '80%', alignSelf: 'center' },
  sectionHeader: { marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  themeCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16,
    borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  themeInfo: { flex: 1, marginHorizontal: 12 },
  menuContainer: {
    borderRadius: 16, paddingHorizontal: 16, marginBottom: 32,
    borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  menuSubtitle: { fontSize: 13 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20,
  },
  logoutText: { fontSize: 16, fontWeight: '700', marginLeft: 10 },
});

export default ProfileScreen;
