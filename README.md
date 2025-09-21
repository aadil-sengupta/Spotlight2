# SpotLight - AI-Powered Speech Coaching App

**SpotLight** is a comprehensive React Native mobile application designed to help users improve their speaking skills through AI-powered video analysis and personalized voice coaching. Built with Expo and TypeScript, it provides a complete speech practice and improvement ecosystem.

## 🎯 What is SpotLight?

SpotLight is your personal speech coach that combines video recording, AI analysis, and real-time voice coaching to help you become a more confident and effective speaker. Whether you're preparing for interviews, presentations, sales pitches, or just want to improve your general communication skills, SpotLight provides personalized feedback and guidance.

## ✨ Key Features

### 📹 Video Recording & Practice
- **30-second practice sessions** with rotating speaking prompts
- **Front/back camera support** with automatic video compression
- **Real-time recording indicators** and intuitive camera controls
- **Automatic video saving** to device photo library
- **Session metadata tracking** with thumbnails and duration

### 🤖 AI-Powered Speech Analysis
- **Google Gemini AI integration** for comprehensive video analysis
- **Multiple analysis modes**:
  - General Communication Coaching
  - Interview Practice (STAR methodology)
  - Sales Presentation Analysis
  - Startup Pitch Evaluation
- **Detailed scoring system** across 6 categories:
  - Voice & Sound (pitch, volume, tempo, clarity, pausing, prosody)
  - Word Choice (formality, complexity, repetition, directness, emotional tone)
  - Sentence Structure (length, narrative style, questions, metaphors)
  - Conversational Style (turn-taking, responsiveness, politeness, assertiveness, humor)
  - Non-verbal Cues (laughter, gestures, facial expressions)
  - Overall Impression (warmth, authority, charisma, overall score)

### 🎤 Real-Time Voice Coaching
- **VAPI AI integration** for interactive voice coaching sessions
- **Personalized coaching** based on your speech analysis results
- **Real-time conversation** with AI coach
- **Practice exercises** and immediate feedback
- **Session history** and conversation tracking

### 📊 Progress Tracking & Analytics
- **Dashboard with practice statistics** (total sessions, duration, average)
- **Recording history** with analysis status indicators
- **Detailed analysis results** with visual score breakdowns
- **Speech pattern analysis** (filler words, repeated phrases)
- **Export functionality** for data portability

### 🔐 User Management
- **Authentication system** with login/signup
- **User profiles** with progress tracking
- **Data management** (export, clear cache, clear recordings)
- **Secure local storage** for recordings and analysis

## 🏗️ Technical Architecture

### Frontend Stack
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Expo Router** for navigation
- **React Navigation** for tab and stack navigation
- **Expo Camera** for video recording
- **Expo Media Library** for video storage
- **React Native Animatable** for smooth animations
- **Expo Linear Gradient** for visual effects

### AI & Backend Services
- **Google Gemini API** for video analysis
- **VAPI AI** for voice coaching
- **Custom API service** with fallback mechanisms
- **Mock analysis** for development and testing

### Key Dependencies
```json
{
  "@vapi-ai/react-native": "^0.3.0",
  "@daily-co/react-native-daily-js": "^0.81.0",
  "expo-camera": "^16.1.11",
  "expo-media-library": "~17.1.7",
  "react-native-animatable": "^1.4.0",
  "expo-linear-gradient": "^14.1.5"
}
```

## 📱 App Structure

### Main Screens
- **Dashboard** (`app/(tabs)/dashboard.tsx`) - Practice statistics and recording history
- **Camera Practice** (`app/camera-practice.tsx`) - Video recording with AI prompts
- **AI Analysis** (`app/ai-analysis.tsx`) - Detailed analysis results and scoring
- **Voice Coach** (`app/voice-coach.tsx`) - Interactive AI coaching sessions
- **Profile** (`app/(tabs)/profile.tsx`) - User settings and data management

### Key Components
- **VideoPlayerModal** - Playback of recorded sessions
- **CustomTabBar** - Enhanced navigation with practice button
- **NewRecordingModal** - Quick recording access
- **AuthNavigator** - Authentication flow management

