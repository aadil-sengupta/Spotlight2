import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { vapiService } from '@/utils/vapiService';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

interface ExerciseContext {
  id: string;
  title: string;
  instructions: string[];
  tips: string[];
}

const exerciseContexts: Record<string, ExerciseContext> = {
  's-pronunciation': {
    id: 's-pronunciation',
    title: 'S Pronunciation Practice',
    instructions: [
      'Position your tongue behind your upper teeth',
      'Keep your lips slightly apart',
      'Blow air through the gap between your tongue and teeth',
      'Practice with words containing "S" sounds'
    ],
    tips: [
      'Start slowly and gradually increase speed',
      'Focus on clarity over speed',
      'Listen to the voice coach for feedback'
    ],
  },
  'quick-introduction': {
    id: 'quick-introduction',
    title: 'Quick Introduction Practice',
    instructions: [
      'Start with a warm greeting',
      'State your name clearly',
      'Mention your profession or role',
      'Share one interesting fact about yourself',
      'End with enthusiasm for the conversation'
    ],
    tips: [
      'Maintain eye contact (imagine looking at the listener)',
      'Speak at a comfortable pace',
      'Use confident body language'
    ],
  },
};

export default function VoiceCoachScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { exercise } = useLocalSearchParams<{ exercise?: string }>();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseContext | null>(null);

  useEffect(() => {
    if (exercise && exerciseContexts[exercise]) {
      setCurrentExercise(exerciseContexts[exercise]);
    }
  }, [exercise]);

  const handleStartSession = async () => {
    if (!currentExercise) {
      Alert.alert('Error', 'Exercise context not found');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Start exercise-specific session
      const session = await vapiService.startExerciseSession(currentExercise.id, currentExercise.title);
      
      setIsConnecting(false);
      setIsConnected(true);
      setSessionActive(true);
      
      console.log('Voice coaching session started:', session.id);
      
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to start voice coaching session:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to connect to voice coach. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEndSession = async () => {
    try {
      const sessionSummary = await vapiService.endCoachingSession();
      setSessionActive(false);
      setIsConnected(false);
      
      // Show completion message
      if (sessionSummary) {
        Alert.alert(
          'Session Complete!',
          `Great job! Your ${currentExercise?.title} practice session has been completed and saved.`,
          [
            {
              text: 'View Summary',
              onPress: () => {
                // Navigate to session summary - for now go to practice page
                router.push('/practice');
              }
            },
            {
              text: 'Done',
              onPress: () => router.push('/practice')
            }
          ]
        );
      } else {
        Alert.alert(
          'Session Complete!',
          'Your practice session has been completed.',
          [{ text: 'Done', onPress: () => router.push('/practice') }]
        );
      }
      
    } catch (error) {
      console.error('Failed to end session:', error);
      Alert.alert('Error', 'Failed to end session properly');
    }
  };

  const handleBack = () => {
    if (sessionActive) {
      Alert.alert(
        'End Session?',
        'Are you sure you want to end the current practice session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'End Session', onPress: handleEndSession }
        ]
      );
    } else {
      router.back();
    }
  };

  if (!currentExercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#F59E0B" />
          <Text style={styles.errorTitle}>Exercise Not Found</Text>
          <Text style={styles.errorText}>
            The requested exercise could not be found.
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/practice')}
          >
            <Text style={styles.backButtonText}>Back to Practice</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={handleBack}
        >
          <IconSymbol name="chevron.left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: '#1F2937' }]}>
            Voice Coach
          </Text>
          <Text style={[styles.headerSubtitle, { color: '#6B7280' }]}>
            {currentExercise.title}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {!isConnected ? (
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            style={styles.connectionSection}
          >
            {/* Exercise Info */}
            <View style={styles.exerciseInfo}>
              <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
                <IconSymbol name="mic.fill" size={32} color="white" />
              </View>
              
              <Text style={[styles.exerciseTitle, { color: '#1F2937' }]}>
                Ready to Practice?
              </Text>
              <Text style={[styles.exerciseDescription, { color: '#6B7280' }]}>
                Your voice coach will guide you through the {currentExercise.title.toLowerCase()} exercise.
              </Text>
            </View>

            {/* Instructions Preview */}
            <View style={styles.instructionsPreview}>
              <Text style={[styles.instructionsTitle, { color: '#1F2937' }]}>
                What you'll practice:
              </Text>
              <View style={styles.instructionsList}>
                {currentExercise.instructions.slice(0, 3).map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <Text style={styles.instructionBullet}>•</Text>
                    <Text style={[styles.instructionText, { color: '#374151' }]}>
                      {instruction}
                    </Text>
                  </View>
                ))}
                {currentExercise.instructions.length > 3 && (
                  <Text style={[styles.moreText, { color: '#6B7280' }]}>
                    +{currentExercise.instructions.length - 3} more instructions
                  </Text>
                )}
              </View>
            </View>

            {/* Connect Button */}
            <TouchableOpacity
              style={styles.connectButtonContainer}
              onPress={handleStartSession}
              disabled={isConnecting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.tint, colors.tint + 'CC']}
                style={styles.connectButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isConnecting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <IconSymbol name="phone.fill" size={20} color="white" />
                    <Text style={styles.connectButtonText}>Connect to Coach</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            style={styles.sessionSection}
          >
            {/* Active Session */}
            <View style={styles.activeSessionContainer}>
              <View style={styles.sessionStatus}>
                <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                  Connected to Voice Coach
                </Text>
              </View>
              
              <View style={styles.sessionInfo}>
                <IconSymbol name="mic.fill" size={48} color={colors.tint} />
                <Text style={[styles.sessionTitle, { color: '#1F2937' }]}>
                  Practice Session Active
                </Text>
                <Text style={[styles.sessionDescription, { color: '#6B7280' }]}>
                  Your voice coach is ready to help you practice. Start speaking when you're ready!
                </Text>
              </View>

              {/* Session Controls */}
              <View style={styles.sessionControls}>
                <TouchableOpacity
                  style={[styles.endButton, { backgroundColor: '#F44336' }]}
                  onPress={handleEndSession}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="phone.down.fill" size={20} color="white" />
                  <Text style={styles.endButtonText}>End Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButtonContainer: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  connectionSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  exerciseInfo: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionsPreview: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  instructionBullet: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  connectButtonContainer: {
    width: '100%',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionSection: {
    flex: 1,
    justifyContent: 'center',
  },
  activeSessionContainer: {
    alignItems: 'center',
    gap: 24,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50' + '15',
    borderRadius: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionInfo: {
    alignItems: 'center',
    gap: 16,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sessionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sessionControls: {
    width: '100%',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});