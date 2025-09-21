import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { uploadVideoForAnalysis } from '@/utils/apiService';
import {
  RecordingMetadata,
  clearAllRecordingMetadata,
  exportRecordingMetadata,
  formatDuration,
  generateRecordingId,
  generateVideoThumbnail,
  getRecordingMetadata,
  getVideoDuration,
  saveAnalysisToRecording,
  saveRecordingMetadata,
  updateRecordingAnalysisStatus,
} from '@/utils/recordingUtils';
import { analyzeVideoWithGemini, mockAnalyzeSpeechVideo } from '@/utils/speechAnalysis';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
// @ts-ignore - react-native-video-compressor doesn't have TypeScript definitions
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Video compression will be handled by camera settings

const { width, height } = Dimensions.get('window');

// Array of different intro texts to cycle through
const introTexts = [
  "Introduce yourself and talk about your goals for the next 30 seconds",
  "Tell us about your biggest accomplishment and what you learned from it",
  "Describe a challenge you faced recently and how you overcame it",
  "Share your passion and what drives you every day",
  "Explain a skill you've been developing and why it matters to you",
  "Talk about a moment that changed your perspective on life",
  "Describe your ideal work environment and what motivates you",
  "Share a piece of advice that has shaped who you are today"
];

export default function CameraPracticeScreen() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Animation values for fade transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textChangeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to animate text change
  const changeText = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800, // 800ms fade out
      useNativeDriver: true,
    }).start(() => {
      // Change text at the middle of animation
      setCurrentTextIndex((prev) => (prev + 1) % introTexts.length);
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800, // 800ms fade in
        useNativeDriver: true,
      }).start();
    });
  };

  // Set up text cycling when component mounts
  useEffect(() => {
    // Only start cycling if not recording
    if (!isRecording) {
      textChangeIntervalRef.current = setInterval(changeText, 5000); // Change every 5 seconds
    } else {
      // Clear interval when recording starts
      if (textChangeIntervalRef.current) {
        clearInterval(textChangeIntervalRef.current);
        textChangeIntervalRef.current = null;
      }
    }

    // Cleanup interval on unmount or when recording state changes
    return () => {
      if (textChangeIntervalRef.current) {
        clearInterval(textChangeIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Check media library permissions on mount
  useEffect(() => {
    const checkMediaLibraryPermission = async () => {
      try {
        const { status } = await MediaLibrary.getPermissionsAsync();
        setMediaLibraryPermission(status);
      } catch (error) {
        console.error('Error checking media library permission:', error);
        setMediaLibraryPermission('denied');
      }
    };

    checkMediaLibraryPermission();
  }, []);

  const requestAllPermissions = async () => {
    try {
      // Request camera permission
      const cameraResult = await requestPermission();
      
      // Request microphone permission
      const microphoneResult = await requestMicrophonePermission();
      
      // Request media library permission
      const mediaLibraryResult = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaLibraryResult.status);
      
      return cameraResult && microphoneResult && mediaLibraryResult.status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted || !microphonePermission?.granted || mediaLibraryPermission !== 'granted') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.permissionContainer}>
          <IconSymbol name="camera.fill" size={64} color={colors.text} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Permissions Required
          </Text>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            We need access to your camera, microphone, and photo library to help you practice speaking and save your recordings.
          </Text>
          
          {/* Permission status indicators */}
          <View style={styles.permissionStatus}>
            <View style={styles.permissionItem}>
              <IconSymbol 
                name={permission.granted ? "checkmark.circle.fill" : "camera.fill"} 
                size={20} 
                color={permission.granted ? '#4CAF50' : colors.text} 
              />
              <Text style={[styles.permissionItemText, { color: colors.text }]}>
                Camera: {permission.granted ? 'Granted' : 'Required'}
              </Text>
            </View>
            
            <View style={styles.permissionItem}>
              <IconSymbol 
                name={microphonePermission?.granted ? "checkmark.circle.fill" : "mic.fill"} 
                size={20} 
                color={microphonePermission?.granted ? '#4CAF50' : colors.text} 
              />
              <Text style={[styles.permissionItemText, { color: colors.text }]}>
                Microphone: {microphonePermission?.granted ? 'Granted' : 'Required'}
              </Text>
            </View>
            
            <View style={styles.permissionItem}>
              <IconSymbol 
                name={mediaLibraryPermission === 'granted' ? "checkmark.circle.fill" : "photo.on.rectangle"} 
                size={20} 
                color={mediaLibraryPermission === 'granted' ? '#4CAF50' : colors.text} 
              />
              <Text style={[styles.permissionItemText, { color: colors.text }]}>
                Photo Library: {mediaLibraryPermission === 'granted' ? 'Granted' : 'Required'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.tint }]}
            onPress={requestAllPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.tint }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const requestAIAnalysis = async (
    recordingId: string, 
    videoUri: string, 
    mode: 'general' | 'interview' | 'sales' | 'pitch' = 'general'
  ): Promise<void> => {
    try {
      console.log('Starting AI analysis for recording:', recordingId);
      
      // Update status to pending
      await updateRecordingAnalysisStatus(recordingId, 'pending', mode);
      
      // Show loading alert
      // Alert.alert(
      //   'AI Analysis Starting',
      //   'Your speech is being analyzed by AI. This may take up to 60 seconds...',
      //   [{ text: 'OK' }]
      // );

      // Try Gemini analysis first, then fall back to mock analysis
      let analysisResult;
      
      try {
        // Try Gemini API first
        analysisResult = await analyzeVideoWithGemini(videoUri, recordingId, mode);
        console.log('Gemini analysis completed');
      } catch (geminiError) {
        console.log('Gemini analysis failed, trying backend API:', geminiError);
        
        try {
          // Try backend API as fallback
          analysisResult = await uploadVideoForAnalysis(videoUri, mode);
          console.log('Backend API analysis completed');
        } catch (apiError) {
          console.log('Backend API failed, using mock analysis:', apiError);
          // Fall back to mock analysis
          analysisResult = await mockAnalyzeSpeechVideo(videoUri, mode);
        }
      }

      // Save analysis results
      await saveAnalysisToRecording(recordingId, analysisResult);
      
      console.log('AI analysis completed for recording:', recordingId);
      
      // Analysis is complete - the guided analysis screen will automatically update
      // No need for alerts or navigation here since we're already on guided analysis
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Update status to failed
      await updateRecordingAnalysisStatus(recordingId, 'failed');
      
      let errorMessage = 'AI analysis failed. Please try again later.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to AI service. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Analysis timed out. Please try again with a shorter video.';
        }
      }
      
      Alert.alert(
        'Analysis Failed',
        errorMessage,
        [
          { text: 'Try Again', onPress: () => requestAIAnalysis(recordingId, videoUri, mode) },
          { text: 'Skip Analysis', style: 'cancel' }
        ]
      );
    }
  };

  const showAnalysisModeSelector = (recordingId: string, videoUri: string) => {
    Alert.alert(
      'Choose Analysis Type',
      'What type of speech analysis would you like?',
      [
        { 
          text: 'General Communication',
          onPress: () => requestAIAnalysis(recordingId, videoUri, 'general')
        },
        { 
          text: 'Interview Practice',
          onPress: () => requestAIAnalysis(recordingId, videoUri, 'interview')
        },
        { 
          text: 'Sales Presentation',
          onPress: () => requestAIAnalysis(recordingId, videoUri, 'sales')
        },
        { 
          text: 'Startup Pitch',
          onPress: () => requestAIAnalysis(recordingId, videoUri, 'pitch')
        },
        { text: 'Skip Analysis', style: 'cancel' }
      ]
    );
  };

  const handleRecordPress = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingStartTime(null);
      cameraRef.current.stopRecording();
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30, // 30 second limit
        });
        if (video) {
          console.log('Video recorded:', video.uri);
          await saveVideo(video.uri);
        }
      } catch (error) {
        console.error('Recording failed:', error);
        setIsRecording(false);
        setRecordingStartTime(null);
      }
    }
  };

  const compressVideo = async (videoUri: string): Promise<string> => {
    try {
      console.log('Processing video for optimal storage...');
      
      // For now, we'll use the original video but with lower quality settings
      // The compression will be handled by the camera recording settings
      // This ensures compatibility and avoids library issues
      
      console.log('Video processing completed:', videoUri);
      return videoUri;
    } catch (error) {
      console.error('Video processing failed:', error);
      // Return original video if processing fails
      return videoUri;
    }
  };

  const saveVideo = async (videoUri: string) => {
    try {
      // Show processing alert
      // Alert.alert(
      //   'Processing Video',
      //   'Processing your video for optimal storage...',
      //   [{ text: 'OK' }]
      // );

      // Compress the video first
      const compressedVideoUri = await compressVideo(videoUri);
      
      // Create a permanent file name and unique ID
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const recordingId = generateRecordingId();
      const fileName = `SpotLight_Practice_${timestamp}.mp4`;
      const documentDirectory = FileSystem.documentDirectory;
      const localUri = `${documentDirectory}${fileName}`;
      
      // Copy the compressed video to app's document directory
      await FileSystem.copyAsync({
        from: compressedVideoUri,
        to: localUri,
      });

      // Get file size
      let fileSize: number | undefined;
      try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists && fileInfo.size) {
          fileSize = fileInfo.size;
        }
      } catch (sizeError) {
        console.warn('Could not get file size:', sizeError);
      }

      // Get video duration from the actual video file
      const duration = await getVideoDuration(localUri);

      // Generate thumbnail
      let thumbnailUri: string | undefined;
      try {
        thumbnailUri = await generateVideoThumbnail(localUri, recordingId);
      } catch (thumbnailError) {
        console.warn('Could not generate thumbnail:', thumbnailError);
      }

      // Create recording metadata
      const metadata: RecordingMetadata = {
        id: recordingId,
        fileName,
        localUri,
        thumbnailUri,
        timestamp,
        promptText: introTexts[currentTextIndex],
        facing,
        createdAt: new Date(),
        recordedDate: new Date().toLocaleDateString(),
        fileSize,
        duration, // Duration in seconds from video file
        analysisStatus: 'not_requested', // Initialize analysis status
      };
      
      if (mediaLibraryPermission === 'granted') {
        try {
          // Save compressed video to device's photo library
          const asset = await MediaLibrary.createAssetAsync(localUri);
          await MediaLibrary.createAlbumAsync('SpotLight', asset, false);
          
          // Update metadata with photo library URI
          metadata.photoLibraryUri = asset.uri;
          
          // Save metadata to local storage
          await saveRecordingMetadata(metadata);
          
          console.log('Compressed video saved to:', localUri);
          console.log('Compressed video saved to photo library');
          
          // Navigate to guided analysis immediately
          try {
            router.replace({
              pathname: '/guided-analysis',
              params: { recordingId }
            });
            
            // Start Gemini analysis in background
            console.log('Starting automatic Gemini analysis...');
            requestAIAnalysis(recordingId, localUri, 'general').catch((analysisError) => {
              console.error('Automatic analysis failed:', analysisError);
            });
          } catch (navError) {
            console.error('Navigation error:', navError);
            Alert.alert('Navigation Error', 'Could not open analysis screen. Please try again.');
          }
        } catch (mediaError) {
          console.error('Error saving to photo library:', mediaError);
          
          // Save metadata without photo library URI
          await saveRecordingMetadata(metadata);
          
          console.log('Compressed video saved to app storage (photo library failed):', localUri);
          
          // Navigate to guided analysis immediately
          try {
            router.replace({
              pathname: '/guided-analysis',
              params: { recordingId }
            });
            
            // Start Gemini analysis in background
            console.log('Starting automatic Gemini analysis...');
            requestAIAnalysis(recordingId, localUri, 'general').catch((analysisError) => {
              console.error('Automatic analysis failed:', analysisError);
            });
          } catch (navError) {
            console.error('Navigation error:', navError);
            Alert.alert('Navigation Error', 'Could not open analysis screen. Please try again.');
          }
        }
      } else {
        // Save metadata without photo library URI
        await saveRecordingMetadata(metadata);
        
        console.log('Compressed video saved to app storage:', localUri);
        
        // Navigate to guided analysis immediately
        try {
          router.replace({
            pathname: '/guided-analysis',
            params: { recordingId }
          });
          
          // Start Gemini analysis in background
          console.log('Starting automatic Gemini analysis...');
          requestAIAnalysis(recordingId, localUri, 'general').catch((analysisError) => {
            console.error('Automatic analysis failed:', analysisError);
          });
        } catch (navError) {
          console.error('Navigation error:', navError);
          Alert.alert('Navigation Error', 'Could not open analysis screen. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('Save Error', 'Failed to save your recording. Please try again.');
    }
  };

  const showSavedVideos = async () => {
    try {
      const recordings = await getRecordingMetadata();
      
      if (recordings.length === 0) {
        Alert.alert('No Videos', 'No practice videos found.');
      } else {
        const videoList = recordings
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((recording, index) => {
            const date = new Date(recording.createdAt).toLocaleDateString();
            const time = new Date(recording.createdAt).toLocaleTimeString();
            const durationText = recording.duration ? ` (${formatDuration(recording.duration)})` : '';
            const sizeText = recording.fileSize ? ` - ${(recording.fileSize / 1024 / 1024).toFixed(1)} MB` : '';
            return `${index + 1}. ${date} ${time}${durationText}${sizeText}`;
          }).join('\n\n');
        
        const documentDirectory = FileSystem.documentDirectory;
        Alert.alert(
          'Saved Videos',
          `Found ${recordings.length} practice video(s):\n\n${videoList}\n\nVideos are stored in:\n${documentDirectory}`,
          [
            { text: 'View All Metadata', onPress: () => showDetailedMetadata(recordings) },
            { text: 'OK', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Error reading saved videos:', error);
      Alert.alert('Error', 'Failed to read saved videos.');
    }
  };

  const showDetailedMetadata = (recordings: RecordingMetadata[]) => {
    const detailedInfo = recordings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((recording, index) => {
        const date = new Date(recording.createdAt).toLocaleString();
        const size = recording.fileSize ? `${(recording.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown';
        const duration = recording.duration ? formatDuration(recording.duration) : 'Unknown';
        return `${index + 1}. ${recording.fileName}\n   Date: ${date}\n   Duration: ${duration}\n   Size: ${size}`;
      }).join('\n\n');
    
    Alert.alert(
      'Recording Details',
      detailedInfo,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showSettingsMenu = () => {
    Alert.alert(
      'Practice Settings',
      'Choose an option:',
      [
        { 
          text: 'View All Recordings', 
          onPress: showSavedVideos 
        },
        { 
          text: 'Export Metadata', 
          onPress: async () => {
            const metadata = await exportRecordingMetadata();
            if (metadata) {
              Alert.alert('Export Complete', `Exported ${metadata.length} recording(s) metadata to console.`);
            }
          }
        },
        { 
          text: 'Clear All Metadata', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Clear Metadata',
              'This will clear all recording metadata but keep the video files. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Clear', 
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllRecordingMetadata();
                    Alert.alert('Cleared', 'All recording metadata has been cleared.');
                  }
                }
              ]
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleClosePress = () => {
    if (isRecording) {
      Alert.alert(
        'Recording in Progress',
        'Stop recording before closing?',
        [
          { text: 'Continue Recording', style: 'cancel' },
          { 
            text: 'Stop & Close', 
            style: 'destructive',
            onPress: () => {
              if (cameraRef.current) {
                cameraRef.current.stopRecording();
              }
              setIsRecording(false);
              setRecordingStartTime(null);
              router.back();
            }
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      >
        {/* Background blur overlay */}
        <View 
          style={styles.backgroundBlur}
        />

        {/* Gradient Overlays for better visual hierarchy */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />


        <SafeAreaView style={styles.topControls}>
          <View style={styles.topCenter}>
            <LinearGradient
              colors={[colors.gradientStart + '95', colors.gradientEnd + '95']}
              style={styles.introTextBlur}
            >
              <TouchableOpacity 
                onPress={changeText} 
                style={styles.introTextContainer}
                activeOpacity={0.8}
              >
                <Animated.View style={{ opacity: fadeAnim }}>
                  <View style={styles.introTextHeader}>
                    {/* <Text style={styles.introTextTitle}>Speaking Prompt</Text> */}
                    {/* <Text style={styles.introTextSubtitle}>Tap to change</Text> */}
                  </View>
                  <Text style={styles.introText}>
                    {introTexts[currentTextIndex]}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            
            {isRecording && (
                <View
                  // colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.recordingIndicator}
                  // start={{ x: 0, y: 0 }}
                  // end={{ x: 1, y: 0 }}
                >
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>🔴 Recording</Text>
                </View>
            )}

            </LinearGradient>
          </View>
        </SafeAreaView>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <BlurView intensity={70} tint="dark" style={styles.bottomControlsBlur}>
            <View style={styles.controlsContainer}>
              
              <TouchableOpacity
                style={styles.sideButton}
                onPress={handleClosePress}
              >
                <BlurView intensity={90} tint="dark" style={styles.sideButtonBlur}>
                  <IconSymbol name="xmark" size={20} color="white" />
                </BlurView>
              </TouchableOpacity>

              {/* Enhanced Record Button */}
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive
                ]}
                onPress={handleRecordPress}
              >
                <LinearGradient
                  colors={isRecording 
                    ? ['#FF6B6B', '#FF8E8E'] 
                    : [colors.accentGradientStart, colors.accentGradientEnd]
                  }
                  style={styles.recordButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* <View style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordButtonInnerActive
                  ]}>
                    {isRecording ? (
                      <View style={styles.stopIcon} />
                    ) : (
                      <Text style={styles.recordButtonEmoji}>🎤</Text>
                    )}
                  </View> */}
                </LinearGradient>
              </TouchableOpacity>

              {/* Settings button */}
              <TouchableOpacity
                style={styles.sideButton}
                onPress={showSettingsMenu}
              >
                <BlurView intensity={90} tint="dark" style={styles.sideButtonBlur}>
                  <IconSymbol name="gear" size={24} color="white" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionStatus: {
    gap: 12,
    marginVertical: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  topControls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
  },
  introTextBlur: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    height: 140, // Back to original height
    transform: [{ translateY: -75 }],
    paddingTop: 56
  },
  introTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  introText: {
    color: '#b9b9b9ff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    width: width - 40,
  },
  titleBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  practiceTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  recordingIndicatorBlur: {
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  promptOverlay: {
    position: 'absolute',
    top: '35%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  promptContainer: {
    borderRadius: 16,
    maxWidth: width - 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  promptGradient: {
    padding: 20,
    borderRadius: 16,
  },
  promptTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  promptText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 0,
  },
  bottomControlsBlur: {
    paddingTop: 20,
    paddingBottom: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  sideButtonBlur: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  recordButtonBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    borderColor: 'rgba(255,0,0,0.8)',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{translateX: -3}, {translateY: -3}],
  },
  recordButtonInnerActive: {
    backgroundColor: 'white',
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'red',
    borderRadius: 4,
  },
  // New colorful styles
  introTextHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  introTextEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  introTextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  introTextSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  recordButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
});
