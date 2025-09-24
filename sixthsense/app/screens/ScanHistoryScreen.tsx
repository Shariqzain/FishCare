import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useAuth } from '../hooks/auth-context';
import { API_BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

type Scan = {
  imageUrl?: string;
  result?: {
    label: string;
    confidence: number;
    date?: string;
  };
  scannedAt?: string;
};

export default function ScanHistoryScreen() {
  const { userId } = useAuth();
  const [history, setHistory] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setError('User not found');
      setLoading(false);
      return;
    }
    const fetchHistory = async () => {
      try {
        console.log('Fetching scan history for userId:', userId);
        console.log('API URL:', `${API_BASE_URL}/api/scans/history/${userId}`);
        
        const res = await fetch(`${API_BASE_URL}/api/scans/history/${userId}`);
        console.log('Response status:', res.status);
        
        const data = await res.json();
        console.log('Response data:', data);
        
        if (res.ok) {
          setHistory(data);
          if (data.length === 0) {
            console.log('No scan history found');
          }
        } else {
          const errorMsg = data.message || 'Failed to fetch history';
          console.error('Error fetching history:', errorMsg);
          setError(errorMsg);
          Alert.alert('Error', errorMsg);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Network error';
        console.error('Error in fetchHistory:', errorMsg);
        setError(errorMsg);
        Alert.alert('Network Error', 'Could not connect to the server. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);



  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </BlurView>
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : history.length === 0 ? (
          <Text style={styles.infoText}>No scan history found.</Text>
        ) : (
          history.map((scan, idx) => (
            <View key={idx} style={styles.scanItem}>
              <Text style={styles.scanLabel}>Fish: {scan.result?.label || 'Unknown'}</Text>
              <Text style={styles.scanDate}>Date: {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString() : 'N/A'}</Text>
              <Text style={styles.scanConfidence}>Confidence: {scan.result?.confidence ? (scan.result.confidence * 100).toFixed(2) : 'N/A'}%</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

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
  infoText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  scanItem: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  scanLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  goBackButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: '#3c6570',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  goBackText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scanDate: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 4,
  },
  scanConfidence: {
    fontSize: 15,
    color: '#00ff9d',
    marginTop: 4,
  },
});
