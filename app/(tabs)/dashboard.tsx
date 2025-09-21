import { IconSymbol } from '@/components/ui/IconSymbol';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RecordingMetadata, formatDuration, getRecordingMetadata } from '@/utils/recordingUtils';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [recordings, setRecordings] = useState<RecordingMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<RecordingMetadata | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Removed profile modal in favor of dedicated profile tab screen

  // Load recordings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadRecordings = async () => {
        setLoading(true);
        try {
          const recordingData = await getRecordingMetadata();
          // Sort by creation date, most recent first
          const sortedRecordings = recordingData.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecordings(sortedRecordings);
        } catch (error) {
          console.error('Error loading recordings:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadRecordings();
    }, [])
  );

  // Calculate statistics
  const totalRecordings = recordings.length;
  const totalDuration = recordings.reduce((sum, recording) => sum + (recording.duration || 0), 0);
  const averageDuration = totalRecordings > 0 ? totalDuration / totalRecordings : 0;
  const recentRecordings = recordings.slice(0, 5); // Show last 5 recordings

  const handleRecordingPress = (recording: RecordingMetadata) => {
    setSelectedRecording(recording);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRecording(null);
  };

  // Removed logout and clear auth handlers; these now live in profile screen

  // Render individual recording item
  const renderRecordingItem = ({ item, index }: { item: RecordingMetadata; index: number }) => (
    <TouchableOpacity
      style={[styles.recordingItem, { 
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        shadowColor: '#000000',
      }]}
      onPress={() => handleRecordingPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.recordingContent}>
        <View style={styles.thumbnailContainer}>
          {item.thumbnailUri ? (
            <Image
              source={{ uri: item.thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnailPlaceholder, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="video.fill" size={28} color={colors.tint} />
            </View>
          )}
          {/* Enhanced Play button overlay */}
          <View style={styles.playButtonOverlay}>
            <View style={[styles.playButton, { backgroundColor: colors.tint + 'CC' }]}>
              <IconSymbol name="play.fill" size={18} color="white" />
            </View>
          </View>
          
          {/* {item.duration && (
            <View style={[styles.durationBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
            </View>
          )} */}
          {/* Session number badge */}
          <View style={[styles.sessionBadge, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.sessionNumber, { color: colors.tint }]}>#{index + 1}</Text>
          </View>
        </View>

        {/* Enhanced Content */}
        <View style={styles.recordingDetails}>
          <View style={styles.recordingMain}>
            <Text style={[styles.sessionTitle, { color: '#1F2937' }]}>
              Practice Session #{index + 1}
            </Text>
            <View style={styles.dateTimeRow}>
              <Text style={[styles.recordingDate, { color: '#374151' }]}>
                {item.recordedDate}
              </Text>
              <Text style={[styles.recordingTime, { color: '#6B7280' }]}>
                {new Date(item.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
            </View>
          </View>
          
          <View style={styles.recordingFooter}>
            <View style={styles.recordingMeta}>
              {item.duration && (
                <View style={styles.metaItem}>
                  <IconSymbol name="clock" size={12} color="#9CA3AF" />
                  <Text style={[styles.metaText, { color: '#9CA3AF' }]}>
                    {formatDuration(item.duration)}
                  </Text>
                </View>
              )}
              {item.fileSize && (
                <View style={styles.metaItem}>
                  <IconSymbol name="doc" size={12} color="#9CA3AF" />
                  <Text style={[styles.metaText, { color: '#9CA3AF' }]}>
                    {(item.fileSize / 1024 / 1024).toFixed(1)} MB
                  </Text>
                </View>
              )}
            </View>
            
            {/* Analysis Status Indicator */}
            <View style={styles.analysisStatusContainer}>
              {item.aiAnalysis ? (
                <TouchableOpacity
                  style={[styles.analysisStatusBadge, { backgroundColor: '#4CAF50' }]}
                  onPress={() => router.push(`/ai-analysis?recordingId=${item.id}`)}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="checkmark.circle.fill" size={12} color="white" />
                  <Text style={styles.analysisStatusText}>View Analysis</Text>
                </TouchableOpacity>
              ) : item.analysisStatus === 'pending' ? (
                <View style={[styles.analysisStatusBadge, { backgroundColor: '#FF9800' }]}>
                  <IconSymbol name="clock.fill" size={12} color="white" />
                  <Text style={styles.analysisStatusText}>Processing</Text>
                </View>
              ) : item.analysisStatus === 'failed' ? (
                <View style={[styles.analysisStatusBadge, { backgroundColor: '#F44336' }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={12} color="white" />
                  <Text style={styles.analysisStatusText}>Failed</Text>
                </View>
              ) : (
                <View style={[styles.analysisStatusBadge, { backgroundColor: '#9CA3AF' }]}>
                  <IconSymbol name="brain" size={12} color="white" />
                  <Text style={styles.analysisStatusText}>Not Analyzed</Text>
                </View>
              )}
            </View>
            
            <IconSymbol name="chevron.right" size={16} color="#D1D5DB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: '#374151' }]}>Loading your recordings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Clean Header */}
        <View style={styles.headerSection}>
                      <View style={styles.spotlightHeader}>
              <Image 
                source={require('@/assets/SpotLightText.png')} 
                style={styles.spotlightTextLogo}
                resizeMode="contain"
              />
            </View>

          <Animatable.View 
            animation="fadeInDown" 
            duration={800}
            style={styles.headerContent}
          >
            {/* SpotLight Logo and Text */}
            
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeText, { color: '#2f2f2fff' }]}>
                Welcome back! 👋
              </Text>
              <Text style={[styles.userName, { color: '#000' }]}>
                {user?.name || 'Speaker'}
              </Text>
              <Text style={[styles.motivationText, { color: '#2f2f2fff' }]}>
                Ready to practice your speaking skills? 🎯
              </Text>
            </View>
            
            {/* Profile Button */}
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              <IconSymbol name="person.fill" size={20} color="white" />
            </TouchableOpacity>
            
            {/* <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                const loadRecordings = async () => {
                  setLoading(true);
                  try {
                    const recordingData = await getRecordingMetadata();
                    const sortedRecordings = recordingData.sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setRecordings(sortedRecordings);
                  } finally {
                    setLoading(false);
                  }
                };
                loadRecordings();
              }}
            >
              <IconSymbol name="arrow.clockwise" size={20} color="white" />
            </TouchableOpacity> */}
          </Animatable.View>
        </View>
        
        {/* Clean Statistics Section */}
        <Animatable.View 
          animation="fadeInLeft" 
          duration={800}
          delay={200}
        >
          <View style={[styles.statsContainer, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6' }]}>
            <Text style={[styles.statsTitle, { color: '#111827' }]}>🏆 Your Practice Stats           </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={['#000', '#000']}
                  style={styles.statNumberContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.statNumber}>{totalRecordings}</Text>
                </LinearGradient>
                <Text style={[styles.statLabel, { color: '#374151' }]}>Total Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={['#000', '#000']}
                  style={styles.statNumberContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.statNumber}>
                    {formatDuration(totalDuration)}
                  </Text>
                </LinearGradient>
                <Text style={[styles.statLabel, { color: '#374151' }]}>Total Duration</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={['#000', '#000']}
                  style={styles.statNumberContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.statNumber}>
                    {formatDuration(Math.round(averageDuration))}
                  </Text>
                </LinearGradient>
                <Text style={[styles.statLabel, { color: '#374151' }]}>Avg Duration</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Recent Recordings Section */}
        {totalRecordings > 0 ? (
          <View style={styles.recordingsSection}>
            <Text style={[styles.sectionTitle, { color: '#111827' }]}>
              Recent Practice Sessions ({totalRecordings} total)
            </Text>
            <FlatList
              data={recentRecordings}
              renderItem={({ item, index }) => renderRecordingItem({ item, index })}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.recordingsList}
              scrollEnabled={false}
            />
            {totalRecordings > 5 && (
              <TouchableOpacity style={[styles.viewMoreButton, { 
                backgroundColor: colors.background, 
                borderColor: colors.tint + '30',
                shadowColor: colors.text + '20',
              }]}>
                <Text style={[styles.viewMoreText, { color: colors.tint }]}>
                  View all {totalRecordings} recordings
                </Text>
                <IconSymbol name="chevron.right" size={18} color={colors.tint} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            style={styles.emptyState}
          >
            <LinearGradient
              colors={[colors.accentGradientStart, colors.accentGradientEnd]}
              style={styles.emptyIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.emptyStateEmoji}>🎤</Text>
            </LinearGradient>
            <Text style={[styles.emptyStateTitle, { color: '#111827' }]}>
              Ready to start practicing? 🌟
            </Text>
            <Text style={[styles.emptyStateText, { color: '#6B7280' }]}>
              Your practice sessions will appear here after you complete your first recording. Let's begin your speaking journey!
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.push('/camera-practice')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.startPracticeButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startPracticeEmoji}>🎯</Text>
                <Text style={styles.startPracticeText}>Start Your First Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <VideoPlayerModal
        visible={modalVisible}
        recording={selectedRecording}
        onClose={handleCloseModal}
      />

      {/* Profile modal removed */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumberContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  recordingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  recordingsList: {
    flexGrow: 0,
  },
  recordingItem: {
    borderRadius: 20,
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  recordingContent: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 130,
    height: 100,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  sessionBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sessionNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  recordingDetails: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  recordingMain: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingDate: {
    fontSize: 15,
    fontWeight: '500',
  },
  recordingTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  recordingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 90,
    marginTop: 0,
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyStateEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  startPracticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startPracticeEmoji: {
    fontSize: 20,
  },
  startPracticeText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aiInsightsBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  bannerContent: {
    gap: 8,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bannerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  // New colorful header styles
  headerGradient: {
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
    marginBottom: -40,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  // SpotLight Header Styles
  spotlightHeader: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -28,
  },
  spotlightTextLogo: {
    width: 140,
    height: 35,
    marginTop: -20,
    marginBottom: 25,
  },
  // Analysis Status Styles
  analysisStatusContainer: {
    marginLeft: 8,
  },
  analysisStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  analysisStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  // Profile Button Styles
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Profile Modal Styles
  // (Removed profile modal related styles)
});
