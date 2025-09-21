/**
 * Exercise Session Storage Utility
 * Handles saving and retrieving exercise session summaries
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ExerciseSessionSummary {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  conversationSummary?: string;
  feedback?: string;
  score?: number;
  improvements?: string[];
  nextSteps?: string[];
}

const STORAGE_KEY = 'exercise_sessions';

class ExerciseSessionStorage {
  /**
   * Save an exercise session summary
   */
  async saveSession(session: ExerciseSessionSummary): Promise<void> {
    try {
      const existingSessions = await this.getAllSessions();
      const updatedSessions = [...existingSessions, session];
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      console.log('Exercise session saved:', session.id);
    } catch (error) {
      console.error('Failed to save exercise session:', error);
      throw new Error('Failed to save session summary');
    }
  }

  /**
   * Get all exercise sessions
   */
  async getAllSessions(): Promise<ExerciseSessionSummary[]> {
    try {
      const sessionsData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!sessionsData) {
        return [];
      }
      
      const sessions = JSON.parse(sessionsData);
      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      }));
    } catch (error) {
      console.error('Failed to load exercise sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions for a specific exercise
   */
  async getSessionsForExercise(exerciseId: string): Promise<ExerciseSessionSummary[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(session => session.exerciseId === exerciseId);
  }

  /**
   * Get recent sessions (last N sessions)
   */
  async getRecentSessions(limit: number = 10): Promise<ExerciseSessionSummary[]> {
    const allSessions = await this.getAllSessions();
    return allSessions
      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
      .slice(0, limit);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const existingSessions = await this.getAllSessions();
      const updatedSessions = existingSessions.filter(session => session.id !== sessionId);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      console.log('Exercise session deleted:', sessionId);
    } catch (error) {
      console.error('Failed to delete exercise session:', error);
      throw new Error('Failed to delete session');
    }
  }

  /**
   * Clear all sessions
   */
  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('All exercise sessions cleared');
    } catch (error) {
      console.error('Failed to clear exercise sessions:', error);
      throw new Error('Failed to clear sessions');
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    totalDuration: number;
    averageDuration: number;
    exerciseBreakdown: Record<string, number>;
    averageScore: number;
  }> {
    const sessions = await this.getAllSessions();
    
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    const exerciseBreakdown: Record<string, number> = {};
    let totalScore = 0;
    let scoredSessions = 0;
    
    sessions.forEach(session => {
      exerciseBreakdown[session.exerciseId] = (exerciseBreakdown[session.exerciseId] || 0) + 1;
      
      if (session.score !== undefined) {
        totalScore += session.score;
        scoredSessions++;
      }
    });
    
    const averageScore = scoredSessions > 0 ? totalScore / scoredSessions : 0;
    
    return {
      totalSessions,
      totalDuration,
      averageDuration,
      exerciseBreakdown,
      averageScore,
    };
  }
}

// Export singleton instance
export const exerciseSessionStorage = new ExerciseSessionStorage();
export default exerciseSessionStorage;

