/**
 * Environment Configuration for SpeechCoach
 * This file contains environment variables and configuration settings
 */

// Gemini API Configuration
export const GEMINI_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyAWREu3BaSKgFEo6gLDXBuNFUn8C-oJSzg",
  MODEL: "gemini-2.5-flash", // or gemini-1.5-flash
  UPLOAD_URL: `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyAWREu3BaSKgFEo6gLDXBuNFUn8C-oJSzg"}`,
  FILES_BASE: "https://generativelanguage.googleapis.com/v1beta",
};

// Backend API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 60000, // 60 seconds timeout for AI processing
};

// VAPI Configuration
export const VAPI_CONFIG = {
  PUBLIC_KEY: process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY || '',
  ASSISTANT_ID: '6e9736f2-7d18-4c0e-82fb-aa28cc81f2e2', // Default Speech Coach AI assistant ID
  EXERCISE_ASSISTANTS: {
    's-pronunciation': '7441a289-4738-4f0f-8c69-de98db575b1f', // S Pronunciation Practice Coach
    'quick-introduction': '458cbec9-e167-4f5e-b6f7-09cdc43457e7', // Quick Introduction Practice Coach
  },
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  MOCK_ANALYSIS: process.env.EXPO_PUBLIC_MOCK_ANALYSIS === 'true',
};

// Validation
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === "your_gemini_api_key_here") {
    errors.push("GEMINI_API_KEY is not configured");
  }
  
  if (!VAPI_CONFIG.PUBLIC_KEY) {
    errors.push("VAPI_PUBLIC_KEY is not configured");
  }
  
  if (errors.length > 0) {
    console.warn("Configuration validation failed:", errors);
    return false;
  }
  
  return true;
};

// Log configuration status
if (DEV_CONFIG.DEBUG_MODE) {
  console.log("SpeechCoach Configuration:", {
    geminiConfigured: !!GEMINI_CONFIG.API_KEY && GEMINI_CONFIG.API_KEY !== "your_gemini_api_key_here",
    vapiConfigured: !!VAPI_CONFIG.PUBLIC_KEY,
    assistantId: VAPI_CONFIG.ASSISTANT_ID,
    apiUrl: API_CONFIG.BASE_URL,
    debugMode: DEV_CONFIG.DEBUG_MODE,
    mockAnalysis: DEV_CONFIG.MOCK_ANALYSIS,
  });
}
