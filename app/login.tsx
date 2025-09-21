import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    
    if (success) {
      router.replace('/dashboard');
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
    setIsLoading(false);
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          {/* Removed floating decorative elements for clean design */}

          <View style={styles.content}>
            {/* Header with animation */}
            <Animatable.View 
              animation="fadeInDown" 
              duration={1000}
              style={styles.header}
            >
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/SpotLightLogo.png')} 
                  style={styles.spotlightLogo}
                  resizeMode="contain"
                />
              </View>
              <Image 
                source={require('@/assets/SpotLightText.png')} 
                style={styles.spotlightText}
                resizeMode="contain"
              />
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                ⚡ Transform your speaking skills ⚡
              </Text>
            </Animatable.View>

            {/* Form with animation */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={1000}
              delay={300}
              style={[styles.formContainer, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}
            >
              <View style={styles.form}>
                <View style={[styles.inputContainer, { backgroundColor: '#F9FAFB', borderColor: colors.border }]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>📧</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#F9FAFB', borderColor: colors.border }]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>🔒</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View
                    style={[styles.loginButton, { backgroundColor: colors.gradientStart }]}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? '⚡ Signing In...' : '🎯 Sign In'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signupLink}
                  onPress={navigateToSignup}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                    New to SpotLight? 
                  </Text>
                  <Text style={[styles.signupLinkText, { color: colors.tint }]}>
                    Get Started 💼
                  </Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  // Floating decorative circles
  floatingCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 80,
    height: 80,
    top: height * 0.15,
    right: width * 0.1,
  },
  circle2: {
    width: 60,
    height: 60,
    top: height * 0.25,
    left: width * 0.05,
  },
  circle3: {
    width: 40,
    height: 40,
    bottom: height * 0.2,
    right: width * 0.2,
  },
  // Header styles
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Form styles
  formContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  inputIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 16,
    marginBottom: 4,
  },
  signupLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // SpotLight Logo Styles
  spotlightLogo: {
    width: 60,
    height: 60,
  },
  spotlightText: {
    width: 180,
    height: 45,
    marginTop: 4,
  },
});
