// Speech Analysis Types and API Integration
export interface SpeechAnalysis {
  summary: string;
  strengths: string[];
  opportunities: string[];
  accent_observations: string;
  pacing_observations: string;
  filler_words: string;
  clarity: string;
  confidence: string;
  content_structure: string;
  technical_depth: string;
  prioritized_tips: string[];
  gemini_analysis?: any; // Full Gemini analysis result for detailed view
  overall_score?: number; // Overall score from Gemini analysis
}

export interface AnalysisRequest {
  mode: 'general' | 'interview' | 'sales' | 'pitch';
  videoUri: string;
}

export interface AnalysisResponse {
  mode: string;
  analysis: SpeechAnalysis;
  timestamp: string;
  processingTime?: number;
}

// API Configuration - these would typically come from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-endpoint.com';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Model configurations matching the Python implementation
export const MODEL_CONFIGS = {
  general: {
    model: 'gemini-1.5-flash',
    systemInstruction: 
      'You are a world-class communication coach. Given a video of a speaker, ' +
      'analyze delivery and content. Return clear, structured, actionable feedback. ' +
      'Focus on: accent/intelligibility, pacing, filler words, clarity, prosody, confidence, ' +
      'structure, and practical suggestions to improve. If audio is poor, suggest fixes. ' +
      'Provide a concise summary plus a prioritized checklist of 5–10 improvements.',
    temperature: 0.4,
  },
  interview: {
    model: 'gemini-1.5-pro',
    systemInstruction:
      'You are a world-class interview coach. Analyze the candidate\'s answers and delivery. ' +
      'Emphasize STAR structure, question understanding, relevance, technical depth (if present), ' +
      'and behavioral signals (ownership, collaboration, impact, metrics). ' +
      'Call out filler words, pacing, clarity, and confidence. ' +
      'Provide targeted practice prompts and a prioritized checklist of 5–10 improvements.',
    temperature: 0.3,
  },
  sales: {
    model: 'gemini-1.5-flash',
    systemInstruction:
      'You are a world-class sales coach. Analyze a sales pitch or discovery call for ' +
      'rapport-building, needs discovery, objection handling, value articulation, storytelling, ' +
      'call control, next steps, and closing technique. ' +
      'Comment on energy, tone, clarity, and credibility. ' +
      'Suggest concrete phrasing upgrades, better questions, and a prioritized checklist of 5–10 improvements.',
    temperature: 0.6,
  },
  pitch: {
    model: 'gemini-1.5-pro',
    systemInstruction:
      'You are a world-class startup pitch coach. Analyze the pitch for clarity, narrative flow, ' +
      'problem framing, solution, demo quality, differentiation, traction, GTM, business model, ' +
      'market size, ask, and confidence. ' +
      'Flag jargon, pacing, and slide/verbal density issues. ' +
      'Suggest specific edits to the pitch narrative and a prioritized checklist of 5–10 improvements.',
    temperature: 0.35,
  },
};

/**
 * Analyzes a video recording using Google's Gemini AI
 * @param videoUri - Local URI of the video file
 * @param mode - Analysis mode (general, interview, sales, pitch)
 * @returns Promise<AnalysisResponse>
 */
