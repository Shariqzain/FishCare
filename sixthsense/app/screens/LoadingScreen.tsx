import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useVideoPreload } from '../hooks/useVideoPreload';
const { width, height } = Dimensions.get('window');

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const videoSource = require('../../assets/images/jellyfish.mp4');
  const isVideoReady = useVideoPreload(videoSource);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000, // 3 seconds to load
      useNativeDriver: false,
    }).start(() => {
      onComplete();
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

    // Update progress percentage
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, []);

  const scaleX = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
  });

  const glowOpacity = glowAnim;

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/images/jellyfish.mp4')}
        style={[styles.videoBackground]}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>FishCare</Text>
          <Image
            source={require('../../assets/images/fishlogo.jpg')}
            style={styles.logo}
          />
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
            <Text style={styles.progressText}>{`${progress}%`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
    flexDirection: 'row',
  },
  logo: {
    width: 120,
    height: 120,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#002fffff',
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
    color: '#FFFFFF',
    fontSize: 48,
    fontFamily: Platform.select({
      ios: 'Acropolis',
      android: 'Acropolis',
    }),
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    shadowColor: '#4CAF50',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
