import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/auth-context';
import { API_BASE_URL } from '../../constants/api';

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
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  storeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const ResultScreen: React.FC = () => {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { userId } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

      // Save scan to backend automatically
      if (userId && results.length > 0) {
        try {
          setIsSaving(true);
          console.log('Saving scan:', {
            userId,
            imageUrl: imageUri,
            result: results[0]
          });

          const saveScanResponse = await fetch(`${API_BASE_URL}/api/scans/add`, {
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

          const saveData = await saveScanResponse.json();
          console.log('Save response:', saveData);

          if (saveScanResponse.ok) {
            setIsSaved(true);
            Alert.alert('Success', 'Scan saved successfully!');
          } else {
            throw new Error(saveData.message || 'Failed to save scan');
          }
        } catch (saveErr) {
          console.error('Error saving scan:', saveErr);
          Alert.alert('Error', 'Failed to save scan to history. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify image');
    } finally {
      setIsLoading(false);
    }
  };

  const saveScan = async () => {
    if (!userId || predictions.length === 0) {
      Alert.alert('Error', 'Cannot save scan. Please try again.');
      return;
    }

    try {
      setIsSaving(true);
      const bestResult = predictions[0]; // Use the highest confidence prediction

      const saveScanResponse = await fetch(`${API_BASE_URL}/api/scans/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          imageUrl: imageUri,
          result: bestResult,
        }),
      });

      if (!saveScanResponse.ok) {
        throw new Error('Failed to save scan');
      }

      setIsSaved(true);
      Alert.alert('Success', 'Scan saved successfully!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save scan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Text style={styles.title}>Fish Classification</Text>
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
              <Text style={styles.subtitle}>tegories:</Text>
              {predictions.map((prediction, index) => (
                <View key={index} style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>{prediction.label}</Text>
                  <Text style={styles.predictionConfidence}>
                    {(prediction.confidence * 100).toFixed(2)}% confidence
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.storeButton, 
                  isSaved && styles.savedButton,
                  (isSaving || isLoading) && styles.disabledButton
                ]}
                onPress={saveScan}
                disabled={isSaving || isLoading || isSaved}
              >
                <Text style={styles.storeButtonText}>
                  {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Store Result'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </BlurView>
      </ScrollView>
    </View>
  );
};

export default ResultScreen;