export const analyzeSpeechVideo = async (
  videoUri: string, 
  mode: 'general' | 'interview' | 'sales' | 'pitch' = 'general'
): Promise<AnalysisResponse> => {
  const startTime = Date.now();

  try {
    // Validate API key
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API key is not configured');
    }

    // Create form data for multipart upload
    const formData = new FormData();
    
    // Add the video file
    const videoFile = {
      uri: videoUri,
      type: 'video/mp4',
      name: 'recording.mp4',
    } as any;
    
    formData.append('video', videoFile);
    formData.append('mode', mode);

    // Make the API request
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${GOOGLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      mode: result.mode || mode,
      analysis: result.analysis,
      timestamp: new Date().toISOString(),
      processingTime,
    };

  } catch (error) {
    console.error('Speech analysis error:', error);
    throw new Error(`Failed to analyze speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Alternative implementation using Google Generative AI SDK directly
 * This would require installing @google/generative-ai package
 */
export const analyzeSpeechVideoDirect = async (
  videoUri: string, 
  mode: 'general' | 'interview' | 'sales' | 'pitch' = 'general'
): Promise<AnalysisResponse> => {
  // This implementation would require the @google/generative-ai package
  // and direct file upload capabilities in React Native
  throw new Error('Direct Google AI integration not yet implemented for React Native');
};

/**
 * Mock analysis for testing purposes
 */
export const mockAnalyzeSpeechVideo = async (
  videoUri: string,
  mode: 'general' | 'interview' | 'sales' | 'pitch' = 'general'
): Promise<AnalysisResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mockAnalysis: SpeechAnalysis = {
    summary: "Overall, this is a strong practice session with clear communication and good energy. The speaker demonstrates confidence and maintains good eye contact throughout the recording.",
    strengths: [
      "Clear articulation and pronunciation",
      "Good eye contact with the camera",
      "Confident posture and presence",
      "Well-structured response to the prompt"
    ],
    opportunities: [
      "Reduce use of filler words like 'um' and 'uh'",
      "Slow down slightly for better clarity",
      "Add more specific examples to support points",
      "Work on smoother transitions between ideas"
    ],
    accent_observations: "Neutral accent with clear pronunciation. Occasional rushed syllables but generally very intelligible.",
    pacing_observations: "Speaking pace is slightly fast, averaging 160-180 words per minute. Consider slowing to 140-160 WPM for better clarity.",
    filler_words: "Moderate use of filler words (3-4 instances of 'um', 2 instances of 'uh'). Focus on pausing instead of filling silence.",
    clarity: "Speech is generally clear with good volume. Occasional mumbling during transitions between thoughts.",
    confidence: "Demonstrates strong confidence through posture, eye contact, and vocal tone. Minimal signs of nervousness.",
    content_structure: "Well-organized response with clear beginning, middle, and end. Could benefit from stronger topic sentences.",
    technical_depth: "Good use of specific examples and details. Could elaborate more on key points for greater impact.",
    prioritized_tips: [
      "Practice speaking 10-15% slower for better clarity",
      "Replace filler words with strategic pauses",
      "Add more specific metrics or examples to support your points",
      "Work on smoother transitions between main ideas",
      "Consider using the STAR method for structured responses"
    ]
  };

  return {
    mode,
    analysis: mockAnalysis,
    timestamp: new Date().toISOString(),
    processingTime: 2000,
  };
};

/**
 * Saves analysis results to the recording metadata
 * This integrates with the existing recording storage system
 */
export const saveAnalysisToRecording = async (
  recordingId: string,
  analysis: AnalysisResponse
): Promise<void> => {
  const { saveAnalysisToRecording: saveToStorage } = await import('./recordingUtils');
  return saveToStorage(recordingId, analysis);
};

/**
 * Gets analysis results for a specific recording
 */
export const getAnalysisForRecording = async (
  recordingId: string
): Promise<AnalysisResponse | null> => {
  const { getAnalysisForRecording: getFromStorage } = await import('./recordingUtils');
  return getFromStorage(recordingId);
};

/**
 * Analyzes video using Gemini API directly
 * This is the new implementation that uses the Gemini service
 */
export const analyzeVideoWithGemini = async (
  videoUri: string,
  recordingId: string,
  mode: 'general' | 'interview' | 'sales' | 'pitch' = 'general'
): Promise<AnalysisResponse> => {
  const startTime = Date.now();
  
  try {
    // Import the Gemini service
    const { analyzeVideoWithGeminiAPI, convertGeminiToSpeechAnalysis } = await import('./geminiService');
    
    console.log('Starting Gemini video analysis...');
    console.log('Video URI:', videoUri);
    console.log('Recording ID:', recordingId);
    console.log('Mode:', mode);
    
    // Analyze video with Gemini
    const geminiResult = await analyzeVideoWithGeminiAPI(videoUri, recordingId);
    
    // Convert to SpeechAnalysis format
    const speechAnalysis = convertGeminiToSpeechAnalysis(geminiResult);
    
    const processingTime = Date.now() - startTime;
    
    return {
      mode,
      analysis: speechAnalysis,
      timestamp: new Date().toISOString(),
      processingTime,
    };
    
  } catch (error) {
    console.error('Gemini video analysis error:', error);
    throw new Error(`Failed to analyze video with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};