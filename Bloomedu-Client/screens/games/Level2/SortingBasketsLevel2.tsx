// -umut: LEVEL 2 SortingBasketsLevel2 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların nesneleri kategorize etme becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir (wrong_count, success_rate)
// Özellikler: Hayvan/Yiyecek ayrımı, Sürükleme benzeri seçim, Sesli geri bildirim, Puan Kırma

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';
import { sendGameResult } from '../../../config/api';

const { width } = Dimensions.get('window');

// Responsive sizing
const ITEM_SIZE = width * 0.35;
const BASKET_SIZE = width * 0.32;

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

interface ItemData {
  id: string;
  name: string;
  emoji: string;
  category: 'food' | 'animal';
}

const CATEGORIES = {
  food: {
    name: 'Foods',
    icon: '🍎',
    color: '#FF6B6B',
    items: [
      { id: 'apple', name: 'Apple', emoji: '🍎' },
      { id: 'banana', name: 'Banana', emoji: '🍌' },
      { id: 'bread', name: 'Bread', emoji: '🍞' },
      { id: 'cheese', name: 'Cheese', emoji: '🧀' },
      { id: 'orange', name: 'Orange', emoji: '🍊' },
    ],
  },
  animal: {
    name: 'Animals',
    icon: '🐶',
    color: '#4ECDC4',
    items: [
      { id: 'cat', name: 'Cat', emoji: '🐱' },
      { id: 'dog', name: 'Dog', emoji: '🐶' },
      { id: 'cow', name: 'Cow', emoji: '🐮' },
      { id: 'bird', name: 'Bird', emoji: '🐦' },
      { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
    ],
  },
};

const createShuffledItems = (): ItemData[] => {
  const allItems: ItemData[] = [
    ...CATEGORIES.food.items.map(item => ({ ...item, category: 'food' as const })),
    ...CATEGORIES.animal.items.map(item => ({ ...item, category: 'animal' as const })),
  ];
  return allItems.sort(() => Math.random() - 0.5);
};

export default function SortingBasketsLevel2({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as any) || {};

  // Game State
  const [items] = useState<ItemData[]>(createShuffledItems());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | ''>('');
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const itemScale = useRef(new Animated.Value(1)).current;
  const itemShake = useRef(new Animated.Value(0)).current;
  const basketPulseFood = useRef(new Animated.Value(1)).current;
  const basketPulseAnimal = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const currentItem = items[currentIndex] || items[items.length - 1]; 
  const totalQuestions = items.length;

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    // Pulse loops
    const pulseLoop = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.08, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    pulseLoop(basketPulseFood, 1200);
    pulseLoop(basketPulseAnimal, 1500);

    return () => {
      Tts.stop();
    };
  }, []);

  // --- INSTRUCTION ---
  useEffect(() => {
    if (!gameFinished && currentItem) {
      setTimeout(() => {
        speakInstruction();
      }, 500);
    }
  }, [currentIndex, gameFinished]);

  const speakInstruction = () => {
    if (currentItem && !gameFinished) {
      Tts.speak(`Where does the ${currentItem.name} belong?`);
    }
  };

  // --- INTERACTION ---
  const handleBasketTap = (tappedCategory: 'food' | 'animal') => {
    if (feedback || gameFinished) return;

    if (tappedCategory === currentItem.category) {
      // ✅ Correct Answer
      const newScore = score + 1; // Calculate updated score immediately
      setScore(newScore);
      
      const newAnsweredCount = answeredCount + 1; // Calculate updated count
      setAnsweredCount(newAnsweredCount);

      setFeedback('correct');

      Animated.parallel([
        Animated.sequence([
          Animated.timing(itemScale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
          Animated.timing(itemScale, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      Tts.speak('Correct!');

      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
          setFeedback('');
          itemScale.setValue(1);
          successOpacity.setValue(0);
        } else {
          // Game Over - Pass updated values directly
          setGameFinished(true);
          completeGame(newScore, newAnsweredCount);
        }
      }, 1500);
    } else {
      // ❌ Wrong Answer
      setFeedback('wrong');
      setWrongCount(prev => prev + 1);
      
      // Decrease score (min 0)
      setScore(prev => Math.max(0, prev - 1));

      Animated.sequence([
        Animated.timing(itemShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(itemShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(itemShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(itemShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      Tts.speak('Try again!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const handleHearAgain = () => {
    speakInstruction();
  };

  // --- DATABASE & COMPLETION ---
  const completeGame = async (finalScore?: number, finalAnswered?: number) => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Use passed values or fallback to state (safety check)
    const scoreToUse = finalScore !== undefined ? finalScore : score;
    const answeredToUse = finalAnswered !== undefined ? finalAnswered : answeredCount;

    // Success Rate: (Correct / (Correct + Wrong)) * 100
    // Total attempts = score (net correct) + wrongCount? No.
    // Total attempts = Total Questions + Wrong Attempts.
    const totalAttempts = totalQuestions + wrongCount;
    const successRate = Math.round((totalQuestions / totalAttempts) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'sorting_baskets',
        level: 2,
        score: scoreToUse,
        max_score: totalQuestions,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalQuestions,
          answeredCount: answeredToUse,
          wrongCount,
          successRate,
        },
        completed: true,
      });
    } catch (err) {
      console.log('❌ Error sending game result:', err);
    }

    // Dynamic Message
    let completionMessage = '';
    if (scoreToUse === totalQuestions) {
      completionMessage = 'Amazing! You sorted everything correctly! 🌟';
    } else if (scoreToUse >= totalQuestions * 0.7) {
      completionMessage = 'Great job! You are getting better! 👏';
    } else {
      completionMessage = 'Good try! Keep practicing! 💪';
    }

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setCurrentIndex(0);
        setScore(0);
        setWrongCount(0);
        setAnsweredCount(0);
        setFeedback('');
        itemScale.setValue(1);
        itemShake.setValue(0);
        successOpacity.setValue(0);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
      },
    });

    gameNav.showCompletionMessage(
      scoreToUse,
      totalQuestions,
      completionMessage
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  // Calculate success rate for display (Real-time)
  const displaySuccessRate = answeredCount > 0 ? Math.round((Math.max(score, 0) / answeredCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🧺 Sorting Baskets</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {score}/{totalQuestions}</Text>
          </View>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / totalQuestions) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Item {Math.min(currentIndex + 1, totalQuestions)} of {totalQuestions}</Text>
        </View>

        {/* SCORE CARDS */}
        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, styles.correctCard]}>
            <Text style={styles.scoreEmoji}>✓</Text>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          <View style={[styles.scoreCard, styles.wrongCard]}>
            <Text style={styles.scoreEmoji}>✗</Text>
            <Text style={styles.scoreNumber}>{wrongCount}</Text>
            <Text style={styles.scoreLabel}>Wrong</Text>
          </View>
          <View style={[styles.scoreCard, styles.rateCard]}>
            <Text style={styles.scoreEmoji}>⭐</Text>
            <Text style={styles.scoreNumber}>{displaySuccessRate}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* GAME AREA */}
        <View style={styles.gameArea}>
          
          {/* Instruction */}
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>Where does it belong? 🤔</Text>
            <TouchableOpacity style={styles.hearAgainButton} onPress={handleHearAgain}>
              <Text style={styles.hearAgainText}>🔊 Hear again</Text>
            </TouchableOpacity>
          </View>

          {/* Current Item */}
          <View style={styles.itemSection}>
            <Animated.View
              style={[
                styles.itemCard,
                {
                  transform: [
                    { scale: itemScale },
                    { translateX: itemShake },
                  ],
                  borderColor: feedback === 'wrong' ? '#D84315' : '#00796B',
                },
              ]}
            >
              <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
              <Text style={styles.itemName}>{currentItem.name}</Text>
            </Animated.View>

            {/* Success Message */}
            <Animated.View style={[styles.successMessage, { opacity: successOpacity }]}>
              <Text style={styles.successText}>✨ Perfect! ✨</Text>
            </Animated.View>
          </View>

          {/* Baskets */}
          <View style={styles.basketsSection}>
            <Text style={styles.basketsTitle}>Choose the basket:</Text>
            
            <View style={styles.basketsContainer}>
              {/* Food Basket */}
              <TouchableOpacity
                style={[
                  styles.basket,
                  { 
                    backgroundColor: CATEGORIES.food.color + '15',
                    borderColor: CATEGORIES.food.color 
                  },
                  feedback === 'correct' && currentItem.category === 'food' && styles.correctBasket,
                ]}
                onPress={() => handleBasketTap('food')}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.basketContent,
                    { transform: [{ scale: basketPulseFood }] }
                  ]}
                >
                  <Text style={styles.basketIcon}>{CATEGORIES.food.icon}</Text>
                  <Text style={[styles.basketName, { color: CATEGORIES.food.color }]}>
                    {CATEGORIES.food.name}
                  </Text>
                </Animated.View>
              </TouchableOpacity>

              {/* Animal Basket */}
              <TouchableOpacity
                style={[
                  styles.basket,
                  { 
                    backgroundColor: CATEGORIES.animal.color + '15',
                    borderColor: CATEGORIES.animal.color 
                  },
                  feedback === 'correct' && currentItem.category === 'animal' && styles.correctBasket,
                ]}
                onPress={() => handleBasketTap('animal')}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.basketContent,
                    { transform: [{ scale: basketPulseAnimal }] }
                  ]}
                >
                  <Text style={styles.basketIcon}>{CATEGORIES.animal.icon}</Text>
                  <Text style={[styles.basketName, { color: CATEGORIES.animal.color }]}>
                    {CATEGORIES.animal.name}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00796B',
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
    backgroundColor: '#00796B',
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
    backgroundColor: '#00796B',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  // Score Cards
  scoreCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderTopWidth: 2,
  },
  correctCard: { borderTopColor: '#51CF66' },
  wrongCard: { borderTopColor: '#FF8787' },
  rateCard: { borderTopColor: '#FFD43B' },
  scoreEmoji: { fontSize: 14, fontWeight: '700', color: '#4A4A4A' },
  scoreNumber: { fontSize: 20, fontWeight: '700', color: '#4A4A4A' },
  scoreLabel: { fontSize: 10, color: '#999', marginTop: 1, fontWeight: '500' },
  
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionBox: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  hearAgainButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#00796B',
    borderRadius: 20,
  },
  hearAgainText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  itemCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: '#FFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  itemEmoji: {
    fontSize: ITEM_SIZE * 0.45,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  successMessage: {
    position: 'absolute',
    top: -50,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  basketsSection: {
    flex: 1,
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
    paddingHorizontal: 10,
  },
  basket: {
    width: BASKET_SIZE,
    height: BASKET_SIZE * 1.1,
    borderRadius: 20,
    borderWidth: 4,
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
  basketIcon: {
    fontSize: 56,
    marginBottom: 10,
  },
  basketName: {
    fontSize: 18,
    fontWeight: '700',
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