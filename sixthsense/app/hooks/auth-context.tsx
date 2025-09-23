import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userToken: string | null;
  userId: string | null;
  userName: string | null;
  setUserToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  setUserName: (name: string | null) => void;
  loading: boolean;
  signIn: (token: string, userId: string, userName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('userName');
      setUserToken(token);
      setUserId(id);
      setUserName(name);
      setLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (token: string, id: string, name: string) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userId', id);
    await AsyncStorage.setItem('userName', name);
    setUserToken(token);
    setUserId(id);
    setUserName(name);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userName');
    setUserToken(null);
    setUserId(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, userName, setUserToken, setUserId, setUserName, loading, signIn, signOut }}>
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
