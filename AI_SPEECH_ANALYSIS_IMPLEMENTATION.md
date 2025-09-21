# AI Speech Analysis Implementation

This document outlines the AI speech analysis functionality that has been integrated into the SpeechCoach React Native application.

## Overview

The application now supports AI-powered speech analysis using Google's Gemini AI model. When users record a practice session, they can request AI analysis of their speech with different modes tailored for specific use cases.

## Implementation Components

### 1. Speech Analysis Types (`utils/speechAnalysis.ts`)

**Key Interfaces:**
- `SpeechAnalysis`: Contains detailed analysis results including summary, strengths, opportunities, pacing observations, etc.
- `AnalysisResponse`: Wraps the analysis with metadata like timestamp and processing time
- `AnalysisRequest`: Defines the request structure with mode and video URI

**Analysis Modes:**
- **General**: Overall communication coaching
- **Interview**: Interview practice with STAR methodology focus
- **Sales**: Sales presentation and discovery call analysis
- **Pitch**: Startup pitch analysis with business model focus

**Functions:**
- `analyzeSpeechVideo()`: Main function for real API analysis
- `mockAnalyzeSpeechVideo()`: Mock implementation for testing
- `saveAnalysisToRecording()`: Saves analysis results to recording metadata
- `getAnalysisForRecording()`: Retrieves analysis results for a recording

### 2. API Service (`utils/apiService.ts`)

**Key Functions:**
- `uploadVideoForAnalysis()`: Uploads video file to backend for AI analysis
- `checkApiHealth()`: Checks if the API service is available
- `getApiConfig()`: Retrieves API configuration and limits

**Error Handling:**
- Network connectivity errors
- Rate limiting (429 responses)
- Server errors (5xx responses)
- Timeout handling (60-second timeout)
- Graceful fallback to mock analysis

### 3. Enhanced Recording Metadata (`utils/recordingUtils.ts`)

**New Fields Added to `RecordingMetadata`:**
- `aiAnalysis?: AnalysisResponse`: Stores AI analysis results
- `analysisStatus?: 'pending' | 'completed' | 'failed' | 'not_requested'`: Tracks analysis state
- `analysisMode?: 'general' | 'interview' | 'sales' | 'pitch'`: Stores selected analysis mode

**New Utility Functions:**
- `updateRecordingAnalysisStatus()`: Updates analysis status
- `saveAnalysisToRecording()`: Saves analysis results to recording
- `getRecordingById()`: Retrieves specific recording by ID
- `getAnalysisForRecording()`: Gets analysis results for a recording

### 4. Camera Practice Integration (`app/camera-practice.tsx`)

**New Functions:**
- `requestAIAnalysis()`: Main function that handles the AI analysis workflow
- `showAnalysisModeSelector()`: Shows dialog for users to select analysis type

**Updated Workflow:**
1. User records a video
2. Video is saved with `analysisStatus: 'not_requested'`
3. User is automatically taken to the analysis screen
4. From the analysis screen, they can request AI analysis or review manually

**Analysis Process:**
1. User selects analysis mode (General, Interview, Sales, or Startup Pitch)
2. Status is updated to 'pending'
3. API call is made (with fallback to mock analysis)
4. Results are saved to recording metadata
5. Status is updated to 'completed' or 'failed'
6. User can view results immediately or later from Dashboard

## Configuration

### Environment Variables
```bash
EXPO_PUBLIC_API_URL=https://your-backend-api.com
EXPO_PUBLIC_GOOGLE_API_KEY=your_google_api_key
```

### Backend API Endpoint
The implementation expects a backend API endpoint at `/api/analyze` that:
- Accepts multipart/form-data with 'video' file and 'mode' string
- Returns JSON with analysis results
- Handles file uploads up to reasonable size limits
- Implements the same analysis modes as the Python code provided

## Mock Analysis

For development and testing, the app includes a comprehensive mock analysis that:
- Simulates realistic AI analysis results
- Includes all required fields (summary, strengths, opportunities, etc.)
- Provides actionable feedback similar to what the real AI would generate
- Has a 2-second delay to simulate API processing time

## Error Handling

The implementation includes robust error handling for:
- Network connectivity issues
- API rate limiting
- Server errors
- Timeout scenarios
- Invalid responses
- File upload failures

## Integration with Existing Features

The AI analysis integrates seamlessly with existing features:
- **Dashboard**: Will show analysis status and results
- **Analysis Screen**: Can display AI analysis alongside manual observations
- **Recording Management**: Analysis results are stored with recording metadata
- **Export Functionality**: AI analysis results are included in metadata exports

## Future Enhancements

1. **Real-time Analysis**: Stream analysis during recording
2. **Comparative Analysis**: Compare multiple recordings
3. **Progress Tracking**: Track improvement over time using AI metrics
4. **Custom Prompts**: Allow users to define custom analysis criteria
5. **Voice-only Analysis**: Support audio-only recordings
6. **Batch Analysis**: Analyze multiple recordings simultaneously

## Usage Example

```typescript
// After recording a video
const analysisResult = await requestAIAnalysis(recordingId, videoUri, 'interview');

// The result will be automatically saved to the recording metadata
// and can be retrieved later:
const savedAnalysis = await getAnalysisForRecording(recordingId);
```

## Testing

The mock analysis can be used for testing the complete workflow without requiring a backend API. Simply ensure the API call fails (e.g., by using an invalid API URL) and the app will automatically fall back to mock analysis.

This implementation provides a solid foundation for AI-powered speech coaching while maintaining flexibility for future enhancements and easy integration with various AI services.

## Recent Updates (August 2025)

### Streamlined User Experience
- **Direct Navigation**: Users are now automatically taken to the analysis screen after recording, eliminating decision fatigue
- **Rebranded Interface**: Changed from "Self-Analysis" to "Analysis" throughout the app for cleaner branding
- **Removed "Coming Soon" Messaging**: Cleaned up the interface by removing outdated "AI analysis coming soon" banners
- **Simplified Workflow**: The analysis screen now serves as the central hub where users can choose between manual review or AI analysis

### File Changes Made
- `app/self-analysis.tsx` → `app/analysis.tsx` (renamed)
- Updated `app/_layout.tsx` to reference the new route name
- Updated all navigation references in `app/camera-practice.tsx`
- Updated `components/VideoPlayerModal.tsx` button text
- Removed "coming soon" sections and rebranded all "self-analysis" text to "analysis"
