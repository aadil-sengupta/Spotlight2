import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function ProgressScreen() {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animatable.View
          animation="fadeInDown"
          duration={800}
          style={styles.header}
        >
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your speech improvement journey</Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.content}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <IconSymbol name="clock.fill" size={24} color="#667eea" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Practice Sessions</Text>
            </View>
            
            <View style={styles.statCard}>
              <IconSymbol name="star.fill" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>8.5</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            
            <View style={styles.statCard}>
              <IconSymbol name="calendar" size={24} color="#10b981" />
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Days Streak</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.achievementCard}>
              <IconSymbol name="trophy.fill" size={20} color="#f59e0b" />
              <Text style={styles.achievementText}>Completed S Pronunciation Basics</Text>
            </View>
            <View style={styles.achievementCard}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
              <Text style={styles.achievementText}>Perfect Introduction Practice</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.progressCard}>
              <Text style={styles.progressText}>This week you've practiced for 2 hours and 15 minutes</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
});
