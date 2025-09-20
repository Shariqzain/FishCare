
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { useFonts, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const [fontsLoaded] = useFonts({ CinzelDecorative_700Bold });

  useEffect(() => {
    if (!fontsLoaded) return;
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete && onComplete();
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textContainer, { opacity: fadeOutAnim }]}> 
        <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>SIXTH</Animated.Text>
        <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>SENSE</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 10,
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 72,
    fontFamily: Platform.select({
      ios: 'CinzelDecorative_700Bold',
      android: 'CinzelDecorative_700Bold',
      default: 'CinzelDecorative_700Bold',
    }),
    letterSpacing: 3,
    marginVertical: -12,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});