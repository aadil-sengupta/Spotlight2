import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

interface ExerciseData {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  tips: string[];
  icon: 'video.fill' | 'person.fill';
  color: string;
}

const exerciseData: Record<string, ExerciseData> = {
  's-pronunciation': {
    id: 's-pronunciation',
    title: 'S Pronunciation Practice',
    description: 'Master the correct pronunciation of the "S" sound with guided exercises and real-time feedback.',
    instructions: [
      'Position your tongue behind your upper teeth',
      'Keep your lips slightly apart',
      'Blow air through the gap between your tongue and teeth',
      'Practice with words containing "S" sounds',
      'Listen to the voice coach for feedback'
    ],
    tips: [
      'Start slowly and gradually increase speed',
      'Focus on clarity over speed',
      'Record yourself to hear your progress',
      'Practice daily for best results'
    ],
    icon: 'video.fill',
    color: '#4CAF50',
  },
  'quick-introduction': {
    id: 'quick-introduction',
    title: 'Quick Introduction Practice',
    description: 'Practice introducing yourself confidently with proper pacing and clarity.',
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
      'Use confident body language',
      'Practice different variations'
    ],
    icon: 'person.fill',
    color: '#2196F3',
  },
};

export default function ExerciseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isStarting, setIsStarting] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get exercise data from URL params
  const exercise = exerciseData[id || ''];

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Exercise not found</Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStartExercise = async () => {
    setIsStarting(true);
    // Simulate loading time
    setTimeout(() => {
      setIsStarting(false);
      // Navigate to voice coach with exercise context
      router.push(`/voice-coach?exercise=${exercise.id}`);
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={800}
          style={styles.headerSection}
        >
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: exercise.color }]}>
              <IconSymbol name={exercise.icon} size={32} color="white" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: '#1F2937' }]}>
                {exercise.title}
              </Text>
              <Text style={[styles.subtitle, { color: '#6B7280' }]}>
                {exercise.description}
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Instructions Section */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={200}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <IconSymbol name="list.bullet" size={20} color={exercise.color} />
            <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
              Instructions
            </Text>
          </View>
          
          <View style={styles.instructionsList}>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: exercise.color }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.instructionText, { color: '#374151' }]}>
                  {instruction}
                </Text>
              </View>
            ))}
          </View>
        </Animatable.View>

        {/* Tips Section */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={400}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <IconSymbol name="lightbulb" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
              Tips for Success
            </Text>
          </View>
          
          <View style={styles.tipsList}>
            {exercise.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={[styles.tipText, { color: '#374151' }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </Animatable.View>

        {/* Start Exercise Button */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={600}
          style={styles.startSection}
        >
          <TouchableOpacity
            style={styles.startButtonContainer}
            onPress={handleStartExercise}
            disabled={isStarting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[exercise.color, exercise.color + 'CC']}
              style={styles.startButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isStarting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <IconSymbol name="mic.fill" size={20} color="white" />
                  <Text style={styles.startButtonText}>Start Voice Practice</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={[styles.startDescription, { color: '#6B7280' }]}>
            You'll be connected to a voice coach who will guide you through this exercise
          </Text>
        </Animatable.View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#374151',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    marginBottom: 32,
  },
  backButtonContainer: {
    marginBottom: 20,
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: 'bold',
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  startSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  startButton: {
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
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
