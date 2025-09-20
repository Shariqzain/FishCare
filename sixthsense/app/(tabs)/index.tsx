import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
import { Video, ResizeMode } from 'expo-av';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { BlurView } from 'expo-blur';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useEffect, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      // Request media library permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (hasCameraPermission) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Handle the captured image
        console.log(result.assets[0].uri);
        // You can add navigation or image processing logic here
      }
    } else {
      alert('Camera permission is required to take photos');
    }
  };

  const pickImage = async () => {
    if (hasGalleryPermission) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Handle the selected image
        console.log(result.assets[0].uri);
        // You can add navigation or image processing logic here
      }
    } else {
      alert('Gallery permission is required to select photos');
    }
  };

  return (
    <View style={styles.container}>
            <Video
        ref={videoRef}
        source={require('../../assets/images/jellyfish.mp4')}
        style={styles.videoBackground}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        onLoad={(status) => {
          if (status && 'isLoaded' in status && status.isLoaded) {
            setIsVideoReady(true);
          }
        }}
        onError={(error) => {
          console.log('Video Error:', error);
          setIsVideoReady(true); // Fallback to show content even if video fails
        }}
      />
      <BlurView intensity={80} tint="dark" style={[StyleSheet.absoluteFill, !isVideoReady && styles.loading]}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <ThemedText type="subtitle" style={styles.buttonText}>
              Take Photo
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <ThemedText type="subtitle" style={styles.buttonText}>
              Upload Photo
            </ThemedText>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loading: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
