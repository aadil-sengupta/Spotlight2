import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RecordingMetadata, getRecordingMetadata, updateRecordingObservations } from '@/utils/recordingUtils';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

type AnalysisStep = 'intro' | 'watch' | 'reflect' | 'focus' | 'notes' | 'complete';

interface StepData {
  id: AnalysisStep;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  instructions: string[];
  tips?: string[];
}

const ANALYSIS_STEPS: StepData[] = [
  {
    id: 'intro',
    title: 'AI Analysis in Progress',
    subtitle: 'Let\'s do a self-review while we wait',
    emoji: '🤖',
    description: 'Our AI is analyzing your speech in the background. While it processes, let\'s do a quick self-review to identify your own insights.',
    instructions: [
      'Watch your recording and take notes below',
      'Identify your strengths and areas for improvement',
      'The AI analysis will be ready shortly'
    ],
    tips: [
      'Focus on what you can observe yourself',
      'Be honest about your performance',
      'AI insights will complement your self-review'
    ]
  },
  {
    id: 'watch',
    title: 'Watch & Reflect',
    subtitle: 'Your turn to analyze',
    emoji: '👀',
    description: 'Watch your recording and reflect on your performance. Use the text box below to take notes as you watch.',
    instructions: [
      'Watch the entire recording',
      'Notice your voice, body language, and confidence',
      'Write your observations in the box below'
    ],
    tips: [
      'Watch objectively, like you\'re reviewing someone else',
      'Focus on specific behaviors, not general feelings',
      'Take notes as you watch'
    ]
  },
  {
    id: 'complete',
    title: 'Self-Review Complete!',
    subtitle: 'AI analysis should be ready',
    emoji: '🎉',
    description: 'Great job on your self-review! Check if the AI analysis is ready above, or continue to the dashboard to see all your insights.',
    instructions: [
      'Review your notes below',
      'Check the AI analysis status above',
      'Plan your next practice session'
    ],
    tips: [
      'Compare your insights with AI analysis',
      'Focus on consistent themes',
      'Set specific goals for improvement'
    ]
  }
];

