import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  // Single fade animation for both words
  const fadeIn = new Animated.Value(0);
  const fadeOutAll = new Animated.Value(1);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Fade in both words simultaneously
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      // Hold both words visible
      Animated.delay(1500),
      // Fade out everything
      Animated.timing(fadeOutAll, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.textContainer,
          { opacity: fadeOutAll }
        ]}
      >
        <Animated.Text 
          style={[
            styles.text,
            { opacity: fadeIn }
          ]}
        >
          SIXTH
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.text,
            { opacity: fadeIn }
          ]}
        >
          SENSE
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Container glow effect
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 10, // Android elevation for glow
    padding: 20, // Add padding to make glow visible
  },
  text: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 3, // Wider spacing like the geometric style
    marginVertical: -12,
    // Multiple layered shadows for stronger glow effect
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontFamily: Platform.select({
      ios: 'Orbitron-Bold',
      android: 'Orbitron-Bold',
      default: 'rockwell-extrabold',
    }),
  },
});