import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { exerciseSessionStorage, ExerciseSessionSummary } from '@/utils/exerciseSessionStorage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

interface Exercise {
  id: string;
  title: string;
  description: string;
  icon: 'video.fill' | 'person.fill';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  color: string;
}

const exercises: Exercise[] = [
  {
    id: 's-pronunciation',
    title: 'S Pronunciation Practice',
    description: 'Master the correct pronunciation of the "S" sound with guided exercises and real-time feedback.',
    icon: 'video.fill',
    difficulty: 'Beginner',
    estimatedTime: '5-10 min',
    color: '#4CAF50',
  },
  {
    id: 'quick-introduction',
    title: 'Quick Introduction',
    description: 'Practice introducing yourself confidently with proper pacing and clarity.',
    icon: 'person.fill',
    difficulty: 'Beginner',
    estimatedTime: '3-5 min',
    color: '#2196F3',
  },
];

export default function PracticeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [recentSessions, setRecentSessions] = useState<ExerciseSessionSummary[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    exerciseBreakdown: {} as Record<string, number>,
    averageScore: 0,
  });

  // Load recent sessions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadSessionData = async () => {
        try {
          const [sessions, stats] = await Promise.all([
            exerciseSessionStorage.getRecentSessions(3),
            exerciseSessionStorage.getSessionStats(),
          ]);
          setRecentSessions(sessions);
          setSessionStats(stats);
        } catch (error) {
          console.error('Error loading session data:', error);
        }
      };
      
      loadSessionData();
    }, [])
  );

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise/${exercise.id}`);
  };

  const renderExerciseCard = (exercise: Exercise, index: number) => (
    <Animatable.View
      key={exercise.id}
      animation="fadeInUp"
      duration={600}
      delay={index * 100}
      style={styles.exerciseCardContainer}
    >
      <TouchableOpacity
        style={[styles.exerciseCard, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}
        onPress={() => handleExercisePress(exercise)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[exercise.color + '15', exercise.color + '05']}
          style={styles.exerciseHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.iconContainer, { backgroundColor: exercise.color }]}>
            <IconSymbol name={exercise.icon} size={24} color="white" />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseTitle, { color: '#1F2937' }]}>
              {exercise.title}
            </Text>
            <View style={styles.exerciseMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: exercise.color + '20' }]}>
                <Text style={[styles.difficultyText, { color: exercise.color }]}>
                  {exercise.difficulty}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <IconSymbol name="clock" size={12} color="#6B7280" />
                <Text style={[styles.timeText, { color: '#6B7280' }]}>
                  {exercise.estimatedTime}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.exerciseContent}>
          <Text style={[styles.exerciseDescription, { color: '#374151' }]}>
            {exercise.description}
          </Text>
          
          <View style={styles.exerciseFooter}>
            <View style={styles.startButtonContainer}>
              <LinearGradient
                colors={[exercise.color, exercise.color + 'CC']}
                style={styles.startButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="play.fill" size={16} color="white" />
                <Text style={styles.startButtonText}>Start Exercise</Text>
              </LinearGradient>
            </View>
            <IconSymbol name="chevron.right" size={16} color="#D1D5DB" />
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header Section */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={800}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: '#1F2937' }]}>
                Practice Exercises
              </Text>
              <Text style={[styles.subtitle, { color: '#6B7280' }]}>
                Improve your speaking skills with guided exercises
              </Text>
            </View>
            
            <View style={[styles.statsContainer, { backgroundColor: colors.tint + '10' }]}>
              <Text style={[styles.statsNumber, { color: colors.tint }]}>
                {sessionStats.totalSessions}
              </Text>
              <Text style={[styles.statsLabel, { color: colors.tint }]}>
                Sessions
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Exercise Allocation Message */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={200}
          style={styles.allocationSection}
        >
          <View style={[styles.allocationContainer, { backgroundColor: '#F0F9FF', borderColor: '#0EA5E9' }]}>
            <View style={styles.allocationHeader}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#0EA5E9" />
              <Text style={[styles.allocationTitle, { color: '#0C4A6E' }]}>
                Personalized Exercise Plan
              </Text>
            </View>
            <Text style={[styles.allocationText, { color: '#075985' }]}>
              The following exercises have been allocated to you on the basis of your previous practice sessions and performance analysis.
            </Text>
          </View>
        </Animatable.View>

        {/* Exercises Section */}
        <View style={styles.exercisesSection}>
          <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
            Your Assigned Exercises
          </Text>
          
          {exercises.map((exercise, index) => renderExerciseCard(exercise, index))}
        </View>

        {/* Recent Sessions Section */}
        {recentSessions.length > 0 && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={300}
            style={styles.recentSessionsSection}
          >
            <Text style={[styles.sectionTitle, { color: '#1F2937' }]}>
              Recent Practice Sessions
            </Text>
            
            {recentSessions.map((session, index) => (
              <View key={session.id} style={[styles.sessionCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionTitle, { color: '#1F2937' }]}>
                    {session.exerciseTitle}
                  </Text>
                  <Text style={[styles.sessionDate, { color: '#6B7280' }]}>
                    {session.endTime.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.sessionMeta}>
                  <View style={styles.sessionMetaItem}>
                    <IconSymbol name="clock" size={12} color="#6B7280" />
                    <Text style={[styles.sessionMetaText, { color: '#6B7280' }]}>
                      {Math.floor(session.duration / 60)}m {session.duration % 60}s
                    </Text>
                  </View>
                  {session.score && (
                    <View style={styles.sessionMetaItem}>
                      <IconSymbol name="star.fill" size={12} color="#F59E0B" />
                      <Text style={[styles.sessionMetaText, { color: '#6B7280' }]}>
                        {session.score}/10
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Animatable.View>
        )}

        {/* Tips Section */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={400}
          style={styles.tipsSection}
        >
          <View style={[styles.tipsContainer, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
            <View style={styles.tipsHeader}>
              <IconSymbol name="lightbulb" size={20} color="#F59E0B" />
              <Text style={[styles.tipsTitle, { color: '#1F2937' }]}>
                Practice Tips
              </Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={[styles.tipText, { color: '#374151' }]}>
                  Find a quiet environment for practice
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={[styles.tipText, { color: '#374151' }]}>
                  Speak clearly and at a comfortable pace
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={[styles.tipText, { color: '#374151' }]}>
                  Listen to feedback and adjust accordingly
                </Text>
              </View>
            </View>
          </View>
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
  headerSection: {
    marginBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  exercisesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  exerciseCardContainer: {
    marginBottom: 16,
  },
  exerciseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseContent: {
    padding: 20,
    paddingTop: 0,
  },
  exerciseDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButtonContainer: {
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
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
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentSessionsSection: {
    marginBottom: 32,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsList: {
    gap: 8,
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
  // Allocation Section Styles
  allocationSection: {
    marginBottom: 24,
  },
  allocationContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#0EA5E9',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  allocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  allocationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  allocationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
