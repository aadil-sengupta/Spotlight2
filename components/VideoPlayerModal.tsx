import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RecordingMetadata, formatDuration } from '@/utils/recordingUtils';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface VideoPlayerModalProps {
  visible: boolean;
  recording: RecordingMetadata | null;
  onClose: () => void;
}

export default function VideoPlayerModal({ visible, recording, onClose }: VideoPlayerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // Reset hasEnded state when modal visibility or recording changes
  useEffect(() => {
    if (visible && recording) {
      setHasEnded(false);
    }
  }, [visible, recording?.id]);

  if (!recording) return null;

  const handleGoHome = () => {
    onClose(); // Close the modal first
    router.push('/'); // Navigate to home page
  };

  const handleSelfAnalysis = () => {
    try {
      router.push({
        pathname: '/guided-analysis',
        params: { recordingId: recording.id }
      });
      onClose(); // Close the modal when navigating
    } catch (navError) {
      console.error('Navigation error:', navError);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      
      // Check if the recording has ended
      if (status.didJustFinish && !hasEnded) {
        setHasEnded(true);
        Alert.alert(
          '🎉 Recording Complete!',
          'Great job on completing your practice session! Would you like to go back to the home page or analyze this recording?',
          [
            {
              text: 'Go to Home',
              onPress: handleGoHome,
              style: 'default'
            },
            {
              text: 'Analyze Recording',
              onPress: handleSelfAnalysis,
              style: 'default'
            }
          ],
          { 
            cancelable: false // Prevent dismissing without choosing an option
          }
        );
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      setHasEnded(false); // Reset the ended state when restarting
      videoRef.current.replayAsync();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
              <IconSymbol name="xmark" size={20} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Session</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: recording.localUri }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {/* Video Controls Overlay */}
          <View style={styles.videoControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <BlurView intensity={80} tint="dark" style={styles.playButtonBlur}>
                <IconSymbol
                  name={isPlaying ? "pause.fill" : "play.fill"}
                  size={32}
                  color="white"
                />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restartButton}
              onPress={handleRestart}
            >
              <BlurView intensity={80} tint="dark" style={styles.controlButtonBlur}>
                <IconSymbol name="arrow.clockwise" size={20} color="white" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          {status?.isLoaded && (
            <View style={styles.progressContainer}>
              <BlurView intensity={80} tint="dark" style={styles.progressBlur}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(status.positionMillis / (status.durationMillis || 1)) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timeText}>
                  {Math.round((status.positionMillis || 0) / 1000)}s / {Math.round((status.durationMillis || 0) / 1000)}s
                </Text>
              </BlurView>
            </View>
          )}
        </View>

        {/* Video Information */}
        <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
          <BlurView intensity={80} tint="light" style={styles.infoBlur}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Session Details</Text>
              
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {formatDate(recording.createdAt)}
                </Text>
                <Text style={styles.infoSubValue}>
                  {formatTime(recording.createdAt)}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Recording Details</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {recording.duration ? formatDuration(recording.duration) : 'Unknown'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>File Size</Text>
                    <Text style={styles.detailValue}>
                      {recording.fileSize ? `${(recording.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>File Information</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {recording.fileName}
                </Text>
                <Text style={styles.infoSubValue} numberOfLines={3}>
                  {recording.localUri}
                </Text>
              </View>

              {/* AI Analysis Results */}
              {recording.aiAnalysis ? (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>🤖 AI Analysis Results</Text>
                  <View style={styles.analysisContainer}>
                    {/* Overall Score */}
                    {recording.aiAnalysis.analysis.overall_score && (
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Overall Score</Text>
                        <View style={styles.scoreBar}>
                          <View 
                            style={[
                              styles.scoreFill, 
                              { 
                                width: `${(recording.aiAnalysis.analysis.overall_score / 10) * 100}%`,
                                backgroundColor: recording.aiAnalysis.analysis.overall_score >= 7 ? '#4CAF50' : 
                                               recording.aiAnalysis.analysis.overall_score >= 5 ? '#FF9800' : '#F44336'
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.scoreValue}>{recording.aiAnalysis.analysis.overall_score}/10</Text>
                      </View>
                    )}
                    
                    {/* Summary */}
                    <Text style={styles.analysisSummary}>
                      {recording.aiAnalysis.analysis.summary}
                    </Text>
                    
                    {/* Key Strengths */}
                    {recording.aiAnalysis.analysis.strengths && recording.aiAnalysis.analysis.strengths.length > 0 && (
                      <View style={styles.strengthsContainer}>
                        <Text style={styles.strengthsTitle}>✅ Strengths</Text>
                        {recording.aiAnalysis.analysis.strengths.slice(0, 3).map((strength, index) => (
                          <Text key={index} style={styles.strengthItem}>• {strength}</Text>
                        ))}
                      </View>
                    )}
                    
                    {/* Key Opportunities */}
                    {recording.aiAnalysis.analysis.opportunities && recording.aiAnalysis.analysis.opportunities.length > 0 && (
                      <View style={styles.opportunitiesContainer}>
                        <Text style={styles.opportunitiesTitle}>🎯 Areas for Improvement</Text>
                        {recording.aiAnalysis.analysis.opportunities.slice(0, 3).map((opportunity, index) => (
                          <Text key={index} style={styles.opportunityItem}>• {opportunity}</Text>
                        ))}
                      </View>
                    )}
                    
                    {/* Filler Words */}
                    {recording.aiAnalysis.analysis.filler_words && recording.aiAnalysis.analysis.filler_words !== "No significant filler words detected" && (
                      <View style={styles.fillerWordsContainer}>
                        <Text style={styles.fillerWordsTitle}>🗣️ Filler Words</Text>
                        <Text style={styles.fillerWordsText}>{recording.aiAnalysis.analysis.filler_words}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>🤖 AI Analysis</Text>
                  <View style={styles.processingContainer}>
                    <Text style={styles.processingText}>
                      {recording.analysisStatus === 'pending' ? '⏳ Analysis in progress...' : 
                       recording.analysisStatus === 'failed' ? '❌ Analysis failed' : 
                       '🔄 Analysis not requested'}
                    </Text>
                    {recording.analysisStatus === 'pending' && (
                      <Text style={styles.processingSubText}>
                        This may take up to 60 seconds
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* User Observations */}
              {recording.observations && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Your Analysis Notes</Text>
                  <View style={styles.observationsContainer}>
                    <Text style={styles.observationsText}>
                      {recording.observations}
                    </Text>
                  </View>
                </View>
              )}

              {/* Analysis Button */}
              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={[styles.selfAnalysisButton, { backgroundColor: colors.tint }]}
                  onPress={handleSelfAnalysis}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="brain" size={20} color="white" />
                  <Text style={styles.selfAnalysisButtonText}>Start Analysis</Text>
                  <IconSymbol name="arrow.right" size={16} color="white" />
                </TouchableOpacity>
                <Text style={styles.selfAnalysisDescription}>
                  Review your recording with guided analysis tools and focus modes
                </Text>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  videoContainer: {
    position: 'relative',
    height: height * 0.4,
    backgroundColor: 'white',
  },
  video: {
    flex: 1,
  },
  videoControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  playButtonBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressBlur: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(241, 241, 241, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoContent: {
    padding: 20,
  },
  infoTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  infoValue: {
    color: 'black',
    fontSize: 16,
    lineHeight: 24,
  },
  infoSubValue: {
    color: 'black',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: 'black',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
  observationsContainer: {
    backgroundColor: 'rgba(239, 239, 239, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  observationsText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  actionSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(159, 159, 159, 0.1)',
  },
  selfAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  selfAnalysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selfAnalysisDescription: {
    color: 'black',
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Analysis Results Styles
  analysisContainer: {
    backgroundColor: 'rgba(239, 239, 239, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreLabel: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  analysisSummary: {
    color: 'black',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  strengthsContainer: {
    marginBottom: 12,
  },
  strengthsTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  strengthItem: {
    color: 'black',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
    opacity: 0.8,
  },
  opportunitiesContainer: {
    marginBottom: 12,
  },
  opportunitiesTitle: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  opportunityItem: {
    color: 'black',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
    opacity: 0.8,
  },
  fillerWordsContainer: {
    marginBottom: 8,
  },
  fillerWordsTitle: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  fillerWordsText: {
    color: 'black',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  processingContainer: {
    backgroundColor: 'rgba(239, 239, 239, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  processingText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  processingSubText: {
    color: 'black',
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});
