import NewRecordingModal from '@/components/NewRecordingModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GeminiAnalysisResult } from '@/utils/geminiService';
import { RecordingMetadata, getRecordingMetadata } from '@/utils/recordingUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

interface ScoreCategory {
  title: string;
  icon: string;
  color: string;
  scores: {
    label: string;
    value: number;
    description: string;
  }[];
}

export default function AIAnalysisScreen() {
  const { recordingId } = useLocalSearchParams<{ recordingId: string }>();
  const [recording, setRecording] = useState<RecordingMetadata | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'disfluency'>('overview');
  const [showModal, setShowModal] = useState(false);
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAnalysisData();
  }, [recordingId]);

  useEffect(() => {
    // Animate in the content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAnalysisData = async () => {
    try {
      const recordings = await getRecordingMetadata();
      const targetRecording = recordings.find(r => r.id === recordingId);
      
      console.log('Found recording:', targetRecording ? 'Yes' : 'No');
      console.log('Recording ID:', recordingId);
      console.log('Has aiAnalysis:', targetRecording?.aiAnalysis ? 'Yes' : 'No');
      
      if (targetRecording && targetRecording.aiAnalysis) {
        setRecording(targetRecording);
        
        // The aiAnalysis is an AnalysisResponse, so we need to access the analysis field
        const speechAnalysis = (targetRecording.aiAnalysis as any).analysis || targetRecording.aiAnalysis;
        
        // Check if this is the new format with gemini_analysis
        if (speechAnalysis.gemini_analysis) {
          console.log('Found gemini_analysis, setting detailed view');
          setGeminiAnalysis(speechAnalysis.gemini_analysis);
        } else {
          console.log('No gemini_analysis found, using fallback mode');
          console.log('Available analysis fields:', Object.keys(speechAnalysis));
        }
      } else {
        console.log('No aiAnalysis found for recording');
        if (targetRecording) {
          console.log('Recording fields:', Object.keys(targetRecording));
        }
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#4CAF50'; // Green
    if (score >= 6) return '#FF9800'; // Orange
    if (score >= 4) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Average';
    if (score >= 3) return 'Below Average';
    return 'Needs Improvement';
  };

  const getOverallScore = (): number => {
    if (!geminiAnalysis) return 0;
    return geminiAnalysis.scores.overall_impression.overall_score || 0;
  };

  const getScoreCategories = (): ScoreCategory[] => {
    if (!geminiAnalysis) return [];

    return [
      {
        title: 'Voice & Sound',
        icon: 'speaker.wave.2',
        color: '#2196F3',
        scores: [
          { label: 'Pitch/Tone', value: geminiAnalysis.scores.voice_sound.pitch_tone, description: 'Voice variation and emotional expression' },
          { label: 'Volume', value: geminiAnalysis.scores.voice_sound.volume, description: 'Loudness and projection' },
          { label: 'Tempo/Pace', value: geminiAnalysis.scores.voice_sound.tempo_pace, description: 'Speaking speed and rhythm' },
          { label: 'Clarity', value: geminiAnalysis.scores.voice_sound.clarity_articulation, description: 'Pronunciation and articulation' },
          { label: 'Pausing', value: geminiAnalysis.scores.voice_sound.pausing_hesitation, description: 'Use of pauses and flow' },
          { label: 'Prosody', value: geminiAnalysis.scores.voice_sound.prosody, description: 'Intonation and emotional coloring' },
        ]
      },
      {
        title: 'Word Choice',
        icon: 'textformat',
        color: '#9C27B0',
        scores: [
          { label: 'Formality', value: geminiAnalysis.scores.word_choice.formality, description: 'Appropriate language level' },
          { label: 'Complexity', value: geminiAnalysis.scores.word_choice.complexity, description: 'Vocabulary sophistication' },
          { label: 'Repetition', value: geminiAnalysis.scores.word_choice.repetition, description: 'Avoiding repetitive phrases' },
          { label: 'Directness', value: geminiAnalysis.scores.word_choice.directness, description: 'Clear and straightforward communication' },
          { label: 'Emotional Tone', value: geminiAnalysis.scores.word_choice.emotional_tone, description: 'Appropriate emotional expression' },
        ]
      },
      {
        title: 'Sentence Structure',
        icon: 'doc.text',
        color: '#FF5722',
        scores: [
          { label: 'Sentence Length', value: geminiAnalysis.scores.sentence_structure.sentence_length, description: 'Varied and appropriate sentence structure' },
          { label: 'Narrative Style', value: geminiAnalysis.scores.sentence_structure.narrative_style, description: 'Storytelling and organization' },
          { label: 'Questions', value: geminiAnalysis.scores.sentence_structure.use_of_questions, description: 'Effective use of questions' },
          { label: 'Metaphors', value: geminiAnalysis.scores.sentence_structure.metaphors_analogies, description: 'Use of analogies and metaphors' },
        ]
      },
      {
        title: 'Conversational Style',
        icon: 'bubble.left.and.bubble.right',
        color: '#4CAF50',
        scores: [
          { label: 'Turn Taking', value: geminiAnalysis.scores.conversational_style.turn_taking, description: 'Balanced conversation flow' },
          { label: 'Responsiveness', value: geminiAnalysis.scores.conversational_style.responsiveness, description: 'Staying on topic and relevant' },
          { label: 'Politeness', value: geminiAnalysis.scores.conversational_style.politeness, description: 'Appropriate courtesy and respect' },
          { label: 'Assertiveness', value: geminiAnalysis.scores.conversational_style.assertiveness, description: 'Confident and decisive communication' },
          { label: 'Humor', value: geminiAnalysis.scores.conversational_style.humor_playfulness, description: 'Appropriate use of humor' },
        ]
      },
      {
        title: 'Non-verbal',
        icon: 'hand.raised',
        color: '#FF9800',
        scores: [
          { label: 'Laughter', value: geminiAnalysis.scores.nonverbal.laughter, description: 'Appropriate laughter and chuckling' },
          { label: 'Gestures', value: geminiAnalysis.scores.nonverbal.gestures, description: 'Effective hand gestures' },
          { label: 'Facial Expressions', value: geminiAnalysis.scores.nonverbal.facial_expressions, description: 'Expressive and congruent facial expressions' },
        ]
      },
      {
        title: 'Overall Impression',
        icon: 'star',
        color: '#E91E63',
        scores: [
          { label: 'Warmth', value: geminiAnalysis.scores.overall_impression.warmth, description: 'Approachable and friendly presence' },
          { label: 'Authority', value: geminiAnalysis.scores.overall_impression.authority, description: 'Confident and credible delivery' },
          { label: 'Charisma', value: geminiAnalysis.scores.overall_impression.charisma, description: 'Engaging and memorable presence' },
          { label: 'Overall Score', value: geminiAnalysis.scores.overall_impression.overall_score, description: 'Comprehensive communication effectiveness' },
        ]
      }
    ];
  };

  const ScoreBar = ({ label, value, description, color }: { label: string; value: number; description: string; color: string }) => (
    <View style={styles.scoreItem}>
      <View style={styles.scoreHeader}>
        <Text style={[styles.scoreLabel, { color: '#000' }]}>{label}</Text>
        <View style={styles.scoreValueContainer}>
          <Text style={[styles.scoreValue, { color: getScoreColor(value) }]}>{value}/10</Text>
          <Text style={[styles.scoreDescription, { color: '#000' + '80' }]}>{getScoreDescription(value)}</Text>
        </View>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: '#000' + '10' }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${(value / 10) * 100}%`,
              backgroundColor: getScoreColor(value)
            }
          ]} 
        />
      </View>
      <Text style={[styles.scoreDescriptionText, { color: '#000' + '70' }]}>{description}</Text>
    </View>
  );

  const ScoreCategoryCard = ({ category }: { category: ScoreCategory }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600}
      style={[styles.categoryCard, { backgroundColor: '#fff', borderColor: '#000' + '10' }]}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
          <IconSymbol name={category.icon as any} size={20} color={category.color} />
        </View>
        <Text style={[styles.categoryTitle, { color: '#000' }]}>{category.title}</Text>
      </View>
      
      <View style={styles.scoresContainer}>
        {category.scores.map((score, index) => (
          <ScoreBar
            key={index}
            label={score.label}
            value={score.value}
            description={score.description}
            color={category.color}
          />
        ))}
      </View>
    </Animatable.View>
  );

  const DisfluencyCard = () => {
    if (!geminiAnalysis) return null;

    const { filler_words, repeated_phrases } = geminiAnalysis.disfluencies;

    return (
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        style={[styles.disfluencyCard, { backgroundColor: '#fff', borderColor: '#000' + '10' }]}
      >
        <View style={styles.disfluencyHeader}>
          <IconSymbol name="exclamationmark.triangle" size={20} color="#FF9800" />
          <Text style={[styles.disfluencyTitle, { color: '#000' }]}>Speech Patterns Analysis</Text>
        </View>

        {filler_words.length > 0 && (
          <View style={styles.disfluencySection}>
            <Text style={[styles.disfluencySectionTitle, { color: '#000' }]}>Filler Words</Text>
            <View style={styles.fillerWordsContainer}>
              {filler_words.map((filler, index) => (
                <View key={index} style={[styles.fillerWordItem, { backgroundColor: '#FF9800' + '20' }]}>
                  <Text style={[styles.fillerWordText, { color: '#000' }]}>"{filler.token}"</Text>
                  <Text style={[styles.fillerWordCount, { color: '#FF9800' }]}>{filler.count} times</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {repeated_phrases.length > 0 && (
          <View style={styles.disfluencySection}>
            <Text style={[styles.disfluencySectionTitle, { color: '#000' }]}>Repeated Phrases</Text>
            <View style={styles.repeatedPhrasesContainer}>
              {repeated_phrases.map((phrase, index) => (
                <View key={index} style={[styles.repeatedPhraseItem, { backgroundColor: '#F44336' + '20' }]}>
                  <Text style={[styles.repeatedPhraseText, { color: '#000' }]}>"{phrase.phrase}"</Text>
                  <Text style={[styles.repeatedPhraseCount, { color: '#F44336' }]}>{phrase.count} times</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {filler_words.length === 0 && repeated_phrases.length === 0 && (
          <View style={styles.noDisfluencyContainer}>
            <IconSymbol name="checkmark.circle" size={32} color="#4CAF50" />
            <Text style={[styles.noDisfluencyText, { color: '#000' }]}>Great! No significant speech patterns detected</Text>
            <Text style={[styles.noDisfluencySubtext, { color: '#000' + '80' }]}>
              Your speech was clear and fluent throughout
            </Text>
          </View>
        )}
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: '#000' }]}>Loading AI analysis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recording || !recording.aiAnalysis) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
          <Text style={[styles.errorText, { color: '#000' }]}>Analysis not found</Text>
          <Text style={[styles.errorSubtext, { color: '#000' + '80' }]}>
            The AI analysis for this recording is not available
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const overallScore = getOverallScore();
  const scoreCategories = getScoreCategories();
  
  // Fallback mode when Gemini analysis is not available
  const speechAnalysis = (recording?.aiAnalysis as any)?.analysis || recording?.aiAnalysis;
  const isFallbackMode = !geminiAnalysis && speechAnalysis;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#fff', borderBottomColor: '#000' + '10' }]}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: '#000' }]}>Spotlight Analysis</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerMicButton}
          onPress={() => router.push('/voice-coach')}
        >
          <IconSymbol name="mic" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Overall Score Card */}
      <Animatable.View 
        animation="fadeInDown" 
        duration={600}
        style={[styles.overallScoreCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '30' }]}
      >
        <View style={styles.overallScoreContent}>
          <View style={styles.overallScoreLeft}>
            <Text style={[styles.overallScoreLabel, { color: '#000' }]}>Overall Score</Text>
            <View style={styles.overallScoreValueContainer}>
              <Text style={[styles.overallScoreValue, { color: getScoreColor(overallScore) }]}>
                {overallScore}/10
              </Text>
              <Text style={[styles.overallScoreDescription, { color: '#000' + '80' }]}>
                {getScoreDescription(overallScore)}
              </Text>
            </View>
          </View>
          <View style={styles.overallScoreRight}>
            <View style={[styles.overallScoreCircle, { borderColor: getScoreColor(overallScore) }]}>
              <Text style={[styles.overallScoreCircleText, { color: getScoreColor(overallScore) }]}>
                {overallScore}
              </Text>
            </View>
          </View>
        </View>
      </Animatable.View>

      {/* Voice Coach Button */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        delay={200}
        style={styles.voiceCoachContainer}
      >
        <TouchableOpacity
          style={[styles.voiceCoachButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/practice')}
        >
          <IconSymbol name="mic.fill" size={20} color="white" />
          <Text style={styles.voiceCoachButtonText}>Start Voice Coaching</Text>
          <IconSymbol name="chevron.right" size={16} color="white" />
        </TouchableOpacity>
      </Animatable.View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabNavigation, { backgroundColor: '#000' + '10' }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'overview' && [styles.activeTab, { backgroundColor: colors.tint }]
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'overview' ? 'white' : '#000' + '80' }
            ]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'detailed' && [styles.activeTab, { backgroundColor: colors.tint }]
            ]}
            onPress={() => setActiveTab('detailed')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'detailed' ? 'white' : '#000' + '80' }
            ]}>
              Detailed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'disfluency' && [styles.activeTab, { backgroundColor: colors.tint }]
            ]}
            onPress={() => setActiveTab('disfluency')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'disfluency' ? 'white' : '#000' + '80' }
            ]}>
              Patterns
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <Animatable.View animation="fadeInUp" duration={600}>
            {/* Summary */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={200}
              style={[styles.summaryCard, { backgroundColor: '#fff', borderColor: '#000' + '10' }]}
            >
              <View style={styles.summaryHeader}>
                <IconSymbol name="doc.text" size={20} color={colors.tint} />
                <Text style={[styles.summaryTitle, { color: '#000' }]}>Summary</Text>
              </View>
              <Text style={[styles.summaryText, { color: '#000' + '90' }]}>
                {geminiAnalysis?.summary || speechAnalysis?.summary || 'No summary available'}
              </Text>
            </Animatable.View>

            {/* Fallback Mode - Show converted analysis data */}
            {isFallbackMode ? (
              <Animatable.View 
                animation="fadeInUp" 
                duration={600}
                delay={400}
                style={styles.fallbackContainer}
              >
                <Text style={[styles.fallbackTitle, { color: '#000' }]}>Analysis Results</Text>
                
                {/* Strengths */}
                {speechAnalysis?.strengths && speechAnalysis.strengths.length > 0 && (
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={600}
                    delay={500}
                    style={[styles.fallbackCard, { backgroundColor: '#4CAF50' + '10', borderColor: '#4CAF50' + '30' }]}
                  >
                    <View style={styles.fallbackCardHeader}>
                      <IconSymbol name="checkmark.circle" size={20} color="#4CAF50" />
                      <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Strengths</Text>
                    </View>
                    {speechAnalysis.strengths.map((strength: string, index: number) => (
                      <Text key={index} style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                        • {strength}
                      </Text>
                    ))}
                  </Animatable.View>
                )}

                {/* Opportunities */}
                {speechAnalysis?.opportunities && speechAnalysis.opportunities.length > 0 && (
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={600}
                    delay={600}
                    style={[styles.fallbackCard, { backgroundColor: '#FF9800' + '10', borderColor: '#FF9800' + '30' }]}
                  >
                    <View style={styles.fallbackCardHeader}>
                      <IconSymbol name="lightbulb" size={20} color="#FF9800" />
                      <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Areas for Improvement</Text>
                    </View>
                    {speechAnalysis.opportunities.map((opportunity: string, index: number) => (
                      <Text key={index} style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                        • {opportunity}
                      </Text>
                    ))}
                  </Animatable.View>
                )}

                {/* Key Observations */}
                <Animatable.View 
                  animation="fadeInUp" 
                  duration={600}
                  delay={700}
                  style={[styles.fallbackCard, { backgroundColor: '#2196F3' + '10', borderColor: '#2196F3' + '30' }]}
                >
                  <View style={styles.fallbackCardHeader}>
                    <IconSymbol name="eye" size={20} color="#2196F3" />
                    <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Key Observations</Text>
                  </View>
                  {speechAnalysis?.clarity && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • {speechAnalysis.clarity}
                    </Text>
                  )}
                  {speechAnalysis?.confidence && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • {speechAnalysis.confidence}
                    </Text>
                  )}
                  {speechAnalysis?.content_structure && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • {speechAnalysis.content_structure}
                    </Text>
                  )}
                  {speechAnalysis?.technical_depth && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • {speechAnalysis.technical_depth}
                    </Text>
                  )}
                </Animatable.View>

                {/* Filler Words */}
                {speechAnalysis?.filler_words && (
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={600}
                    delay={800}
                    style={[styles.fallbackCard, { backgroundColor: '#F44336' + '10', borderColor: '#F44336' + '30' }]}
                  >
                    <View style={styles.fallbackCardHeader}>
                      <IconSymbol name="exclamationmark.triangle" size={20} color="#F44336" />
                      <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Speech Patterns</Text>
                    </View>
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      {speechAnalysis.filler_words}
                    </Text>
                  </Animatable.View>
                )}
              </Animatable.View>
            ) : (
              /* Normal Mode - Show detailed Gemini analysis */
              <Animatable.View 
                animation="fadeInUp" 
                duration={600}
                delay={400}
                style={styles.topCategoriesContainer}
              >
                {/* <Text style={[styles.topCategoriesTitle, { color: '#000' }]}>Key Areas</Text>
                {scoreCategories.slice(0, 3).map((category, index) => (
                  <ScoreCategoryCard key={index} category={category} />
                ))} */}
              </Animatable.View>
            )}
          </Animatable.View>
        )}

        {activeTab === 'detailed' && (
          <Animatable.View animation="fadeInUp" duration={600}>
            {isFallbackMode ? (
              <View style={styles.fallbackDetailedContainer}>
                <Text style={[styles.fallbackDetailedTitle, { color: '#000' }]}>Detailed Analysis</Text>
                <Text style={[styles.fallbackDetailedSubtitle, { color: '#000' + '80' }]}>
                  This analysis was processed using the converted format. For detailed scoring, ensure the Gemini analysis is available.
                </Text>
                
                {/* Show all available analysis data */}
                <Animatable.View 
                  animation="fadeInUp" 
                  duration={600}
                  delay={200}
                  style={[styles.fallbackCard, { backgroundColor: '#9C27B0' + '10', borderColor: '#9C27B0' + '30' }]}
                >
                  <View style={styles.fallbackCardHeader}>
                    <IconSymbol name="chart.bar" size={20} color="#9C27B0" />
                    <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Analysis Metrics</Text>
                  </View>
                  {speechAnalysis?.overall_score && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • Overall Score: {speechAnalysis.overall_score}/10
                    </Text>
                  )}
                  {speechAnalysis?.accent_observations && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • {speechAnalysis.accent_observations}
                    </Text>
                  )}
                  {speechAnalysis?.pacing_observations && (
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      • {speechAnalysis.pacing_observations}
                    </Text>
                  )}
                </Animatable.View>

                {/* Prioritized Tips */}
                {speechAnalysis?.prioritized_tips && speechAnalysis.prioritized_tips.length > 0 && (
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={600}
                    delay={300}
                    style={[styles.fallbackCard, { backgroundColor: '#FF5722' + '10', borderColor: '#FF5722' + '30' }]}
                  >
                    <View style={styles.fallbackCardHeader}>
                      <IconSymbol name="list.bullet" size={20} color="#FF5722" />
                      <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Prioritized Tips</Text>
                    </View>
                    {speechAnalysis.prioritized_tips.map((tip: string, index: number) => (
                      <Text key={index} style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                        {index + 1}. {tip}
                      </Text>
                    ))}
                  </Animatable.View>
                )}
              </View>
            ) : (
              <>
                <Text style={[styles.detailedTitle, { color: '#000' }]}>Detailed Analysis</Text>
                {scoreCategories.map((category, index) => (
                  <ScoreCategoryCard key={index} category={category} />
                ))}
              </>
            )}
          </Animatable.View>
        )}

        {activeTab === 'disfluency' && (
          <Animatable.View animation="fadeInUp" duration={600}>
            {isFallbackMode ? (
              <View style={styles.fallbackDisfluencyContainer}>
                <Text style={[styles.fallbackDisfluencyTitle, { color: '#000' }]}>Speech Patterns</Text>
                <Text style={[styles.fallbackDisfluencySubtitle, { color: '#000' + '80' }]}>
                  Detailed filler word and phrase analysis requires the full Gemini analysis data.
                </Text>
                
                {speechAnalysis?.filler_words && (
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={600}
                    delay={200}
                    style={[styles.fallbackCard, { backgroundColor: '#F44336' + '10', borderColor: '#F44336' + '30' }]}
                  >
                    <View style={styles.fallbackCardHeader}>
                      <IconSymbol name="exclamationmark.triangle" size={20} color="#F44336" />
                      <Text style={[styles.fallbackCardTitle, { color: '#000' }]}>Speech Patterns</Text>
                    </View>
                    <Text style={[styles.fallbackItem, { color: '#000' + '90' }]}>
                      {speechAnalysis.filler_words}
                    </Text>
                  </Animatable.View>
                )}
              </View>
            ) : (
              <DisfluencyCard />
            )}
          </Animatable.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal */}
      <NewRecordingModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerMicButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#000' + '10',
  },
  overallScoreCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  overallScoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallScoreLeft: {
    flex: 1,
  },
  overallScoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  overallScoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  overallScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  overallScoreDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  overallScoreRight: {
    alignItems: 'center',
  },
  overallScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallScoreCircleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  voiceCoachContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  voiceCoachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceCoachButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  topCategoriesContainer: {
    paddingHorizontal: 20,
  },
  topCategoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoryCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoresContainer: {
    gap: 16,
  },
  scoreItem: {
    gap: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreDescriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  disfluencyCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disfluencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  disfluencyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  disfluencySection: {
    marginBottom: 20,
  },
  disfluencySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  fillerWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fillerWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  fillerWordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fillerWordCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  repeatedPhrasesContainer: {
    gap: 8,
  },
  repeatedPhraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  repeatedPhraseText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  repeatedPhraseCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDisfluencyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noDisfluencyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noDisfluencySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Fallback mode styles
  fallbackContainer: {
    paddingHorizontal: 20,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  fallbackCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fallbackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fallbackCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  fallbackDetailedContainer: {
    paddingHorizontal: 20,
  },
  fallbackDetailedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  fallbackDetailedSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  fallbackDisfluencyContainer: {
    paddingHorizontal: 20,
  },
  fallbackDisfluencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  fallbackDisfluencySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
});
