import LoginScreen from '@/app/login';
import SignupScreen from '@/app/signup';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentAuthScreen, setCurrentAuthScreen] = useState<'login' | 'signup'>('login');

  // Reset to login screen when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentAuthScreen('login');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  // Instead of conditional screens, render the appropriate component directly
  if (!isAuthenticated) {
    if (currentAuthScreen === 'signup') {
      return <SignupScreen />;
    }
    return <LoginScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
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
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
