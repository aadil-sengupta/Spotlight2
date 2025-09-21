import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { AnalysisResponse, SpeechAnalysis } from './speechAnalysis';

// Interface for recording metadata
export interface RecordingMetadata {
  id: string;
  fileName: string;
  localUri: string;
  photoLibraryUri?: string;
  thumbnailUri?: string;
  timestamp: string;
  duration?: number;
  promptText: string;
  facing: CameraType;
  createdAt: Date;
  recordedDate: string;
  fileSize?: number;
  observations?: string;
  // AI Analysis fields
  aiAnalysis?: SpeechAnalysis;
  analysisStatus?: 'pending' | 'completed' | 'failed' | 'not_requested';
  analysisMode?: 'general' | 'interview' | 'sales' | 'pitch';
}

// Constants for AsyncStorage
export const RECORDINGS_STORAGE_KEY = 'spotlight_recordings';

// Helper functions for managing recording metadata
export const saveRecordingMetadata = async (metadata: RecordingMetadata): Promise<void> => {
  try {
    const existingRecordings = await getRecordingMetadata();
    const updatedRecordings = [...existingRecordings, metadata];
    await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
    console.log('Recording metadata saved:', metadata.id);
  } catch (error) {
    console.error('Error saving recording metadata:', error);
  }
};

export const getRecordingMetadata = async (): Promise<RecordingMetadata[]> => {
  try {
    const recordings = await AsyncStorage.getItem(RECORDINGS_STORAGE_KEY);
    return recordings ? JSON.parse(recordings) : [];
  } catch (error) {
    console.error('Error retrieving recording metadata:', error);
    return [];
  }
};

export const deleteRecordingMetadata = async (recordingId: string): Promise<void> => {
  try {
    const existingRecordings = await getRecordingMetadata();
    const filteredRecordings = existingRecordings.filter(recording => recording.id !== recordingId);
    await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(filteredRecordings));
    console.log('Recording metadata deleted:', recordingId);
  } catch (error) {
    console.error('Error deleting recording metadata:', error);
  }
};

export const clearAllRecordingMetadata = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RECORDINGS_STORAGE_KEY);
    console.log('All recording metadata cleared');
  } catch (error) {
    console.error('Error clearing recording metadata:', error);
  }
};

export const exportRecordingMetadata = async (): Promise<RecordingMetadata[] | null> => {
  try {
    const recordings = await getRecordingMetadata();
    console.log('Exported recording metadata:', recordings);
    return recordings;
  } catch (error) {
    console.error('Error exporting recording metadata:', error);
    return null;
  }
};

export const generateRecordingId = (): string => {
  return `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate thumbnail for video
export const generateVideoThumbnail = async (videoUri: string, recordingId: string): Promise<string | undefined> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // 1 second into the video
      quality: 0.8,
    });
    
    // Save thumbnail to app's document directory
    const documentDirectory = FileSystem.documentDirectory;
    const thumbnailFileName = `thumbnail_${recordingId}.jpg`;
    const thumbnailLocalUri = `${documentDirectory}${thumbnailFileName}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: thumbnailLocalUri,
    });
    
    console.log('Thumbnail generated:', thumbnailLocalUri);
    return thumbnailLocalUri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return undefined;
  }
};

// Get video duration using expo-av
export const getVideoDuration = async (videoUri: string): Promise<number | undefined> => {
  try {
    const { sound, status } = await Audio.Sound.createAsync(
      { uri: videoUri },
      { shouldPlay: false }
    );
    
    if (status.isLoaded && status.durationMillis) {
      const durationSeconds = Math.round(status.durationMillis / 1000);
      await sound.unloadAsync();
      return durationSeconds;
    }
    
    await sound.unloadAsync();
    return undefined;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return undefined;
  }
};

// Helper function to format duration in seconds to human-readable format
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
};

// Get recording statistics
export const getRecordingStatistics = async () => {
  try {
    const recordings = await getRecordingMetadata();
    const totalRecordings = recordings.length;
    const totalSize = recordings.reduce((sum, recording) => sum + (recording.fileSize || 0), 0);
    const averageSize = totalRecordings > 0 ? totalSize / totalRecordings : 0;
    const totalDuration = recordings.reduce((sum, recording) => sum + (recording.duration || 0), 0);
    const averageDuration = totalRecordings > 0 ? totalDuration / totalRecordings : 0;
    
    // Group by date
    const recordingsByDate: { [date: string]: number } = {};
    recordings.forEach(recording => {
      const date = recording.recordedDate;
      recordingsByDate[date] = (recordingsByDate[date] || 0) + 1;
    });
    
    return {
      totalRecordings,
      totalSize,
      averageSize,
      totalDuration,
      averageDuration,
      recordingsByDate,
      mostRecentRecording: recordings.length > 0 ? recordings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0] : null
    };
  } catch (error) {
    console.error('Error calculating recording statistics:', error);
    return {
      totalRecordings: 0,
      totalSize: 0,
      averageSize: 0,
      totalDuration: 0,
      averageDuration: 0,
      recordingsByDate: {},
      mostRecentRecording: null
    };
  }
};

// Function to update observations for a specific recording
export const updateRecordingObservations = async (recordingId: string, observations: string): Promise<void> => {
  try {
    const existingRecordings = await getRecordingMetadata();
    const updatedRecordings = existingRecordings.map(recording => 
      recording.id === recordingId 
        ? { ...recording, observations }
        : recording
    );
    await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
    console.log('Recording observations updated for:', recordingId);
  } catch (error) {
    console.error('Error updating recording observations:', error);
  }
};

// AI Analysis utility functions
export const updateRecordingAnalysisStatus = async (
  recordingId: string, 
  status: 'pending' | 'completed' | 'failed' | 'not_requested',
  mode?: 'general' | 'interview' | 'sales' | 'pitch'
): Promise<void> => {
  try {
    const existingRecordings = await getRecordingMetadata();
    const updatedRecordings = existingRecordings.map(recording => 
      recording.id === recordingId 
        ? { 
            ...recording, 
            analysisStatus: status,
            ...(mode && { analysisMode: mode })
          }
        : recording
    );
    await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
    console.log('Recording analysis status updated for:', recordingId, 'Status:', status);
  } catch (error) {
    console.error('Error updating recording analysis status:', error);
  }
};

export const saveAnalysisToRecording = async (
  recordingId: string,
  analysis: AnalysisResponse
): Promise<void> => {
  try {
    const existingRecordings = await getRecordingMetadata();
    const updatedRecordings = existingRecordings.map(recording => 
      recording.id === recordingId 
        ? { 
            ...recording, 
            aiAnalysis: analysis,
            analysisStatus: 'completed' as const
          }
        : recording
    );
    await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
    console.log('AI analysis saved for recording:', recordingId);
  } catch (error) {
    console.error('Error saving AI analysis:', error);
    throw error;
  }
};

export const getRecordingById = async (recordingId: string): Promise<RecordingMetadata | null> => {
  try {
    const recordings = await getRecordingMetadata();
    return recordings.find(recording => recording.id === recordingId) || null;
  } catch (error) {
    console.error('Error getting recording by ID:', error);
    return null;
  }
};

export const getAnalysisForRecording = async (recordingId: string): Promise<AnalysisResponse | null> => {
  try {
    const recording = await getRecordingById(recordingId);
    return recording?.aiAnalysis || null;
  } catch (error) {
    console.error('Error getting analysis for recording:', error);
    return null;
  }
};
