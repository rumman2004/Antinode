import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import NeuInput from '../components/ui/NeuInput';
import NeuButton from '../components/ui/NeuButton';
import { BookOpen } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Details',
        text2: 'Enter your email and password.',
      });
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Please check your details and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          {/* Top Black Section */}
          <View style={styles.topSection}>
            <View style={styles.logoBox}>
              <BookOpen size={40} color="#000000" strokeWidth={1.5} />
            </View>
          </View>

          {/* Bottom White Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.title}>Login</Text>

            <View style={styles.form}>
              <NeuInput label="Email" placeholder="_________________________________" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <NeuInput label="Password" placeholder="_______________" secureTextEntry value={password} onChangeText={setPassword} />

              <NeuButton title={loading ? "Loading..." : "Login"} onPress={handleLogin} style={styles.loginBtn} disabled={loading} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerLink}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.footerTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { flexGrow: 1, backgroundColor: '#000000' },
  topSection: {
    height: 320,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 80, 
    height: 80, 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 70,
    paddingHorizontal: 35,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '400', 
    color: '#000000', 
    textAlign: 'center', 
    marginBottom: 40, 
    letterSpacing: 0.5 
  },
  form: { gap: 4 },
  loginBtn: { marginTop: 10 },
  footerLink: { marginTop: 'auto', alignItems: 'center', paddingTop: 40 },
  footerText: { color: '#52525b', fontSize: 14 },
  footerTextBold: { color: '#000000', fontWeight: '500' },
});

export default LoginScreen;
