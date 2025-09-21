import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { clearAllRecordingMetadata, getRecordingStatistics } from '@/utils/recordingUtils';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout, clearAuthData } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [appStats, setAppStats] = useState({
    totalRecordings: 0,
    totalSize: 0,
    totalDuration: 0,
  });
  const router = useRouter();

  // Load app statistics when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const stats = await getRecordingStatistics();
          setAppStats({
            totalRecordings: stats.totalRecordings,
            totalSize: stats.totalSize,
            totalDuration: stats.totalDuration,
          });
        } catch (error) {
          console.error('Error loading app statistics:', error);
        }
      };
      loadStats();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleClearAuthData = () => {
    Alert.alert(
      'Clear Auth Data',
      'This will clear all saved authentication data. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAuthData }
      ]
    );
  };

  const handleClearRecordings = () => {
    Alert.alert(
      'Clear All Recordings',
      'Are you sure you want to delete all recordings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Recordings', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await clearAllRecordingMetadata();
              setAppStats({ totalRecordings: 0, totalSize: 0, totalDuration: 0 });
              Alert.alert('Success', 'All recordings have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear recordings.');
            }
          }
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear App Cache',
      'This will clear temporary files and cached data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const cacheDir = FileSystem.cacheDirectory;
              if (cacheDir) {
                const files = await FileSystem.readDirectoryAsync(cacheDir);
                for (const file of files) {
                  await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
                }
              }
              Alert.alert('Success', 'App cache has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear app cache.');
            }
          }
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const stats = await getRecordingStatistics();
      const exportData = {
        user: {
          name: user?.name,
          email: user?.email,
        },
        statistics: stats,
        exportDate: new Date().toISOString(),
      };
      
      const exportString = JSON.stringify(exportData, null, 2);
      console.log('Export Data:', exportString);
      
      Alert.alert(
        'Data Export',
        `Your data has been exported to the console. Check the development logs to view the complete export.\n\nTotal recordings: ${stats.totalRecordings}\nTotal size: ${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const showAppInfo = () => {
    Alert.alert(
      'About SpotLight',
      'SpotLight helps you practice your speaking skills through video recording and analysis.\n\nVersion: 1.0.0\nBuild: Development',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* SpotLight Header */}
          <View style={styles.spotlightHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.inlineBackButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <IconSymbol name="chevron.left" size={22} color="#111827" />
            </TouchableOpacity>
            <Image
              source={require('@/assets/SpotLightText.png')}
              style={styles.spotlightTextLogo}
              resizeMode="contain"
            />
            <View style={{ width: 40 }} />
          </View>
          
          {/* Clean Header Section */}
          <View style={styles.headerSection}>
            <Animatable.View 
              animation="bounceIn" 
              duration={1000}
              style={styles.avatarContainer}
            >
              <LinearGradient
                colors={[colors.accentGradientStart, colors.accentGradientEnd]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Image 
                  source={require('@/assets/profile.jpg')} 
                  style={styles.profilePhoto}
                  resizeMode="cover"
                />
              </LinearGradient>
            </Animatable.View>
            <Animatable.Text 
              animation="fadeInUp" 
              duration={800}
              delay={300}
              style={[styles.title, { color: '#000' }]}
            >
              {user?.name || 'User'} 💼
            </Animatable.Text>
            <Animatable.Text 
              animation="fadeInUp" 
              duration={800}
              delay={500}
              style={[styles.email, { color: colors.textSecondary }]}
            >
              {user?.email}
            </Animatable.Text>
          </View>

          {/* Clean App Statistics */}
          <Animatable.View 
            animation="fadeInLeft" 
            duration={800}
            delay={600}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: '#111827' }]}>
              🏆 Your Progress
            </Text>
            <View style={[styles.statsContainer, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={[colors.accentGradientStart, colors.accentGradientEnd]}
                  style={styles.statIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.statEmoji}>🎥</Text>
                </LinearGradient>
                <Text style={[styles.statNumber, { color: '#1F2937' }]}>
                  {appStats.totalRecordings}
                </Text>
                <Text style={[styles.statLabel, { color: '#6B7280' }]}>
                  Recordings
                </Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.statIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.statEmoji}>⏱️</Text>
                </LinearGradient>
                <Text style={[styles.statNumber, { color: '#1F2937' }]}>
                  {Math.round(appStats.totalDuration / 60)}
                </Text>
                <Text style={[styles.statLabel, { color: '#6B7280' }]}>
                  Minutes
                </Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={[colors.secondary, colors.tertiary]}
                  style={styles.statIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.statEmoji}>💾</Text>
                </LinearGradient>
                <Text style={[styles.statNumber, { color: '#1F2937' }]}>
                  {(appStats.totalSize / 1024 / 1024).toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: '#6B7280' }]}>
                  MB Used
                </Text>
              </View>
            </View>
          </Animatable.View>

          {/* Enhanced Profile Options */}
          <Animatable.View 
            animation="fadeInRight" 
            duration={800}
            delay={800}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: '#111827' }]}>
              👤 Account
            </Text>
            <View style={[styles.optionsContainer, { backgroundColor: '#FFFFFF' }]}>
              <TouchableOpacity 
                style={[styles.optionItem, { borderBottomColor: '#F3F4F6' }]}
                onPress={handleLogout}
              >
                <LinearGradient
                  colors={['#DC2626', '#EF4444']}
                  style={styles.optionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionEmoji}>🚪</Text>
                </LinearGradient>
                <Text style={[styles.optionText, { color: '#374151' }]}>Sign Out</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionItem, { borderBottomColor: '#F3F4F6' }]}
                onPress={handleClearAuthData}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.tertiary]}
                  style={styles.optionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionEmoji}>🗑️</Text>
                </LinearGradient>
                <Text style={[styles.optionText, { color: '#374151' }]}>Clear Auth Data</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Enhanced App Data Management */}
          <Animatable.View 
            animation="fadeInLeft" 
            duration={800}
            delay={1000}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: '#111827' }]}>
              📊 Data Management
            </Text>
            <View style={[styles.optionsContainer, { backgroundColor: '#FFFFFF' }]}>
              <TouchableOpacity 
                style={[styles.optionItem, { borderBottomColor: '#F3F4F6' }]}
                onPress={handleExportData}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.optionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionEmoji}>📤</Text>
                </LinearGradient>
                <Text style={[styles.optionText, { color: '#374151' }]}>Export Data</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionItem, { borderBottomColor: '#F3F4F6' }]}
                onPress={handleClearCache}
              >
                <LinearGradient
                  colors={[colors.accent, colors.tertiary]}
                  style={styles.optionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionEmoji}>🧹</Text>
                </LinearGradient>
                <Text style={[styles.optionText, { color: '#374151' }]}>Clear Cache</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionItem, { borderBottomWidth: 0 }]}
                onPress={handleClearRecordings}
              >
                <LinearGradient
                  colors={['#DC2626', '#EF4444']}
                  style={styles.optionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionEmoji}>❌</Text>
                </LinearGradient>
                <Text style={[styles.optionText, { color: '#374151' }]}>Clear All Recordings</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Enhanced App Information */}
          <Animatable.View 
            animation="fadeInRight" 
            duration={800}
            delay={1200}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: '#111827' }]}>
              ℹ️ About
            </Text>
            <View style={[styles.optionsContainer, { backgroundColor: '#FFFFFF' }]}>
              <TouchableOpacity 
                style={[styles.optionItem, { borderBottomWidth: 0 }]}
                onPress={showAppInfo}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.tertiary]}
                  style={styles.optionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionEmoji}>💬</Text>
                </LinearGradient>
                <Text style={[styles.optionText, { color: '#374151' }]}>App Information</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 0,
    marginBottom: 24,
    marginHorizontal: -20,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  // Removed avatarEmoji (replaced with profilePhoto)
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  // SpotLight Header Styles
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 4,
  },
  spotlightTextLogo: {
    width: 140,
    height: 35,
  },
  inlineBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
