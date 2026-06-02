import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import NeuInput from '../components/ui/NeuInput';
import NeuButton from '../components/ui/NeuButton';
import { BookOpen } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useContext(AuthContext);
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Missing Details', text2: 'Enter your email and password.' });
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.response?.data?.message || 'Please check your details and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.leather }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.leather }]} bounces={false}>
          {/* Leather Top Section */}
          <View style={[styles.topSection, { backgroundColor: colors.leather }]}>
            <View style={styles.grainOverlay} />
            <View style={[styles.logoBox, { backgroundColor: colors.amber, shadowColor: colors.amber }]}>
              <View style={styles.logoShine} />
              <BookOpen size={36} color={colors.walnut} strokeWidth={1.5} />
            </View>
          </View>

          {/* Parchment Bottom Section */}
          <View style={[styles.bottomSection, { backgroundColor: colors.parchment }]}>
            {/* Stitch line */}
            <View style={[styles.stitchLine, { borderColor: colors.stitch }]} />

            <Text style={[styles.title, { color: colors.text }]}>Login</Text>

            <View style={styles.form}>
              <NeuInput label="Email" placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <NeuInput label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
              <NeuButton title={loading ? "Loading..." : "Login"} onPress={handleLogin} style={styles.loginBtn} disabled={loading} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerLink}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Don't have an account? <Text style={[styles.footerTextBold, { color: colors.amber }]}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  topSection: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  grainOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
    backgroundColor: '#FFF',
  },
  logoBox: {
    width: 80, 
    height: 80, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 40,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  logoShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bottomSection: {
    flex: 1,
    borderTopLeftRadius: 50,
    paddingHorizontal: 35,
    paddingTop: 50,
    paddingBottom: 40,
  },
  stitchLine: {
    position: 'absolute',
    top: 12,
    left: 24,
    right: 24,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.35,
  },
  title: { 
    fontSize: 30, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 36, 
    letterSpacing: 0.5,
  },
  form: { gap: 2 },
  loginBtn: { marginTop: 8 },
  footerLink: { marginTop: 'auto', alignItems: 'center', paddingTop: 40 },
  footerText: { fontSize: 14 },
  footerTextBold: { fontWeight: '700' },
});

export default LoginScreen;
