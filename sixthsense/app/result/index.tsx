import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/auth-context';

const { width } = Dimensions.get('window');

type Prediction = {
  label: string;
  confidence: number;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#186280ff',
  },
  header: {
    marginTop: 40,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
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

const ResultScreen: React.FC = () => {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { userId } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    uploadAndClassify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

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
      const results = data.predictions.map((label: string, index: number) => ({
        label,
        confidence: data.confidence_scores[index],
      }));

      setPredictions(results);

      // Save scan to backend
      if (userId && results.length > 0) {
        await fetch('http://192.168.1.55:5000/api/scans/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            imageUrl: imageUri,
            result: results[0],
          }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Text style={styles.title}>Fish Classification Results</Text>
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
              {predictions.map((prediction, index) => (
                <View key={index} style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>{prediction.label}</Text>
                  <Text style={styles.predictionConfidence}>
                    {(prediction.confidence * 100).toFixed(2)}% confidence
                  </Text>
                </View>
              ))}
            </>
          )}
        </BlurView>
      </ScrollView>
    </View>
  );
};

export default ResultScreen;