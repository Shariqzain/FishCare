import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from './hooks/auth-context';
import SplashScreen from './screens/SplashScreen';
import LoadingScreen from './screens/LoadingScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import SigninSignupScreen from './screens/signin-signup';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
  <RootLayoutInner colorScheme={colorScheme ?? 'light'} />
    </AuthProvider>
  );
}

function RootLayoutInner({ colorScheme }: { colorScheme: string }) {
  const { userToken, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (!userToken) {
    return <SigninSignupScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
