import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import NeuInput from '../components/ui/NeuInput';
import NeuButton from '../components/ui/NeuButton';
import { AuthContext } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const SignupScreen = ({ navigation }: Props) => {
  const { register } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Details',
        text2: 'Please fill in every field.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Confirm password must match your password.',
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
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
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft size={24} color="#ffffff" />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={styles.logoBox}>
              <BookOpen size={40} color="#000000" strokeWidth={1.5} />
            </View>
          </View>

          {/* Bottom White Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.title}>Sign Up</Text>

            <View style={styles.form}>
              <NeuInput label="First name" placeholder="_________________________________" value={firstName} onChangeText={setFirstName} />
              <NeuInput label="Last name" placeholder="_________________________________" value={lastName} onChangeText={setLastName} />
              <NeuInput label="Email" placeholder="_________________________________" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <NeuInput label="Password" placeholder="_________________" secureTextEntry value={password} onChangeText={setPassword} />
              <NeuInput label="Confirm password" placeholder="_________________" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

              <NeuButton title={loading ? "Loading..." : "Sign Up"} onPress={handleSignup} style={styles.signupBtn} disabled={loading} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.footerTextBold}>Sign In</Text>
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
    position: 'relative',
  },
  safeArea: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backBtn: { padding: 8 },
  logoBox: {
    width: 80, 
    height: 80, 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 100,
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
  signupBtn: { marginTop: 10 },
  footerLink: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#52525b', fontSize: 14 },
  footerTextBold: { color: '#000000', fontWeight: '500' },
});

export default SignupScreen;
