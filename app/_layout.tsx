import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
            name="ai-analysis" 
            options={{ 
              presentation: 'fullScreenModal',
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen 
            name="camera-practice" 
            options={{ 
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="guided-analysis" 
            options={{ 
              presentation: 'fullScreenModal',
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="voice-coach" 
            options={{ 
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="exercise/[id]" 
            options={{ 
              presentation: 'fullScreenModal',
              animation: 'slide_from_right',
            }} 
          />

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
