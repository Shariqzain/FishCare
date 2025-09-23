import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userToken: string | null;
  userId: string | null;
  setUserToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  loading: boolean;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('userId');
      setUserToken(token);
      setUserId(id);
      setLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (token: string, id: string) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userId', id);
    setUserToken(token);
    setUserId(id);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    setUserToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, setUserToken, setUserId, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
