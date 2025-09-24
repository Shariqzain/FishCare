import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Alert, Button } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/auth-context';
import { API_BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

type Prediction = {
  label: string;
  confidence: number;
};

export default function ClassificationResult() {
  const { imageUri } = useLocalSearchParams();
  const { userId } = useAuth();
  const [predictions, setPredictions] = React.useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isStoring, setIsStoring] = React.useState(false);
  const [isStored, setIsStored] = React.useState(false);
  const [healthResult, setHealthResult] = React.useState<{ status: string; details?: string } | null>(null);
  const [healthError, setHealthError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageUri) {
      uploadAndClassify();
      checkFishHealth();
    }
  }, [imageUri]);

  const checkFishHealth = async () => {
    try {
      setHealthError(null);
      const formData = new FormData();
      formData.append('file', {
        uri: Array.isArray(imageUri) ? imageUri[0] : imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await fetch(
        'https://df9e7439-9ca8-4523-914d-2663b07388f0-00-v94joh1z9k9f.picard.replit.dev:8000/health',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealthResult({
        status: data.health_status || data.status || 'Analysis Complete',
        details: data.details || JSON.stringify(data, null, 2)
      });
    } catch (err) {
      console.error('Health check error:', err);
      setHealthError(err instanceof Error ? err.message : 'Failed to check fish health');
    }
  };

  // Debug useEffect
  React.useEffect(() => {
    console.log('Debug - userId:', userId);
    console.log('Debug - predictions:', predictions);
    console.log('Debug - predictions length:', predictions.length);
  }, [userId, predictions]);

  const uploadAndClassify = async () => {
    if (!imageUri) {
      setError('No image provided');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Array.isArray(imageUri) ? imageUri[0] : imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      console.log('Making API request to classify image...');
      
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
        throw new Error(`Failed to classify image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle different possible response formats
      let results: Prediction[] = [];
      
      if (data.predictions && Array.isArray(data.predictions)) {
        if (data.confidence_scores && Array.isArray(data.confidence_scores)) {
          // Format: {predictions: ["fish1", "fish2"], confidence_scores: [0.9, 0.8]}
          results = data.predictions.map((label: string, index: number) => ({
            label,
            confidence: data.confidence_scores[index] || 0,
          }));
        } else {
          // Format: {predictions: [{"label": "fish1", "confidence": 0.9}]}
          results = data.predictions.map((item: any) => ({
            label: item.label || item.toString(),
            confidence: item.confidence || 0.5,
          }));
        }
      } else if (data.result) {
        // Format: {result: "fish_name"} or {result: {"label": "fish1", "confidence": 0.9}}
        if (typeof data.result === 'string') {
          results = [{ label: data.result, confidence: 1.0 }];
        } else {
          results = [{ 
            label: data.result.label || data.result.toString(), 
            confidence: data.result.confidence || 1.0 
          }];
        }
      } else {
        // Fallback: try to extract any meaningful data
        console.warn('Unexpected API response format:', data);
        results = [{ label: 'Unknown Fish', confidence: 0.5 }];
      }

      console.log('Processed results:', results);
      setPredictions(results);
      
      // Automatically store the scan after successful classification
      if (userId && results.length > 0) {
        try {
          setIsStoring(true);
          console.log('Auto-storing scan for user:', userId);
          
          const response = await fetch(`${API_BASE_URL}/api/scans/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              imageUrl: Array.isArray(imageUri) ? imageUri[0] : imageUri,
              result: results[0], // Store the best prediction
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to store scan: ${response.status} - ${errorData}`);
          }

          setIsStored(true);
          console.log('Scan automatically stored successfully');
        } catch (storeErr) {
          console.error('Auto-store scan error:', storeErr);
          // Don't show alert for auto-store failure
        } finally {
          setIsStoring(false);
        }
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to classify image');
    } finally {
      setIsLoading(false);
    }
  };

  const storeScan = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      return;
    }
    
    if (predictions.length === 0) {
      Alert.alert('Error', 'No classification results to store');
      return;
    }

    try {
      setIsStoring(true);
      console.log('Storing scan for user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/api/scans/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          imageUrl: Array.isArray(imageUri) ? imageUri[0] : imageUri,
          result: predictions[0], // Store the best prediction
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to store scan: ${response.status} - ${errorData}`);
      }

      setIsStored(true);
      Alert.alert('Success', 'Scan stored successfully!');
    } catch (err) {
      console.error('Store scan error:', err);
      Alert.alert('Error', 'Failed to store scan. Please try again.');
    } finally {
      setIsStoring(false);
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
            <Image
              source={{ uri: Array.isArray(imageUri) ? imageUri[0] : imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <BlurView intensity={20} tint="light" style={styles.resultsContainer}>
          <View>
            {isLoading ? (
              <Text style={styles.loadingText}>Analyzing image...</Text>
            ) : error ? (
              <View>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={uploadAndClassify}
                >
                  <Text style={styles.storeButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>Detected Fish Categoriessss:</Text>
                {predictions.length > 0 ? (
                  predictions.map((prediction, index) => (
                    <View key={index} style={styles.predictionItem}>
                      <Text style={styles.predictionLabel}>{prediction.label}</Text>
                      <Text style={styles.predictionConfidence}>
                        {(prediction.confidence * 100).toFixed(2)}% confidence
                      </Text>
                    </View>
                  ))
                ) : (
                  <><Text style={styles.debugText}>Predictions: {predictions.length}</Text><Text style={styles.errorText}>No fish detected in the image</Text></>
                )}

                {/* Fish Health Section */}
                <Text style={[styles.subtitle, { marginTop: 20 }]}>Fish Health:</Text>
                <View style={styles.healthContainer}>
                  {isLoading ? (
                    <Text style={styles.loadingText}>Analyzing fish health...</Text>
                  ) : healthError ? (
                    <Text style={styles.errorText}>{healthError}</Text>
                  ) : healthResult ? (
                    <View style={styles.predictionItem}>
                      <Text style={styles.healthLabel}>{healthResult.status}</Text>
                      {healthResult.details && (
                        <Text style={styles.healthDetails}>{healthResult.details}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.loadingText}>Checking fish health...</Text>
                  )}
                </View>

                {/* Debug info - remove in production */}
                <View style={styles.debugContainer}>
                  <Text style={styles.debugText}>Debug Info:</Text>
                  <Text style={styles.debugText}>User ID: {userId || 'Not found'}</Text>
                </View>

                {/* Store button - always visible */}
                <TouchableOpacity
                  style={[
                    styles.storeButton,
                    isStored && styles.storedButton,
                    isStoring && styles.disabledButton,
                  ]}
                  onPress={storeScan}
                  disabled={isStoring}
                >
                  <Text style={styles.storeButtonText}>
                    {isStoring ? 'Storing...' : isStored ? 'Stored!' : 'Store Scan'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  healthContainer: {
    marginTop: 10,
  },
  healthLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  healthDetails: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 4,
  },
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
    marginBottom: 10,
  },
  warningText: {
    color: '#ffa500',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
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
  debugContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
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
  retryButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  storeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

