import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import NeuInput from '../components/ui/NeuInput';
import NeuButton from '../components/ui/NeuButton';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const SignupScreen = ({ navigation }: Props) => {
  const { register } = useContext(AuthContext);
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Missing Details', text2: 'Please fill in every field.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Confirm password must match.' });
      return;
    }
    setLoading(true);
    try {
      await register({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Signup Failed', text2: error.response?.data?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.leather }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.leather }]} bounces={false}>
          <View style={[styles.topSection, { backgroundColor: colors.leather }]}>
            <View style={styles.grainOverlay} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.leatherLight }]}>
                <ArrowLeft size={22} color={colors.amber} />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={[styles.logoBox, { backgroundColor: colors.amber, shadowColor: colors.amber }]}>
              <View style={styles.logoShine} />
              <BookOpen size={36} color={colors.walnut} strokeWidth={1.5} />
            </View>
          </View>

          <View style={[styles.bottomSection, { backgroundColor: colors.parchment }]}>
            <View style={[styles.stitchLine, { borderColor: colors.stitch }]} />
            <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>

            <View style={styles.form}>
              <NeuInput label="First name" placeholder="John" value={firstName} onChangeText={setFirstName} />
              <NeuInput label="Last name" placeholder="Doe" value={lastName} onChangeText={setLastName} />
              <NeuInput label="Email" placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <NeuInput label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
              <NeuInput label="Confirm password" placeholder="••••••••" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
              <NeuButton title={loading ? "Loading..." : "Sign Up"} onPress={handleSignup} style={styles.signupBtn} disabled={loading} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Already have an account? <Text style={[styles.footerTextBold, { color: colors.amber }]}>Sign In</Text>
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
    height: 280,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  grainOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03, backgroundColor: '#FFF' },
  safeArea: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  logoBox: {
    width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    marginTop: 80, overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  logoShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(255,255,255,0.2)' },
  bottomSection: {
    flex: 1, borderTopLeftRadius: 50, paddingHorizontal: 35, paddingTop: 50, paddingBottom: 40,
  },
  stitchLine: { position: 'absolute', top: 12, left: 24, right: 24, height: 0, borderTopWidth: 2, borderStyle: 'dashed', opacity: 0.35 },
  title: { fontSize: 30, fontWeight: '700', textAlign: 'center', marginBottom: 36, letterSpacing: 0.5 },
  form: { gap: 2 },
  signupBtn: { marginTop: 8 },
  footerLink: { marginTop: 28, alignItems: 'center' },
  footerText: { fontSize: 14 },
  footerTextBold: { fontWeight: '700' },
});

export default SignupScreen;
