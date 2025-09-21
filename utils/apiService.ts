/**
 * API Service for SpeechCoach
 * Handles communication with backend services for AI analysis
 */

import { AnalysisResponse } from './speechAnalysis';

// Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 60000; // 60 seconds timeout for AI processing

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * Creates an API error with additional context
 */
const createApiError = (message: string, status?: number, code?: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
};

/**
 * Uploads a video file for AI analysis
 * @param videoUri - Local URI of the video file
 * @param mode - Analysis mode
 * @returns Promise<AnalysisResponse>
 */
export const uploadVideoForAnalysis = async (
  videoUri: string,
  mode: 'general' | 'interview' | 'sales' | 'pitch' = 'general'
): Promise<AnalysisResponse> => {
  try {
    console.log('Starting video analysis upload...');
    console.log('Video URI:', videoUri);
    console.log('Analysis mode:', mode);

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add the video file
    const videoFile = {
      uri: videoUri,
      type: 'video/mp4',
      name: `recording_${Date.now()}.mp4`,
    } as any;
    
    formData.append('video', videoFile);
    formData.append('mode', mode);

    // Create request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 429) {
        throw createApiError('Analysis service is temporarily overloaded. Please try again in a few minutes.', 429, 'RATE_LIMIT');
      } else if (response.status >= 500) {
        throw createApiError('Analysis service is temporarily unavailable. Please try again later.', response.status, 'SERVER_ERROR');
      } else {
        throw createApiError(errorMessage, response.status, 'API_ERROR');
      }
    }

    const result = await response.json();
    
    if (!result.analysis) {
      throw createApiError('Invalid response from analysis service', 502, 'INVALID_RESPONSE');
    }

    console.log('Analysis completed successfully');
    return {
      mode: result.mode || mode,
      analysis: result.analysis,
      timestamp: new Date().toISOString(),
      processingTime: result.processingTime,
    };

  } catch (error) {
    console.error('Video analysis upload error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createApiError('Analysis request timed out. Please try again with a shorter video.', 408, 'TIMEOUT');
    }
    
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw createApiError('Unable to connect to analysis service. Please check your internet connection.', 0, 'NETWORK_ERROR');
    }

    // Re-throw ApiError instances as-is
    if ((error as ApiError).status !== undefined) {
      throw error;
    }

    // Wrap other errors
    throw createApiError(
      error instanceof Error ? error.message : 'Unknown error occurred during analysis',
      500,
      'UNKNOWN_ERROR'
    );
  }
};

/**
 * Checks if the API service is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

/**
 * Get API configuration and limits
 */
export const getApiConfig = async (): Promise<{
  maxFileSize: number;
  maxDuration: number;
  supportedFormats: string[];
  availableModes: string[];
} | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.warn('Failed to get API config:', error);
    return null;
  }
};
