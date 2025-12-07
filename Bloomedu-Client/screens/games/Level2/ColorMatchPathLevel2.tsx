// -umut: LEVEL 2 ColorMatchPathLevel2 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların renk eşleştirme becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir (wrong_count, success_rate)
// Özellikler: 5 Renk, 3 Seçenekli Eşleştirme, Sesli Geri Bildirim, Animasyonlu Sepetler, Puan Kırma

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';
import { sendGameResult } from '../../../config/api';

const { width } = Dimensions.get('window');

// Responsive sizing
const BALL_SIZE = width * 0.22;
const BASKET_SIZE = width * 0.28;

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
  gameSequence?: string[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

interface ColorData {
  name: string;
  color: string;
  emoji: string;
}

const COLORS: ColorData[] = [
  { name: 'red', color: '#FF6B6B', emoji: '🔴' },
  { name: 'blue', color: '#4ECDC4', emoji: '🔵' },
  { name: 'green', color: '#95E1D3', emoji: '🟢' },
  { name: 'yellow', color: '#F9CA24', emoji: '🟡' },
  { name: 'purple', color: '#A29BFE', emoji: '🟣' },
];

const ColorMatchPathLevel2 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [basketColors, setBasketColors] = useState<ColorData[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [correctAnswers, setCorrectAnswers] = useState(0); // Score
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const ballShake = useRef(new Animated.Value(0)).current;
  const basketPulse1 = useRef(new Animated.Value(1)).current;
  const basketPulse2 = useRef(new Animated.Value(1)).current;
  const basketPulse3 = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const currentColor = COLORS[currentColorIndex];
  const totalColors = COLORS.length;

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    // Basket pulse animations
    const pulseLoop = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    pulseLoop(basketPulse1, 1000);
    pulseLoop(basketPulse2, 1200);
    pulseLoop(basketPulse3, 1400);

    return () => {
      Tts.stop();
    };
  }, []);

  // --- QUESTION LOGIC ---
  useEffect(() => {
    if (!gameFinished) {
      generateBaskets();
      setTimeout(() => {
        speakInstruction();
      }, 500);
    }
  }, [currentColorIndex, gameFinished]);

  const generateBaskets = () => {
    const correctColor = COLORS[currentColorIndex];
    const otherColors = COLORS.filter((_, idx) => idx !== currentColorIndex);
    const shuffled = otherColors.sort(() => Math.random() - 0.5);
    const wrongColors = shuffled.slice(0, 2);
    const allBaskets = [correctColor, ...wrongColors].sort(() => Math.random() - 0.5);
    setBasketColors(allBaskets);
  };

  const speakInstruction = () => {
    Tts.speak(`Find the ${currentColor.name} basket!`);
  };

  // --- INTERACTION ---
  const handleBasketTap = (selectedColor: ColorData) => {
    if (feedback) return;

    if (selectedColor.name === currentColor.name) {
      // ✅ Correct Answer
      const newScore = correctAnswers + 1; // Calculate new score immediately
      setCorrectAnswers(newScore);
      
      setFeedback('correct');
      setAnsweredCount(prev => prev + 1);

      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Tts.speak(`Perfect! ${currentColor.name} matches ${currentColor.name}!`);

      setTimeout(() => {
        if (currentColorIndex < totalColors - 1) {
          nextColor();
        } else {
          // Game Over - Pass the calculated newScore
          setGameFinished(true);
          completeGame(newScore);
        }
      }, 1500);
    } else {
      // ❌ Incorrect Answer
      setFeedback('incorrect');
      setWrongCount(prev => prev + 1);
      
      // Optional: Decrease score on wrong answer, but never below 0
      setCorrectAnswers(prev => Math.max(0, prev - 1));

      // Shake animation
      Animated.sequence([
        Animated.timing(ballShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(ballShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(ballShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(ballShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      Tts.speak('Try again!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const nextColor = () => {
    setFeedback('');
    setCurrentColorIndex(prev => prev + 1);
    successOpacity.setValue(0);
    ballShake.setValue(0);
  };

  const handleHearAgain = () => {
    speakInstruction();
  };

  // --- DATABASE & COMPLETION ---
  const completeGame = async (finalScore?: number) => {
    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Use finalScore if provided, otherwise use state (though state might be stale in closure)
    const scoreToUse = finalScore !== undefined ? finalScore : correctAnswers;
    
    // Success Rate Calculation
    // Logic: (Correct Answers / Total Answers Tried) * 100
    // Total Answers Tried = Correct Answers + Wrong Answers
    // Note: answeredCount tracks *attempts* in some logics, but here it tracks *progress*.
    // Let's use standard formula:
    const totalAttempts = scoreToUse + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round((scoreToUse / totalAttempts) * 100) : 0;

    if (child?.id) {
      await sendGameResult({
        child_id: child.id,
        game_type: 'color_match_path',
        level: 2,
        score: scoreToUse,
        max_score: totalColors,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalColors,
          answeredCount: answeredCount + 1, // +1 because state updates are slow
          wrongCount,
          successRate,
        },
        completed: true,
      });
    }

    // Dynamic Feedback Message
    let completionMessage = '';
    if (scoreToUse === totalColors) {
      completionMessage = 'Amazing! You matched all colors perfectly! 🎨';
    } else if (scoreToUse >= totalColors - 1) {
      completionMessage = 'Great work! Almost perfect! ⭐';
    } else {
      completionMessage = 'Nice try! Let\'s play again! 🔄';
    }

    const gameNavigation = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setCurrentColorIndex(0);
        setCorrectAnswers(0);
        setWrongCount(0);
        setAnsweredCount(0);
        setFeedback('');
        successOpacity.setValue(0);
        ballShake.setValue(0);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
      },
    });

    gameNavigation.showCompletionMessage(
      scoreToUse,
      totalColors,
      completionMessage
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  const getPulseAnim = (index: number) => {
    if (index === 0) return basketPulse1;
    if (index === 1) return basketPulse2;
    return basketPulse3;
  };

  // Safe success rate for display
  const displaySuccessRate = answeredCount > 0 ? Math.round((Math.max(correctAnswers, 0) / answeredCount) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: currentColor.color + '10' }]}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🎨 Color Match</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {correctAnswers}/{totalColors}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    width: `${((currentColorIndex + 1) / totalColors) * 100}%`,
                    backgroundColor: currentColor.color 
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>Color {currentColorIndex + 1} of {totalColors}</Text>
          </View>

          {/* Game Area */}
          <View style={styles.gameArea}>
            
            {/* Instruction */}
            <View style={[styles.instructionCard, { borderColor: currentColor.color }]}>
              <Text style={styles.instructionEmoji}>🎯</Text>
              <Text style={styles.instructionText}>
                Find the {currentColor.name} basket!
              </Text>
              <TouchableOpacity 
                style={[styles.hearButton, { backgroundColor: currentColor.color }]} 
                onPress={handleHearAgain}
              >
                <Text style={styles.hearButtonText}>🔊 Hear again</Text>
              </TouchableOpacity>
            </View>

            {/* Ball - Current Target */}
            <View style={styles.ballSection}>
              <Animated.View
                style={[
                  styles.ballContainer,
                  { transform: [{ translateX: ballShake }] },
                ]}
              >
                <View style={[styles.ballCircle, { backgroundColor: currentColor.color }]}>
                  <Text style={styles.ballEmoji}>{currentColor.emoji}</Text>
                </View>
                <Text style={[styles.colorLabel, { color: currentColor.color }]}>
                  {currentColor.name.toUpperCase()}
                </Text>
              </Animated.View>

              {/* Success Message */}
              <Animated.View style={[styles.successMessage, { opacity: successOpacity }]}>
                <Text style={styles.successText}>🎉 Perfect Match! 🎉</Text>
              </Animated.View>
            </View>

            {/* Baskets - Options */}
            <View style={styles.basketsSection}>
              <Text style={styles.basketsTitle}>Choose the matching basket:</Text>
              <View style={styles.basketsContainer}>
                {basketColors.map((basketColor, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.basket,
                      { 
                        backgroundColor: basketColor.color + '20',
                        borderColor: basketColor.color 
                      },
                      feedback === 'correct' && basketColor.name === currentColor.name && styles.correctBasket,
                    ]}
                    onPress={() => handleBasketTap(basketColor)}
                    activeOpacity={0.7}
                    disabled={feedback !== ''}
                  >
                    <Animated.View 
                      style={[
                        styles.basketContent,
                        { transform: [{ scale: getPulseAnim(index) }] }
                      ]}
                    >
                      <View style={[styles.basketCircle, { borderColor: basketColor.color }]}>
                        <Text style={styles.basketEmoji}>🧺</Text>
                      </View>
                      <Text style={[styles.basketLabel, { color: basketColor.color }]}>
                        {basketColor.name.toUpperCase()}
                      </Text>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sequenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  gameArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 15,
  },
  hearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ballSection: {
    alignItems: 'center',
    marginBottom: 30,
    height: 180, 
    justifyContent: 'center',
  },
  ballContainer: {
    alignItems: 'center',
  },
  ballCircle: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  ballEmoji: {
    fontSize: BALL_SIZE * 0.5,
  },
  colorLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  successMessage: {
    position: 'absolute',
    top: -40,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  basketsSection: {
    width: '100%',
    alignItems: 'center',
  },
  basketsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  basketsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
  },
  basket: {
    width: BASKET_SIZE,
    height: BASKET_SIZE * 1.1,
    borderRadius: 20,
    borderWidth: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  correctBasket: {
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9',
    transform: [{ scale: 1.05 }],
  },
  basketContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  basketCircle: {
    width: BASKET_SIZE * 0.6,
    height: BASKET_SIZE * 0.6,
    borderRadius: (BASKET_SIZE * 0.6) / 2,
    backgroundColor: '#FFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  basketEmoji: {
    fontSize: BASKET_SIZE * 0.3,
  },
  basketLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ColorMatchPathLevel2;