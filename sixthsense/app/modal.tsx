import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from './hooks/auth-context';
import { API_BASE_URL } from '../constants/api';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Prediction = {
  label: string;
  confidence: number;
};

export default function ClassificationResult() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [predictions, setPredictions] = React.useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [healthData, setHealthData] = React.useState<any>(null);
  const [healthError, setHealthError] = React.useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = React.useState(false);
  // States removed as they're not needed for now
  const { userId } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (imageUri) {
      uploadAndClassify();
      checkFishHealth();
    }
  }, [imageUri]);

  const checkFishHealth = async () => {
    if (!imageUri) return;

    try {
      console.log('Starting health check for image:', imageUri);
      setIsCheckingHealth(true);
      setHealthError(null);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await fetch(
        'https://df9e7439-9ca8-4523-914d-2663b07388f0-00-v94joh1z9k9f.picard.replit.dev:8000/health',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Health API Error:', errorText);
        throw new Error(`Health check failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Health data:', data);
      setHealthData(data);
    } catch (err) {
      console.error('Health check error:', err);
      setHealthError(err instanceof Error ? err.message : 'Failed to check fish health');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const uploadAndClassify = async () => {
    if (!imageUri) {
      setError('No image provided');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await fetch(
        'https://59bbc38e-8487-48ec-9f92-189abd6ad69f-00-2ls10hbd79cp2.kirk.replit.dev/upload-image/',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to classify image');
      }

      const data = await response.json();
      const results = data.predictions
        .map((label: string, index: number) => ({
          label,
          confidence: data.confidence_scores[index],
        }))
        .sort((a: Prediction, b: Prediction) => b.confidence - a.confidence) // Sort by confidence in descending order
        .slice(0, 2); // Take only top 2 predictions

      setPredictions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify image');
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder function for future store functionality
  const storeScan = () => {
    console.log('Store functionality temporarily disabled');
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Results</Text>
      </BlurView>

      <ScrollView style={styles.content}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        <BlurView intensity={20} tint="light" style={styles.resultsContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Analyzing image...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <Text style={styles.subtitle}>Detected Fish Categories:</Text>
              {predictions?.map((prediction: Prediction, index: number) => (
                <View key={index} style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>{prediction.label}</Text>
                  <Text style={styles.predictionConfidence}>
                    {(prediction.confidence * 100).toFixed(2)}% confidence
                  </Text>
                </View>
              ))}

              {/* Fish Health Section */}
              <Text style={[styles.subtitle, { marginTop: 20 }]}>Fish Health:</Text>
              {isCheckingHealth ? (
                <View style={styles.predictionItem}>
                  <Text style={styles.healthText}>Analyzing fish health...</Text>
                </View>
              ) : healthError ? (
                <View style={styles.predictionItem}>
                  <Text style={styles.errorText}>{healthError}</Text>
                </View>
              ) : healthData ? (
                <View style={styles.predictionItem}>
                  <Text style={styles.healthLabel}>
                    {typeof healthData === 'object' 
                      ? JSON.stringify(healthData, null, 2)
                      : healthData}
                  </Text>
                </View>
              ) : (
                <View style={styles.predictionItem}>
                  <Text style={styles.healthText}>No health data available</Text>
                </View>
              )}

              {/* Store Button */}
              <TouchableOpacity
                style={styles.storeButton}
                onPress={storeScan}
              >
                <Text style={styles.buttonText}>
                  Store Scan
                </Text>
              </TouchableOpacity>
            </>
          )}
        </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  healthText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  healthLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  storeButton: {
    backgroundColor: '#00c8ffff',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storedButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#186280ff',
  },
  header: {
    marginTop: 40,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: width - 40,
    height: width - 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3c6570',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resultsContainer: {
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  predictionItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  predictionLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  predictionConfidence: {
    fontSize: 16,
    color: '#00ff9d',
    marginTop: 4,
  },
});
