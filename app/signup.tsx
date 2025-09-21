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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const success = await signup(email, password, name);
    
    if (success) {
      router.replace('/dashboard');
    } else {
      Alert.alert('Error', 'Failed to create account');
    }
    setIsLoading(false);
  };

  const navigateToLogin = () => {
    router.push('/login');
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
                � Elevate your speaking skills today �
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
                    <Text style={styles.inputIcon}>👤</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Your awesome name"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#F9FAFB', borderColor: colors.border }]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>📧</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Your email address"
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
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Create a password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: '#F9FAFB', borderColor: colors.border }]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>✅</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View
                    style={[styles.signupButton, { backgroundColor: colors.gradientStart }]}
                  >
                    <Text style={styles.signupButtonText}>
                      {isLoading ? '⚡ Creating Account...' : '💼 Get Started'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={navigateToLogin}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                    Already part of the team? 
                  </Text>
                  <Text style={[styles.loginLinkText, { color: colors.tint }]}>
                    Sign In! 👋
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
  // Floating decorative elements
  floatingElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  star1: {
    width: 24,
    height: 24,
    top: height * 0.12,
    right: width * 0.15,
    transform: [{ rotate: '45deg' }],
  },
  star2: {
    width: 18,
    height: 18,
    top: height * 0.3,
    left: width * 0.1,
    transform: [{ rotate: '20deg' }],
  },
  star3: {
    width: 20,
    height: 20,
    bottom: height * 0.25,
    right: width * 0.25,
    transform: [{ rotate: '70deg' }],
  },
  // Header styles
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  // Form styles
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 24,
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    color: 'white',
    paddingVertical: 16,
    fontWeight: '500',
  },
  signupButton: {
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
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  loginLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    marginBottom: 6,
  },
});
