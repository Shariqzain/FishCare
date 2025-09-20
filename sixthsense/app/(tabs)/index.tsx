import { StyleSheet, TouchableOpacity, View, Dimensions, Image, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      // Request media library permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();

    // Update time
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
      };
      setCurrentTime(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const scanPhoto = async () => {
    if (hasCameraPermission) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // Handle the captured image
        console.log(result.assets[0].uri);
        // Add scanning logic here
      }
    } else {
      alert('Camera permission is required to scan');
    }
  };

  const uploadData = async () => {
    if (hasGalleryPermission) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // Handle the selected image
        console.log(result.assets[0].uri);
        // Add upload logic here
      }
    } else {
      alert('Gallery permission is required to upload');
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, Fisherman 👋</Text>
        <Text style={styles.timeText}>{currentTime}</Text>
      </BlurView>
      
      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Image 
            source={require('../../assets/images/fishhome.jpeg')}
            style={styles.circleImage}
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={scanPhoto}>
          <Feather name="camera" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={uploadData}>
          <BlurView intensity={20} tint="light" style={styles.actionButtonContent}>
            <Feather name="upload" size={24} color="white" />
            <Text style={styles.actionButtonText}>Upload Data</Text>
          </BlurView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <BlurView intensity={20} tint="light" style={styles.actionButtonContent}>
            <Feather name="clock" size={24} color="white" />
            <Text style={styles.actionButtonText}>View History</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#186280ff',
    padding: 20,
  },
  header: {
    marginTop: 40,
    borderRadius: 15,
    overflow: 'hidden',
    padding: 15,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 5,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#3c6570',
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  scanButton: {
    backgroundColor: '#3c6570',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: -30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  actionButton: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '48%',
  },
  actionButtonContent: {
    alignItems: 'center',
    gap: 8,
    padding: 15,
    width: '100%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
