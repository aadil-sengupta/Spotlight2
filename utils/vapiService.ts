/**
 * VAPI Service for Speech Coach
 * Handles voice agent interactions and speech coaching sessions
 */

import { VAPI_CONFIG } from '@/config/environment';
import Vapi from '@vapi-ai/react-native';

export interface SpeechCoachSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  analysisData?: any;
  conversationHistory?: string[];
  exerciseId?: string;
  exerciseTitle?: string;
}

export interface CoachReport {
  summary: string;
  strengths: string[];
  opportunities: string[];
  overallScore: number;
  detailedAnalysis?: any;
}

class VapiService {
  private vapi: Vapi | null = null;
  private currentSession: SpeechCoachSession | null = null;

  constructor() {
    this.initializeVapi();
  }

  private initializeVapi() {
    try {
      if (!VAPI_CONFIG.PUBLIC_KEY) {
        throw new Error('VAPI public key is not configured');
      }

      this.vapi = new Vapi(VAPI_CONFIG.PUBLIC_KEY);
      console.log('VAPI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
    }
  }

  /**
   * Start a speech coaching session
   * @param coachReport - Optional analysis data to inject into the conversation
   * @param exerciseId - Optional exercise ID to use specific assistant
   * @returns Promise<SpeechCoachSession>
   */
  async startCoachingSession(coachReport?: CoachReport, exerciseId?: string): Promise<SpeechCoachSession> {
    if (!this.vapi) {
      throw new Error('VAPI is not initialized');
    }

    try {
      const sessionId = `session_${Date.now()}`;
      this.currentSession = {
        id: sessionId,
        startTime: new Date(),
        analysisData: coachReport,
      };

      // Prepare variable values for the assistant
      const variableValues: any = {};
      
      if (coachReport) {
        variableValues.coachReport = JSON.stringify(coachReport);
        variableValues.summary = coachReport.summary;
        variableValues.strengths = coachReport.strengths.join(', ');
        variableValues.opportunities = coachReport.opportunities.join(', ');
        variableValues.overallScore = coachReport.overallScore.toString();
      }

      // Determine which assistant to use
      let assistantId = VAPI_CONFIG.ASSISTANT_ID; // Default assistant
      if (exerciseId && VAPI_CONFIG.EXERCISE_ASSISTANTS[exerciseId as keyof typeof VAPI_CONFIG.EXERCISE_ASSISTANTS]) {
        assistantId = VAPI_CONFIG.EXERCISE_ASSISTANTS[exerciseId as keyof typeof VAPI_CONFIG.EXERCISE_ASSISTANTS];
        console.log(`Using exercise-specific assistant for ${exerciseId}:`, assistantId);
      }

      // Start the call with the appropriate assistant
      await this.vapi.start(assistantId, {
        variableValues,
      });

      console.log('Speech coaching session started:', sessionId);
      return this.currentSession;

    } catch (error) {
      console.error('Failed to start coaching session:', error);
      throw new Error(`Failed to start coaching session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * End the current coaching session
   */
  async endCoachingSession(): Promise<ExerciseSessionSummary | null> {
    if (!this.vapi || !this.currentSession) {
      return null;
    }

    try {
      await this.vapi.stop();
      
      if (this.currentSession) {
        this.currentSession.endTime = new Date();
        console.log('Speech coaching session ended:', this.currentSession.id);

        // Save session summary if it's an exercise session
        if (this.currentSession.exerciseId && this.currentSession.exerciseTitle) {
          const duration = Math.floor(
            (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000
          );

          const sessionSummary: ExerciseSessionSummary = {
            id: this.currentSession.id,
            exerciseId: this.currentSession.exerciseId,
            exerciseTitle: this.currentSession.exerciseTitle,
            startTime: this.currentSession.startTime,
            endTime: this.currentSession.endTime,
            duration,
            conversationSummary: 'Practice session completed successfully',
            feedback: 'Keep practicing to improve your skills!',
            improvements: ['Continue regular practice', 'Focus on clarity and pacing'],
            nextSteps: ['Try the next difficulty level', 'Practice daily for best results'],
          };

          await exerciseSessionStorage.saveSession(sessionSummary);
          console.log('Exercise session summary saved:', sessionSummary.id);
          
          this.currentSession = null;
          return sessionSummary;
        }
      }
      
      this.currentSession = null;
      return null;
    } catch (error) {
      console.error('Failed to end coaching session:', error);
      this.currentSession = null;
      return null;
    }
  }

  /**
   * Check if a coaching session is currently active
   */
  isSessionActive(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Get the current session
   */
  getCurrentSession(): SpeechCoachSession | null {
    return this.currentSession;
  }

  /**
   * Convert speech analysis data to coach report format
   */
  convertAnalysisToCoachReport(analysis: any): CoachReport {
    // Handle both Gemini analysis and fallback analysis formats
    if (analysis.gemini_analysis) {
      const gemini = analysis.gemini_analysis;
      return {
        summary: gemini.summary || analysis.summary || 'Speech analysis completed',
        strengths: gemini.strengths || analysis.strengths || [],
        opportunities: gemini.opportunities || analysis.opportunities || [],
        overallScore: gemini.scores?.overall_impression?.overall_score || analysis.overall_score || 0,
        detailedAnalysis: gemini,
      };
    }

    // Fallback format
    return {
      summary: analysis.summary || 'Speech analysis completed',
      strengths: analysis.strengths || [],
      opportunities: analysis.opportunities || [],
      overallScore: analysis.overall_score || 0,
      detailedAnalysis: analysis,
    };
  }

  /**
   * Start coaching session with analysis data from a recording
   */
  async startCoachingWithAnalysis(recordingId: string, analysis: any): Promise<SpeechCoachSession> {
    const coachReport = this.convertAnalysisToCoachReport(analysis);
    return this.startCoachingSession(coachReport);
  }

  /**
   * Start an exercise-specific coaching session
   */
  async startExerciseSession(exerciseId: string, exerciseTitle: string): Promise<SpeechCoachSession> {
    const coachReport = {
      summary: `Starting ${exerciseTitle} exercise session`,
      strengths: [],
      opportunities: [],
      overallScore: 0,
    };
    
    const session = await this.startCoachingSession(coachReport, exerciseId);
    
    // Add exercise context to the session
    if (this.currentSession) {
      this.currentSession.exerciseId = exerciseId;
      this.currentSession.exerciseTitle = exerciseTitle;
    }
    
    return session;
  }

  /**
   * Get VAPI instance (for advanced usage)
   */
  getVapiInstance(): Vapi | null {
    return this.vapi;
  }
}

// Export singleton instance
export const vapiService = new VapiService();
export default vapiService;



