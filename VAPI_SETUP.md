# VAPI Voice Coaching Setup Guide

## 🎯 Overview
This guide will help you set up VAPI voice coaching integration in your SpeechCoach app.

## 📋 Prerequisites
- VAPI account and API keys
- Expo development environment
- iOS/Android device or simulator

## 🔧 Setup Steps

### 1. Get VAPI Credentials
1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys**
4. Copy your **Public Key** (starts with `pk_`)

### 2. Configure Environment Variables
Add your VAPI public key to your environment:

```bash
# Create or update your .env file
EXPO_PUBLIC_VAPI_PUBLIC_KEY=pk_your_vapi_public_key_here
```

### 3. Assistant Configuration
The speech coaching assistant is already configured with:
- **Assistant ID**: `6e9736f2-7d18-4c0e-82fb-aa28cc81f2e2`
- **Model**: OpenAI GPT-4o
- **Voice**: 11labs Sarah (warm, professional)
- **Transcription**: Deepgram Nova-3

### 4. Test the Integration
1. Start the development server:
   ```bash
   npm start
   ```

2. Navigate to any speech analysis result
3. Click "Start Voice Coaching" button
4. Grant microphone permissions when prompted
5. Begin your voice coaching session!

## 🎤 How Voice Coaching Works

### Session Flow
1. **Analysis Integration**: Your speech analysis data is automatically loaded
2. **Personalized Coaching**: AI coach reviews your scores and provides targeted feedback
3. **Interactive Practice**: Real-time voice conversation with immediate coaching tips
4. **Progress Tracking**: Session history and key takeaways are maintained

### Key Features
- **Real-time Voice Interaction**: Natural conversation with AI coach
- **Personalized Feedback**: Based on your specific speech analysis results
- **Practice Exercises**: Targeted exercises for your areas of improvement
- **Session Management**: Start/stop sessions with visual feedback
- **Beautiful UI**: Modern design with animations and status indicators

## 🔍 Troubleshooting

### Common Issues

#### 1. "Unable to resolve" errors for Daily.co dependencies
**Solution**: Install all required VAPI dependencies:
```bash
npm install @vapi-ai/react-native --legacy-peer-deps
npm install @daily-co/react-native-daily-js --legacy-peer-deps
npm install @daily-co/react-native-webrtc@118.0.3-daily.4 --legacy-peer-deps
npm install react-native-background-timer@^2.4.1 --legacy-peer-deps
npm install react-native-permissions --legacy-peer-deps
npm install react-native-get-random-values --legacy-peer-deps
```

**Or use the installation script:**
```bash
chmod +x scripts/install-vapi-deps.sh
./scripts/install-vapi-deps.sh
```

#### 2. "VAPI is not initialized"
**Solution**: Check your environment variable:
```bash
echo $EXPO_PUBLIC_VAPI_PUBLIC_KEY
```

#### 3. Microphone Permission Denied
**Solution**: 
- iOS: Go to Settings → Privacy → Microphone → SpeechCoach → Allow
- Android: Go to Settings → Apps → SpeechCoach → Permissions → Microphone → Allow

#### 4. Assistant Not Responding
**Solution**: 
- Verify your VAPI public key is correct
- Check your internet connection
- Ensure the assistant ID is correct: `6e9736f2-7d18-4c0e-82fb-aa28cc81f2e2`

## 📱 Usage Instructions

### Starting a Voice Coaching Session
1. **From Analysis Page**: 
   - Complete a speech recording and analysis
   - Click "Start Voice Coaching" button
   - Your analysis data will be automatically loaded

2. **Direct Access**:
   - Navigate to `/voice-coach` route
   - Click "Start Coaching Session" button
   - Begin with general coaching (no analysis data)

### During the Session
- **Speak Naturally**: The AI coach will listen and respond
- **Ask Questions**: "How can I improve my clarity?"
- **Request Feedback**: "What did you think of my pacing?"
- **Practice Exercises**: Follow the coach's suggested exercises

### Ending the Session
- Click "End Session" button
- Review conversation history
- Note key takeaways and next steps

## 🎯 Coaching Areas Covered

The AI coach focuses on these key areas from your analysis:

### Voice & Sound
- Pitch/Tone variation
- Volume and projection
- Tempo and pacing
- Clarity and articulation
- Strategic pausing
- Prosody and intonation

### Communication Style
- Word choice and vocabulary
- Sentence structure
- Conversational flow
- Confidence and authority
- Warmth and charisma

### Practice Exercises
- Breathing techniques
- Articulation drills
- Pacing exercises
- Confidence building
- Storytelling practice

## 🔄 Integration Points

### With Speech Analysis
- Automatically converts analysis data to coaching format
- Uses scores, strengths, and opportunities for personalized feedback
- Maintains context throughout coaching sessions

### With Recording System
- Seamlessly integrates with existing recording workflow
- Preserves analysis data for future coaching sessions
- Links coaching sessions to specific recordings

## 📊 Data Flow

```
Speech Recording → AI Analysis → Voice Coaching Session
     ↓                ↓                    ↓
  Video File    Analysis Results    Personalized Coaching
     ↓                ↓                    ↓
  Storage        Score Breakdown    Real-time Feedback
```

## 🚀 Next Steps

1. **Test the Integration**: Try starting a voice coaching session
2. **Customize Prompts**: Modify assistant instructions if needed
3. **Add Features**: Consider adding session recording or progress tracking
4. **Optimize Performance**: Monitor session quality and user feedback

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your VAPI credentials
3. Ensure all dependencies are properly installed
4. Check the console for error messages

---

**Ready to start coaching?** Add your VAPI public key and begin your personalized speech coaching journey! 🎤✨
