import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useFonts, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
const { width, height } = Dimensions.get('window');


export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
  const [fontsLoaded] = useFonts({ CinzelDecorative_700Bold });

  useEffect(() => {
    if (!fontsLoaded) return;
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000, // 3 seconds to load
      useNativeDriver: true, // Use native driver for smoother animation
    }).start(() => {
      onComplete();
    });

    // Listen to progressAnim and update progress state
    const id = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      progressAnim.removeListener(id);
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const scaleX = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const glowOpacity = glowAnim;

  // Animated percentage for smooth text
  const progressText = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  });

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/fishicon.png')}
            style={styles.logo}
          />
          
          <Text style={styles.title}>FishCare</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    transform: [{ scaleX }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.progressGlow,
                  {
                    transform: [{ scaleX }],
                    opacity: glowOpacity,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  logo: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#ffffffff',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: {
    color: '#ffffffff',
    paddingTop: 20,
    letterSpacing: 3,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 48,
    fontFamily: Platform.select({
      ios: 'CinzelDecorative_700Bold',
      android: 'CinzelDecorative_700Bold',
      default: 'CinzelDecorative_700Bold',
    }),
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    width: '100%',
    paddingBottom: 50,
    alignItems: 'center',
  },
  progressBackground: {
    width: '80%',
    height: 30,
    backgroundColor: 'rgba(200,200,200,0.3)',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#53fcffff',
    borderRadius: 15,
    transformOrigin: 'left',
    zIndex: 2,
  },
  progressGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#3c6570ff',
    borderRadius: 15,
    shadowColor: '#3c6570ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    transformOrigin: 'left',
    zIndex: 1,
    opacity: 0.3,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 30,
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
