#!/bin/bash

# VAPI Dependencies Installation Script
# This script installs all required dependencies for VAPI voice coaching integration

echo "🚀 Installing VAPI dependencies for SpeechCoach..."

# Install VAPI React Native SDK
echo "📦 Installing @vapi-ai/react-native..."
npm install @vapi-ai/react-native --legacy-peer-deps

# Install Daily.co dependencies
echo "📦 Installing Daily.co dependencies..."
npm install @daily-co/react-native-daily-js --legacy-peer-deps
npm install @daily-co/react-native-webrtc@118.0.3-daily.4 --legacy-peer-deps

# Install background timer
echo "📦 Installing react-native-background-timer..."
npm install react-native-background-timer@^2.4.1 --legacy-peer-deps

# Install permissions
echo "📦 Installing react-native-permissions..."
npm install react-native-permissions --legacy-peer-deps

# Install random values
echo "📦 Installing react-native-get-random-values..."
npm install react-native-get-random-values --legacy-peer-deps

# Fix async storage version compatibility
echo "📦 Fixing async storage version..."
npm install @react-native-async-storage/async-storage@2.1.2 --legacy-peer-deps

echo "✅ All VAPI dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Add your VAPI public key to environment variables:"
echo "   EXPO_PUBLIC_VAPI_PUBLIC_KEY=pk_your_key_here"
echo ""
echo "2. Start the development server:"
echo "   npx expo start --clear"
echo ""
echo "3. Test the voice coaching integration!"
echo ""
echo "🎤 Happy coaching!"
