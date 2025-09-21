/**
 * Professional SpotLight theme for SpeechCoach App
 * Using warm light yellow spotlight colors for a professional, focused experience
 */

// Primary colors - muted professional theme
const mutedYellow = '#F7F3E9';         // Very light muted yellow
const softYellow = '#000';          // Soft khaki yellow
const subtleYellow = '#64748B';        // Lemon chiffon
const warmBeige = '#F5F5DC';           // Warm beige

// Professional neutral colors
const warmGray = '#6B7280';            // Professional gray
const lightWarmGray = '#9CA3AF';       // Light gray for secondary text
const charcoal = '#374151';            // Professional dark text
const softWhite = '#FEFEFE';           // Soft white background

// Professional status colors (keeping these functional)
const professionalGreen = '#10B981';   // Success/positive
const professionalOrange = '#F59E0B';  // Warning
const professionalRed = '#EF4444';     // Error

// Light theme colors
const lightBackground = '#FAFBFC';  // Slightly off-white for warmth
const lightSurface = '#FFFFFF';
const lightCardBg = '#FFFFFF';
const darkText = '#1E293B';
const lightGray = '#64748B';

// Dark theme colors  
const darkBackground = '#0F172A';
const darkSurface = '#1E293B';
const darkCardBg = '#334155';
const lightText = '#F1F5F9';
const darkGray = '#94A3B8';

export const Colors = {
  light: {
    text: charcoal,
    textSecondary: charcoal,
    background: softWhite,
    surface: mutedYellow,
    cardBackground: subtleYellow,
    tint: softYellow,
    accent: warmBeige,
    secondary: mutedYellow,
    tertiary: subtleYellow,
    icon: warmGray,
    tabIconDefault: lightWarmGray,
    tabIconSelected: softYellow,
    border: '#F3F4F6',
    success: professionalGreen,
    warning: professionalOrange,
    error: professionalRed,
    // Professional spotlight colors (no more fun colors)
    funPink: softYellow,
    funOrange: warmBeige,
    funBlue: mutedYellow,
    funGreen: professionalGreen,
    softPeach: subtleYellow,
    softLavender: mutedYellow,
    // Tab bar specific colors for professional appearance
    tabBarBackground: 'rgba(255,255,255,0.95)',
    tabBarBackgroundSecondary: 'rgba(247,243,233,0.9)',
    tabBarBorder: 'rgba(203,213,225,0.8)',
    tabBarShadow: 'rgba(107,114,128,0.1)',
    // Solid colors instead of gradients
    gradientStart: subtleYellow,
    gradientEnd: subtleYellow,
    accentGradientStart: mutedYellow,
    accentGradientEnd: mutedYellow,
    // Practice button solid colors
    practiceGradientStart: '#FFFFFF',
    practiceGradientEnd: '#FFFFFF',
    practiceGlow: softYellow,
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    cardBackground: '#334155',
    tint: softYellow,
    accent: warmBeige,
    secondary: mutedYellow,
    tertiary: subtleYellow,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: softYellow,
    border: '#475569',
    success: professionalGreen,
    warning: professionalOrange,
    error: professionalRed,
    // Professional spotlight colors (no more fun colors)
    funPink: softYellow,
    funOrange: warmBeige,
    funBlue: mutedYellow,
    funGreen: professionalGreen,
    softPeach: subtleYellow,
    softLavender: mutedYellow,
    // Tab bar specific colors
    tabBarBackground: 'rgba(30,41,59,0.95)',
    tabBarBackgroundSecondary: 'rgba(15,23,42,0.9)',
    tabBarBorder: 'rgba(71,85,105,0.8)',
    tabBarShadow: 'rgba(0,0,0,0.3)',
    // Solid colors instead of gradients
    gradientStart: '#334155',
    gradientEnd: '#334155',
    accentGradientStart: '#1E293B',
    accentGradientEnd: '#1E293B',
    // Practice button solid colors
    practiceGradientStart: '#334155',
    practiceGradientEnd: '#334155',
    practiceGlow: softYellow,
  },
};
