import React, { useState } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
      {isSplashVisible && (
        <AnimatedSplashScreen onFinish={() => setIsSplashVisible(false)} />
      )}
    </ThemeProvider>
  );
}
