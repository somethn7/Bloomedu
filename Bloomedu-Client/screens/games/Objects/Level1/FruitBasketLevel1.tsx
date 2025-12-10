// -umut: LEVEL 1 FruitBasketLevel1 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların meyve tanıma becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir ve öğretmenler bu verileri takip edebilir(wrong_count, success_rate)
// Özellikler: 10 soru, 6 meyve, skorlama, süre takibi, sesli okuma
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const FRUIT_SIZE = width * 0.18;
const BASKET_SIZE = width * 0.22;

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

interface FruitData {
  name: string;
  emoji: string;
  color: string;
}

const FRUITS: FruitData[] = [
  { name: 'apple', emoji: '🍎', color: '#FF6B6B' },
  { name: 'banana', emoji: '🍌', color: '#FFD93D' },
  { name: 'orange', emoji: '🍊', color: '#FF9A3D' },
  { name: 'grapes', emoji: '🍇', color: '#A29BFE' },
  { name: 'strawberry', emoji: '🍓', color: '#FF6B9A' },
  { name: 'watermelon', emoji: '🍉', color: '#6BCF7F' },
];

const FruitBasketLevel1 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game Logic State
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0); // Always 0 for observation games
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const isFinishedRef = useRef(false);

  // Animations
  const startX = width * 0.1;
  const startY = height * 0.35;
  const endX = width * 0.7;
  const endY = height * 0.35;

  const fruitPosition = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const fruitScale = useRef(new Animated.Value(1)).current;
  const basketScale = useRef(new Animated.Value(1)).current;
  const pathOpacity = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const currentFruit = FRUITS[currentFruitIndex];
  const totalFruits = FRUITS.length;

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    // Basket pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(basketScale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(basketScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      Tts.stop();
    };
  }, []);

  // --- GAME LOOP ---
  useEffect(() => {
    if (!gameFinished) {
      const timer = setTimeout(() => {
        startAnimation();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentFruitIndex, gameFinished]);

  const startAnimation = () => {
    if (isFinishedRef.current) return;

    Tts.speak(`Watch the ${currentFruit.name} go to the basket!`);

    // Show path
    Animated.timing(pathOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // Move Fruit
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fruitPosition, {
          toValue: { x: endX, y: endY },
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(fruitScale, { toValue: 1.15, duration: 1750, useNativeDriver: true }),
          Animated.timing(fruitScale, { toValue: 0.85, duration: 1750, useNativeDriver: true }),
        ]),
      ]).start(() => {
        // --- ON SUCCESS ---
        handleFruitSuccess();
      });
    }, 800);
  };

  const handleFruitSuccess = () => {
    setShowSuccess(true);
    
    // Metrics Update
    setScore(prev => prev + 1);
    setAnsweredCount(prev => prev + 1);

    // Celebration
    Animated.spring(celebrationAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Tts.speak(`Wonderful! The ${currentFruit.name} is in the basket!`);

    // Hide path
    Animated.timing(pathOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();

    setTimeout(() => {
      celebrationAnim.setValue(0);
      if (currentFruitIndex < totalFruits - 1) {
        nextFruit();
      } else {
        setGameFinished(true);
      }
    }, 2000);
  };

  const nextFruit = () => {
    setShowSuccess(false);
    setCurrentFruitIndex(prev => prev + 1);
    fruitPosition.setValue({ x: startX, y: startY });
    fruitScale.setValue(1);
    pathOpacity.setValue(0);
  };

  // --- DATABASE & COMPLETION ---
  const sendToDatabase = async () => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Observation game: 100% success rate if completed
    const safeAnswered = answeredCount > 0 ? answeredCount : 1;
    const successRate = 100; 

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'fruit_basket',
        level: 1,
        score: score, // score incremented in handleFruitSuccess
        max_score: totalFruits,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: 0,
        success_rate: successRate,
        details: {
          totalQuestions: totalFruits,
          answeredCount: safeAnswered,
          wrongCount: 0,
          successRate: 100,
        },
        completed: true,
      });
    } catch (err) {
      console.log('❌ Error sending game result:', err);
    }
  };

  useEffect(() => {
    if (gameFinished) {
      (async () => {
        await sendToDatabase();
        handleGameCompletion();
      })();
    }
  }, [gameFinished]);

  const restartGame = () => {
    isFinishedRef.current = false;
    setCurrentFruitIndex(0);
    setScore(0);
    setAnsweredCount(0);
    setShowSuccess(false);
    setGameFinished(false);
    fruitPosition.setValue({ x: startX, y: startY });
    fruitScale.setValue(1);
    pathOpacity.setValue(0);
    gameStartTimeRef.current = Date.now();
  };

  const handleGameCompletion = () => {
    isFinishedRef.current = true;
    Tts.stop();

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: restartGame,
    });

    gameNav.showCompletionMessage(
      score,
      totalFruits,
      'Amazing! All fruits are in the basket!'
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  return (
    <View style={[styles.container, { backgroundColor: currentFruit.color + '15' }]}>
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🍎 Fruit Basket</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>🍎 {score}/{totalFruits}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { 
                  width: `${((currentFruitIndex + 1) / totalFruits) * 100}%`,
                  backgroundColor: currentFruit.color 
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Fruit {currentFruitIndex + 1} of {totalFruits}</Text>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          {/* Instruction */}
          <View style={[styles.instructionCard, { borderColor: currentFruit.color }]}>
            <Text style={styles.instructionEmoji}>👀</Text>
            <Text style={styles.instructionText}>
              Watch the {currentFruit.name} go to the basket!
            </Text>
          </View>

          {/* Path Line */}
          <Animated.View
            style={[
              styles.pathLine,
              {
                opacity: pathOpacity,
                left: startX + FRUIT_SIZE / 2,
                top: startY + FRUIT_SIZE / 2,
                width: endX - startX,
              },
            ]}
          >
            <View style={[styles.dottedLine, { borderColor: currentFruit.color }]} />
          </Animated.View>

          {/* Fruit */}
          <Animated.View
            style={[
              styles.fruitContainer,
              {
                transform: [
                  { translateX: fruitPosition.x },
                  { translateY: fruitPosition.y },
                  { scale: fruitScale },
                ],
              },
            ]}
          >
            <View style={[styles.fruitCircle, { backgroundColor: currentFruit.color + '30' }]}>
              <Text style={styles.fruitEmoji}>{currentFruit.emoji}</Text>
            </View>
          </Animated.View>

          {/* Basket */}
          <Animated.View
            style={[
              styles.basketContainer,
              {
                left: endX,
                top: endY,
                transform: [{ scale: basketScale }],
              },
            ]}
          >
            <View style={styles.basketCircle}>
              <Text style={styles.basketEmoji}>🧺</Text>
            </View>
            <Text style={styles.basketLabel}>BASKET</Text>
          </Animated.View>

          {/* Success Message */}
          {showSuccess && (
            <Animated.View 
              style={[
                styles.successMessage,
                {
                  transform: [
                    {
                      scale: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                  opacity: celebrationAnim,
                },
              ]}
            >
              <Text style={styles.successText}>🎉 Perfect! 🎉</Text>
            </Animated.View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.encouragementText}>
            {currentFruitIndex < 2 && "Great focus! 🌟"}
            {currentFruitIndex >= 2 && currentFruitIndex < 4 && "You're doing amazing! ⭐"}
            {currentFruitIndex >= 4 && "Almost done! 🎯"}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    color: '#81C784',
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
    backgroundColor: '#81C784',
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 3,
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
  },
  pathLine: {
    position: 'absolute',
    height: 4,
    zIndex: 1,
  },
  dottedLine: {
    width: '100%',
    height: 4,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 1,
  },
  fruitContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  fruitCircle: {
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
    borderRadius: FRUIT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fruitEmoji: {
    fontSize: FRUIT_SIZE * 0.6,
  },
  basketContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  basketCircle: {
    width: BASKET_SIZE,
    height: BASKET_SIZE,
    borderRadius: BASKET_SIZE / 2,
    backgroundColor: '#FFF8E1',
    borderWidth: 4,
    borderColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  basketEmoji: {
    fontSize: BASKET_SIZE * 0.5,
  },
  basketLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginTop: 10,
  },
  successMessage: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
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

export default FruitBasketLevel1;