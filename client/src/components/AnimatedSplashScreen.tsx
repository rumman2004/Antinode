import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';

const TITLE = "Antinode";
const SUBTITLE = "Manage your Notes and documents in one place.";

export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const [titleText, setTitleText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [typingSubtitle, setTypingSubtitle] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Orchestrate Animations
  useEffect(() => {
    // 1. Pop in the App Icon smoothly
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 2. Start typing title after icon appears
      let index = 0;
      const titleInterval = setInterval(() => {
        setTitleText(TITLE.substring(0, index + 1));
        index++;
        if (index === TITLE.length) {
          clearInterval(titleInterval);
          setTimeout(() => setTypingSubtitle(true), 300);
        }
      }, 100);
    });
  }, []);

  // 3. Subtitle typing effect & Fade out
  useEffect(() => {
    if (!typingSubtitle) return;
    let index = 0;
    const subInterval = setInterval(() => {
      setSubtitleText(SUBTITLE.substring(0, index + 1));
      index++;
      if (index === SUBTITLE.length) {
        clearInterval(subInterval);
        setTimeout(() => {
          // 4. Fade out everything beautifully
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            onFinish();
          });
        }, 1500); // stay visible for 1.5s
      }
    }, 30); // 30ms per letter for subtitle

    return () => clearInterval(subInterval);
  }, [typingSubtitle]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Image 
        source={require('../../assets/icon.png')} 
        style={[
          styles.icon, 
          { opacity: iconOpacity, transform: [{ scale: iconScale }] }
        ]} 
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {titleText}
          {!typingSubtitle && <Text style={{ opacity: showCursor ? 1 : 0, color: '#38BDF8' }}>_</Text>}
        </Text>
        <Text style={styles.subtitle}>
          {subtitleText}
          {typingSubtitle && subtitleText.length !== SUBTITLE.length && <Text style={{ opacity: showCursor ? 1 : 0, color: '#38BDF8' }}>|</Text>}
        </Text>
      </View>
    </Animated.View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: '#FFFFFF', // Clean White Background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 24, // Subtle rounded corners for the app icon
  },
  textContainer: {
    alignItems: 'center',
    width: width * 0.85,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#000000', // Solid Black Title
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B', // Cool Gray Subtitle
    textAlign: 'center',
    minHeight: 48,
    lineHeight: 24,
    fontWeight: '500'
  }
});