### Utility Services
- **speechAnalysis.ts** - AI analysis orchestration
- **geminiService.ts** - Google Gemini API integration
- **vapiService.ts** - VAPI voice coaching integration
- **recordingUtils.ts** - Video metadata management
- **apiService.ts** - Backend API communication

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (or physical device)
- Google Gemini API key
- VAPI API key (optional, for voice coaching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speechcoach
   ```

2. **Install dependencies**
```bash
npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```bash
   # Gemini API Configuration
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   
   # VAPI Configuration (optional)
   EXPO_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
   
   # Backend API Configuration (optional)
   EXPO_PUBLIC_API_URL=http://localhost:3000
   
   # Development Configuration
   EXPO_PUBLIC_DEBUG_MODE=false
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 🔧 Configuration

### Gemini API Setup
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env` file as `EXPO_PUBLIC_GEMINI_API_KEY`

### VAPI Setup (Optional)
1. Sign up at [VAPI Dashboard](https://dashboard.vapi.ai)
2. Get your public key from Settings → API Keys
3. Add it to your `.env` file as `EXPO_PUBLIC_VAPI_PUBLIC_KEY`

### Permissions
The app requires the following permissions:
- **Camera** - For video recording
- **Microphone** - For audio recording
- **Photo Library** - For saving recordings

## 📖 How to Use

### 1. Record a Practice Session
- Tap the center practice button on the dashboard
- Grant camera and microphone permissions
- Choose from rotating speaking prompts
- Record a 30-second practice video
- Video is automatically saved and analyzed

### 2. Review AI Analysis
- After recording, you're automatically taken to the analysis screen
- View your overall score and detailed breakdowns
- Explore strengths, areas for improvement, and speech patterns
- Switch between Overview, Detailed, and Patterns tabs

### 3. Start Voice Coaching
- From the analysis screen, tap "Start Voice Coaching"
- Have a real-time conversation with your AI coach
- Receive personalized feedback based on your analysis
- Practice specific areas for improvement

### 4. Track Your Progress
- View your practice statistics on the dashboard
- Access your recording history
- Monitor your improvement over time
- Export your data for external analysis

## 🎨 Design Philosophy

SpotLight follows a clean, modern design approach with:
- **Minimalist interface** focused on the core experience
- **Smooth animations** for enhanced user engagement
- **Color-coded scoring** for easy interpretation
- **Intuitive navigation** with clear visual hierarchy
- **Accessible design** with proper contrast and sizing

## 🔄 Data Flow

```
Video Recording → AI Analysis → Voice Coaching
     ↓                ↓              ↓
  Local Storage   Gemini API    VAPI Service
     ↓                ↓              ↓
  Metadata DB    Analysis Results  Coaching Session
     ↓                ↓              ↓
  Dashboard      Detailed View   Conversation History
```

## 🛠️ Development

### Project Structure
```
├── app/                    # Main app screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── camera-practice.tsx # Video recording
│   ├── ai-analysis.tsx    # Analysis results
│   └── voice-coach.tsx    # Voice coaching
├── components/            # Reusable components
├── utils/                # Utility functions and services
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── constants/            # App constants
└── assets/              # Images and fonts
```

### Key Features Implementation
- **Video Recording**: Expo Camera with compression and metadata
- **AI Analysis**: Gemini API with comprehensive scoring system
- **Voice Coaching**: VAPI integration with real-time conversation
- **Data Management**: AsyncStorage for local persistence
- **Navigation**: Expo Router with typed routes

## 📈 Future Enhancements

- **Batch Analysis** - Analyze multiple recordings simultaneously
- **Custom Prompts** - User-defined speaking prompts
- **Progress Analytics** - Advanced tracking and insights
- **Social Features** - Share progress with mentors/peers
- **Offline Mode** - Practice without internet connection
- **Multi-language Support** - Analysis in different languages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI video analysis capabilities
- **VAPI** for voice coaching integration
- **Expo** for the excellent React Native development platform
- **React Native community** for the robust ecosystem

---

**Ready to improve your speaking skills?** Download SpotLight and start your journey to becoming a more confident and effective communicator! 🎤✨