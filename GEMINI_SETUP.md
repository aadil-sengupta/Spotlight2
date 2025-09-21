# Gemini Video Analysis Setup

This document explains how to set up Gemini video analysis for the SpeechCoach app.

## Overview

The app now includes direct integration with Google's Gemini API for comprehensive video analysis. When a video is recorded and compressed, it's automatically uploaded to Gemini for analysis using the same comprehensive system prompt from the Python implementation.

## Configuration

### 1. Environment Variables

Create a `.env` file in the project root with the following content:

```bash
# Gemini API Configuration
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Backend API Configuration (optional)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Development Configuration
EXPO_PUBLIC_DEBUG_MODE=false
```

### 2. Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your `.env` file

### 3. Configuration File

The app uses a centralized configuration file at `config/environment.ts` that:
- Validates the API key configuration
- Provides fallback values
- Logs configuration status in debug mode

## How It Works

### Video Analysis Flow

1. **Video Recording**: User records a 30-second practice video
2. **Video Compression**: Video is processed for optimal storage
3. **Automatic Upload**: Video is automatically uploaded to Gemini API
4. **Polling**: App polls Gemini until the file becomes "ACTIVE"
5. **Analysis**: Gemini analyzes the video using the comprehensive system prompt
6. **Results Storage**: Analysis results are stored locally alongside the video
7. **Navigation**: User is automatically taken to the analysis view

### Analysis Features

The Gemini analysis provides:

- **Voice & Sound Qualities**: Pitch, volume, tempo, clarity, pausing, prosody
- **Word Choice & Vocabulary**: Formality, complexity, repetition, directness, emotional tone
- **Sentence Structure**: Length, narrative style, questions, metaphors
- **Conversational Style**: Turn-taking, responsiveness, politeness, assertiveness, humor
- **Non-verbal Cues**: Laughter, gestures, facial expressions (when video is available)
- **Overall Impression**: Warmth, authority, charisma, consistency
- **Disfluency Analysis**: Detailed filler word and repeated phrase analysis

### Fallback Strategy

The app implements a robust fallback strategy:

1. **Primary**: Gemini API analysis
2. **Secondary**: Backend API analysis (if configured)
3. **Tertiary**: Mock analysis for testing

## API Integration Details

### Upload Process

```typescript
// Video is uploaded to Gemini using multipart form data
const formData = new FormData();
formData.append('file', videoFile);
```

### Polling Mechanism

```typescript
// App polls Gemini until file becomes ACTIVE
const pollUntilActive = async (fileName: string) => {
  // Exponential backoff polling with 180-second timeout
};
```

### Analysis Request

```typescript
// Comprehensive system prompt with structured JSON response
const payload = {
  systemInstruction: { /* comprehensive prompt */ },
  contents: [{ file_data: { file_uri } }],
  generationConfig: { /* JSON schema */ }
};
```

## Error Handling

The implementation includes comprehensive error handling for:

- Missing API key configuration
- Network connectivity issues
- Upload failures
- Polling timeouts
- Analysis failures
- JSON parsing errors

## Development

### Debug Mode

Enable debug mode to see detailed logging:

```bash
EXPO_PUBLIC_DEBUG_MODE=true
```

### Mock Analysis

For testing without API calls:

```bash
EXPO_PUBLIC_MOCK_ANALYSIS=true
```

## Security Notes

- API keys are stored in environment variables
- Video files are temporarily uploaded to Gemini (Google's servers)
- No video data is permanently stored on external servers
- All analysis results are stored locally on the device

## Troubleshooting

### Common Issues

1. **"Missing GEMINI_API_KEY configuration"**
   - Ensure your `.env` file is in the project root
   - Verify the API key is correctly set
   - Check that the key is valid and has proper permissions

2. **"Upload failed"**
   - Check internet connectivity
   - Verify API key permissions
   - Ensure video file exists and is accessible

3. **"File processing failed"**
   - Video format may not be supported
   - File size may be too large
   - Try with a shorter video

4. **"Analysis request failed"**
   - API quota may be exceeded
   - Check Gemini API status
   - Verify API key is active

### Logs

Check the console logs for detailed error information. The app provides comprehensive logging for debugging issues.

## Performance

- Video upload typically takes 5-15 seconds
- Analysis processing takes 30-60 seconds
- Total time from recording to results: 1-2 minutes
- Results are cached locally for instant access

## Future Enhancements

- Batch analysis for multiple videos
- Custom analysis modes
- Real-time analysis during recording
- Integration with other AI services
- Advanced analytics and reporting