export default function GuidedAnalysisScreen() {
  const { recordingId } = useLocalSearchParams<{ recordingId: string }>();
  const [recording, setRecording] = useState<RecordingMetadata | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('intro');
  const [loading, setLoading] = useState(true);
  const [userNotes, setUserNotes] = useState('');
  const [focusMode, setFocusMode] = useState<'both' | 'audio' | 'video'>('both');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'completed' | 'failed' | 'not_requested'>('pending');
  
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadRecording();
  }, [recordingId]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    // Animate progress bar when step changes
    const currentProgress = ((getStepIndex() + 1) / ANALYSIS_STEPS.length) * 100;
    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Start polling for analysis status if it's pending
  useEffect(() => {
    console.log('Analysis status changed to:', analysisStatus);
    
    if (analysisStatus === 'pending' && !refreshIntervalRef.current) {
      console.log('Starting polling for analysis status...');
      refreshIntervalRef.current = setInterval(refreshRecording, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        console.log('Clearing polling interval');
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [analysisStatus]);

  const loadRecording = async () => {
    try {
      const recordings = await getRecordingMetadata();
      const targetRecording = recordings.find(r => r.id === recordingId);
      
      if (targetRecording) {
        setRecording(targetRecording);
        const initialStatus = targetRecording.analysisStatus || 'not_requested';
        setAnalysisStatus(initialStatus);
        console.log('Initial analysis status loaded:', initialStatus);
        if (targetRecording.observations) {
          setUserNotes(targetRecording.observations);
        }
      } else {
        // Recording not found - will show error state in render
        console.log('Recording not found:', recordingId);
      }
    } catch (error) {
      console.error('Error loading recording:', error);
      // Error loading - will show error state in render
    } finally {
      setLoading(false);
    }
  };

  const refreshRecording = async () => {
    try {
      const recordings = await getRecordingMetadata();
      const targetRecording = recordings.find(r => r.id === recordingId);
      
      if (targetRecording) {
        const newStatus = targetRecording.analysisStatus || 'not_requested';
        console.log('Polling: Current status:', analysisStatus, 'New status:', newStatus);
        
        if (newStatus !== analysisStatus) {
          setAnalysisStatus(newStatus);
          console.log('Status updated to:', newStatus);
        }
        
        // Update recording if analysis is now complete
        if (targetRecording.aiAnalysis && !recording?.aiAnalysis) {
          setRecording(targetRecording);
          console.log('AI analysis results updated');
        }
        
        // Stop polling if analysis is complete or failed
        if (newStatus === 'completed' || newStatus === 'failed') {
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
            console.log('Polling stopped - analysis complete');
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing recording:', error);
    }
  };

  const getCurrentStepData = () => {
    return ANALYSIS_STEPS.find(step => step.id === currentStep) || ANALYSIS_STEPS[0];
  };

  const getStepIndex = () => {
    return ANALYSIS_STEPS.findIndex(step => step.id === currentStep);
  };

  const goToNextStep = () => {
    const currentIndex = getStepIndex();
    if (currentIndex < ANALYSIS_STEPS.length - 1) {
      setCurrentStep(ANALYSIS_STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(ANALYSIS_STEPS[currentIndex - 1].id);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error controlling video playback:', error);
    }
  };

  const handleVideoPress = () => {
    setShowControls(true);
    resetControlsTimeout();
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleSeek = async (value: number) => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.setPositionAsync(value * duration);
    } catch (error) {
      console.error('Error seeking video:', error);
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    if (userNotes.trim() && recording) {
      try {
        await updateRecordingObservations(recording.id, userNotes.trim());
        console.log('Observations saved successfully');
      } catch (error) {
        console.error('Error saving observations:', error);
      }
    }
    
    // Check if AI analysis is available and navigate accordingly
    if (recording && recording.aiAnalysis && analysisStatus === 'completed') {
      // Navigate to AI Analysis page if analysis is complete
      router.push(`/ai-analysis?recordingId=${recording.id}`);
    } else {
      // Navigate back to dashboard if no analysis available
      router.replace('/dashboard');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: '#000' }]}>Loading your recording...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recording) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={'#000'} />
          <Text style={[styles.errorText, { color: '#000' }]}>Recording not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepData = getCurrentStepData();
  const stepIndex = getStepIndex();
  const progress = ((stepIndex + 1) / ANALYSIS_STEPS.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header with Progress */}
      <View style={[styles.header, { backgroundColor: '#fff' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color={'#000'} />
          <Text style={[styles.backText, { color: '#000' }]}></Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {/* AI Analysis Status Indicator */}
          <View style={styles.analysisStatusHeader}>
            {analysisStatus === 'completed' ? (
              <View style={[styles.analysisStatusBadge, { backgroundColor: '#4CAF50' }]}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="white" />
                <Text style={styles.analysisStatusText}>AI Analysis Complete</Text>
              </View>
            ) : analysisStatus === 'pending' ? (
              <View style={[styles.analysisStatusBadge, { backgroundColor: '#FF9800' }]}>
                <IconSymbol name="clock.fill" size={14} color="white" />
                <Text style={styles.analysisStatusText}>AI Analysis Processing...</Text>
              </View>
            ) : analysisStatus === 'failed' ? (
              <View style={[styles.analysisStatusBadge, { backgroundColor: '#F44336' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color="white" />
                <Text style={styles.analysisStatusText}>AI Analysis Failed</Text>
              </View>
            ) : (
              // <View style={[styles.analysisStatusBadge, { backgroundColor: '#9CA3AF' }]}>
              //   <IconSymbol name="brain" size={14} color="white" />
              //   <Text style={styles.analysisStatusText}>AI Analysis Not Requested</Text>
              // </View>
              <View></View>
            )}
          </View>
          
          {/* Creative Progress Bar with Step Indicators */}
          <View style={styles.creativeProgressContainer}>
            {/* Animated Progress Fill */}
            <View style={[styles.animatedProgressBar, { backgroundColor: '#F3F4F6' }]}>
              <Animated.View 
                style={[
                  styles.animatedProgressFill, 
                  { 
                    backgroundColor: colors.tint,
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]} 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Header */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={600}
          style={styles.stepHeader}
        >
          <Text style={styles.stepEmoji}>{currentStepData.emoji}</Text>
          <Text style={[styles.stepTitle, { color: '#000' }]}>{currentStepData.title}</Text>
          <Text style={[styles.stepSubtitle, { color: '#000' + '80' }]}>{currentStepData.subtitle}</Text>
        </Animatable.View>

        {/* Step Description */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={600}
          delay={200}
          style={[styles.descriptionCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '30' }]}
        >
          <Text style={[styles.descriptionText, { color: '#000' + '90' }]}>
            {currentStepData.description}
          </Text>
        </Animatable.View>

        {/* Video Player - Show for all steps */}
        {currentStep !== 'complete' && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={400}
            style={styles.videoSection}
          >
            <TouchableOpacity 
              style={styles.videoContainer}
              onPress={handleVideoPress}
              activeOpacity={1}
            >
              {focusMode !== 'audio' ? (
                <Video
                  ref={videoRef}
                  source={{ uri: recording.localUri }}
                  style={styles.video}
                  useNativeControls={false}
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping={false}
                  isMuted={focusMode === 'video' || isMuted}
                  onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                    if (status.isLoaded) {
                      setIsPlaying(status.isPlaying || false);
                      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
                      setPosition(status.positionMillis ? status.positionMillis / 1000 : 0);
                    }
                  }}
                />
              ) : (
                <View style={[styles.audioOnlyContainer, { backgroundColor: '#000' + '10' }]}>
                  <IconSymbol name="waveform" size={64} color={'#000'} />
                  <Text style={[styles.audioOnlyText, { color: '#000' }]}>Audio Focus Mode</Text>
                  <Text style={[styles.audioOnlySubtext, { color: '#000' + '80' }]}>
                    Video is hidden to help you focus on speech
                  </Text>
                  <Video
                    ref={videoRef}
                    source={{ uri: recording.localUri }}
                    style={{ width: 0, height: 0 }}
                    useNativeControls={false}
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    isMuted={false}
                    onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                      if (status.isLoaded) {
                        setIsPlaying(status.isPlaying || false);
                        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
                        setPosition(status.positionMillis ? status.positionMillis / 1000 : 0);
                      }
                    }}
                  />
                </View>
              )}
              
              {/* Video Controls */}
              {showControls && (
                <View style={styles.controlsOverlay}>
                  <TouchableOpacity 
                    style={styles.centerPlayButton}
                    onPress={handlePlayPause}
                  >
                    <BlurView intensity={80} tint="dark" style={styles.centerPlayButtonBlur}>
                      <IconSymbol 
                        name={isPlaying ? "pause.fill" : "play.fill"} 
                        size={24} 
                        color="white" 
                      />
                    </BlurView>
                  </TouchableOpacity>

                  <View style={styles.bottomControls}>
                    <BlurView intensity={80} tint="dark" style={styles.bottomControlsBlur}>
                      <View style={styles.videoProgressContainer}>
                        <Text style={styles.timeText}>{formatDuration(position)}</Text>
                        <TouchableOpacity 
                          style={styles.videoProgressBar}
                          onPress={(event) => {
                            const { locationX } = event.nativeEvent;
                            const progressWidth = width * 0.7;
                            const percentage = Math.max(0, Math.min(1, locationX / progressWidth));
                            handleSeek(percentage);
                          }}
                        >
                          <View 
                            style={[styles.videoProgressFill, { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }]}
                          />
                          <View
                            style={[styles.progressThumb, { left: `${duration > 0 ? (position / duration) * 100 : 0}%` }]}
                          />
                        </TouchableOpacity>
                        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
                      </View>
                      
                      <View style={styles.controlButtons}>
                        <TouchableOpacity 
                          style={styles.smallControlButton}
                          onPress={handlePlayPause}
                        >
                          <IconSymbol 
                            name={isPlaying ? "pause.fill" : "play.fill"} 
                            size={18} 
                            color="white" 
                          />
                        </TouchableOpacity>
                        
                        {focusMode !== 'video' && (
                          <TouchableOpacity 
                            style={styles.smallControlButton}
                            onPress={toggleMute}
                          >
                            <IconSymbol 
                              name={isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"} 
                              size={16} 
                              color="white" 
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </BlurView>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Focus Mode Controls - Show for all steps except complete */}
        {currentStep !== 'complete' && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={600}
            style={styles.focusControls}
          >
            <Text style={[styles.focusTitle, { color: '#000' }]}>Choose Your Focus</Text>
            <View style={[styles.segmentedControl, { backgroundColor: '#000' + '10' }]}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  focusMode === 'both' && [styles.activeSegment, { backgroundColor: colors.tint }]
                ]}
                onPress={() => setFocusMode('both')}
                activeOpacity={0.7}
              >
                <View style={styles.segmentContent}>
                  <IconSymbol 
                    name="eye" 
                    size={18} 
                    color={focusMode === 'both' ? 'white' : '#000' + '80'} 
                  />
                  <Text style={[
                    styles.segmentText, 
                    { 
                      color: focusMode === 'both' ? 'white' : '#000' + '80',
                      fontWeight: focusMode === 'both' ? '600' : '500'
                    }
                  ]}>
                    Both
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  focusMode === 'audio' && [styles.activeSegment, { backgroundColor: colors.tint }]
                ]}
                onPress={() => setFocusMode('audio')}
                activeOpacity={0.7}
              >
                <View style={styles.segmentContent}>
                  <IconSymbol 
                    name="speaker.wave.2" 
                    size={18} 
                    color={focusMode === 'audio' ? 'white' : '#000' + '80'} 
                  />
                  <Text style={[
                    styles.segmentText, 
                    { 
                      color: focusMode === 'audio' ? 'white' : '#000' + '80',
                      fontWeight: focusMode === 'audio' ? '600' : '500'
                    }
                  ]}>
                    Audio
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  focusMode === 'video' && [styles.activeSegment, { backgroundColor: colors.tint }]
                ]}
                onPress={() => setFocusMode('video')}
                activeOpacity={0.7}
              >
                <View style={styles.segmentContent}>
                  <IconSymbol 
                    name="video" 
                    size={18} 
                    color={focusMode === 'video' ? 'white' : '#000' + '80'} 
                  />
                  <Text style={[
                    styles.segmentText, 
                    { 
                      color: focusMode === 'video' ? 'white' : '#000' + '80',
                      fontWeight: focusMode === 'video' ? '600' : '500'
                    }
                  ]}>
                    Video
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        )}

        {/* Observations Input - Show for all steps except complete */}
        {currentStep !== 'complete' && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={800}
            style={styles.notesSection}
          >
            <Text style={[styles.notesTitle, { color: '#000' }]}>Your Observations</Text>
            <Text style={[styles.notesSubtitle, { color: '#000' + '80' }]}>
              Take notes as you watch. Write down your strengths, areas for improvement, and any insights.
            </Text>
            
            <View style={[styles.textInputContainer, { borderColor: '#000' + '20', backgroundColor: '#fff' }]}>
              <TextInput
                style={[styles.textInput, { color: '#000' }]}
                multiline
                numberOfLines={6}
                placeholder="Write your observations here... What did you notice about your voice, body language, confidence, or delivery?"
                placeholderTextColor="#0000060"
                value={userNotes}
                onChangeText={setUserNotes}
                textAlignVertical="top"
              />
            </View>
            
            {userNotes.length > 0 && (
              <Text style={[styles.characterCount, { color: '#000' + '60' }]}>
                {userNotes.length} characters
              </Text>
            )}
          </Animatable.View>
        )}

        {/* Instructions */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={600}
          delay={currentStep !== 'complete' ? 1000 : 400}
          style={styles.instructionsSection}
        >
          <Text style={[styles.instructionsTitle, { color: '#000' }]}>Instructions</Text>
          {currentStepData.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={[styles.instructionNumber, { backgroundColor: colors.tint }]}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.instructionText, { color: '#000' + '90' }]}>
                {instruction}
              </Text>
            </View>
          ))}
        </Animatable.View>

        {/* Tips */}
        {currentStepData.tips && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={currentStep !== 'complete' ? 1200 : 600}
            style={[styles.tipsSection, { backgroundColor: colors.tint + '05', borderColor: colors.tint + '20' }]}
          >
            <View style={styles.tipsHeader}>
              <IconSymbol name="lightbulb" size={18} color={colors.tint} />
              <Text style={[styles.tipsTitle, { color: colors.tint }]}>Pro Tips</Text>
            </View>
            {currentStepData.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={[styles.tipText, { color: '#000' + '80' }]}>{tip}</Text>
              </View>
            ))}
          </Animatable.View>
        )}


        {/* Completion Summary - Show only for complete step */}
        {currentStep === 'complete' && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={800}
            style={styles.completionSection}
          >
            <View style={[styles.completionCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '30' }]}>
              <Text style={[styles.completionTitle, { color: '#000' }]}>Analysis Summary</Text>
              <Text style={[styles.completionText, { color: '#000' + '90' }]}>
                You've completed a thorough analysis of your recording. Your insights will help you improve with each practice session.
              </Text>
              
              {userNotes.trim() && (
                <View style={styles.notesPreview}>
                  <Text style={[styles.notesPreviewTitle, { color: '#000' }]}>Your Notes:</Text>
                  <Text style={[styles.notesPreviewText, { color: '#000' + '80' }]}>
                    {userNotes.length > 200 ? userNotes.substring(0, 200) + '...' : userNotes}
                  </Text>
                </View>
              )}
            </View>
          </Animatable.View>
        )}

        {/* AI Analysis Button - Show when analysis is complete */}
        {currentStep === 'complete' && analysisStatus === 'completed' && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={1000}
            style={styles.aiAnalysisSection}
          >
            <TouchableOpacity
              style={[styles.aiAnalysisButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push(`/ai-analysis?recordingId=${recordingId}`)}
              activeOpacity={0.8}
            >
              <View style={styles.aiAnalysisButtonContent}>
                <IconSymbol name="brain" size={20} color="white" />
                <View style={styles.aiAnalysisButtonText}>
                  <Text style={styles.aiAnalysisButtonTitle}>View AI Analysis</Text>
                  <Text style={styles.aiAnalysisButtonSubtitle}>
                    Detailed insights from Gemini AI
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </Animatable.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Navigation Buttons */}
      <View style={[styles.fixedNavigationContainer, { backgroundColor: '#fff' }]}>
        <View style={styles.fixedNavigationButtons}>
          {stepIndex > 0 && (
            <TouchableOpacity
              style={[styles.fixedNavButton, styles.fixedPreviousButton, { borderColor: '#000' + '30' }]}
              onPress={goToPreviousStep}
            >
              <IconSymbol name="chevron.left" size={14} color={'#000'} />
              <Text style={[styles.fixedNavButtonText, { color: '#000' }]}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {stepIndex < ANALYSIS_STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.fixedNavButton, styles.fixedNextButton, { backgroundColor: colors.tint }]}
              onPress={goToNextStep}
            >
              <Text style={styles.fixedNextButtonText}>Next Step</Text>
              <IconSymbol name="chevron.right" size={14} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.fixedNavButton, styles.fixedCompleteButton, { backgroundColor: colors.tint }]}
              onPress={handleComplete}
            >
              <IconSymbol name="checkmark.circle.fill" size={16} color="white" />
              <Text style={styles.fixedCompleteButtonText}>
                {recording && recording.aiAnalysis && analysisStatus === 'completed' 
                  ? 'View AI Analysis' 
                  : 'Complete Analysis'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
    marginLeft: 53,
  },
  analysisStatusHeader: {
    marginBottom: 8,
  },
  analysisStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  analysisStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  creativeProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  stepIndicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  stepIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  connectionLine: {
    height: 2,
    width: 20,
    marginHorizontal: 4,
    borderRadius: 1,
  },
  animatedProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  animatedProgressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  descriptionCard: {
    margin: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  videoSection: {
    margin: 20,
    marginBottom: 16,
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 320,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  audioOnlyContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  audioOnlyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  audioOnlySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  centerPlayButtonBlur: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  bottomControlsBlur: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  videoProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  timeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'center',
  },
  videoProgressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    position: 'relative',
    paddingVertical: 8,
  },
  videoProgressFill: {
    height: 3,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    marginLeft: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallControlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  focusControls: {
    margin: 20,
    marginBottom: 16,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  activeSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  segmentText: {
    fontSize: 14,
  },
  instructionsSection: {
    margin: 20,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  tipsSection: {
    margin: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  notesSection: {
    margin: 20,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  completionSection: {
    margin: 20,
    marginBottom: 16,
  },
  completionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  notesPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 8,
  },
  notesPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesPreviewText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  fixedNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fixedNavigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fixedNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 40,
  },
  fixedPreviousButton: {
    borderWidth: 1,
    flex: 1,
  },
  fixedNextButton: {
    flex: 2,
  },
  fixedCompleteButton: {
    flex: 2,
  },
  fixedNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fixedNextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fixedCompleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  aiAnalysisSection: {
    margin: 20,
    marginBottom: 16,
  },
  aiAnalysisButton: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiAnalysisButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAnalysisButtonText: {
    flex: 1,
  },
  aiAnalysisButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  aiAnalysisButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});
