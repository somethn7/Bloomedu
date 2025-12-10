// -umut: LEVEL 1 SortNumbersLevel1 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların sayıları küçükten büyüğe sıralama becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir (wrong_count, success_rate)
// DÜZELTME: Skor ve Başarı oranı "Sayı Başına" değil "Tur Başına" (Sıralama Başına) hesaplanır.

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
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width } = Dimensions.get('window');
const DROP_SIZE = Math.min(width * 0.16, 80);
const CARD_SIZE = Math.min(width * 0.16, 75);

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
  gameSequence?: any[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

type NumberItem = {
  id: string;
  value: number;
  color: string;
  emoji: string;
};

const COLORS = [
  { color: '#FF6B9A', emoji: '🔹' },
  { color: '#4ECDC4', emoji: '⭐' },
  { color: '#45B7D1', emoji: '✨' },
  { color: '#96CEB4', emoji: '🎯' },
  { color: '#FFEAA7', emoji: '🎈' },
];

const TOTAL_ROUNDS = 3;
const NUMBERS_PER_ROUND = 5;

export default function SortNumbersLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [round, setRound] = useState(1);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [sortedOrder, setSortedOrder] = useState<number[]>([]);
  const [correctOrder, setCorrectOrder] = useState<number[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0); // Tamamlanan Tur Sayısı
  const [wrongCount, setWrongCount] = useState(0);
  
  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // --- INIT & TTS ---
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.3);
        await Tts.setDefaultPitch(1.0);
      } catch {}
    };
    initTts();

    startNewRound();

    return () => {
      Tts.stop();
    };
  }, []);

  const generateNumbers = (count: number): NumberItem[] => {
    const startNum = Math.floor(Math.random() * (10 - count + 1)) + 1; 
    const range = Array.from({ length: count }, (_, i) => startNum + i);
    setCorrectOrder([...range]); 
    const shuffled = range.sort(() => Math.random() - 0.5);

    return shuffled.map((num, idx) => ({
      id: `num-${num}-${Math.random()}`,
      value: num,
      color: COLORS[(num - 1) % COLORS.length].color,
      emoji: COLORS[(num - 1) % COLORS.length].emoji,
    }));
  };

  const startNewRound = () => {
    setSortedOrder([]);
    const newNumbers = generateNumbers(NUMBERS_PER_ROUND);
    setNumbers(newNumbers);
    
    setTimeout(() => {
      Tts.speak('Arrange the numbers in order.');
    }, 500);
  };

  // --- INTERACTION ---
  const handleNumberPress = (item: NumberItem) => {
    if (gameFinished) return;
    
    if (sortedOrder.includes(item.value)) return;

    const nextExpected = correctOrder[sortedOrder.length];

    if (item.value === nextExpected) {
      // ✅ DOĞRU HAMLE (Ama puan vermiyoruz, sadece ilerleme)
      const newOrder = [...sortedOrder, item.value];
      setSortedOrder(newOrder);
      Tts.speak(`${item.value}`);

      // Tur bitti mi? (Sıralama tamamlandı mı?)
      if (newOrder.length === numbers.length) {
        handleRoundComplete();
      }
    } else {
      // ❌ YANLIŞ HAMLE
      setWrongCount(prev => prev + 1);
      triggerShake();
      Tts.speak('Try again');
    }
  };

  const handleDropZonePress = (index: number) => {
    if (sortedOrder[index] !== undefined) {
      const newOrder = sortedOrder.filter((_, i) => i !== index);
      setSortedOrder(newOrder);
    }
  };

  const handleRoundComplete = () => {
    // Tur tamamlandığı an 1 puan kazanılır (Hamle başı değil, Sıralama başı)
    const newScore = score + 1;
    setScore(newScore);
    Tts.speak('Great job!');

    setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        setRound(prev => prev + 1);
        startNewRound();
      } else {
        setGameFinished(true);
        completeGame(newScore); // Güncel skoru (örn: 3) gönder
      }
    }, 1500);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleHearAgain = () => {
    Tts.stop();
    Tts.speak('Arrange the numbers in order.');
  };

  // --- DATABASE & COMPLETION ---
  const completeGame = async (finalScore?: number) => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    const scoreToUse = finalScore !== undefined ? finalScore : score;
    
    // DÜZELTİLDİ: Başarı Oranı Hesabı
    // "Her bir sıralama 1 hamle sayılır."
    // Toplam Görev = TOTAL_ROUNDS (3)
    // Başarı Oranı = (Doğru Tur Sayısı / (Doğru Tur Sayısı + Hatalı Denemeler)) * 100
    // Örnek: 3 Turu bitirdi, 1 kere yanlış bastı. (3 / (3+1)) * 100 = %75.
    const totalAttempts = TOTAL_ROUNDS + wrongCount;
    const successRate = Math.round((TOTAL_ROUNDS / totalAttempts) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'numbers-sort',
        level: 1,
        score: scoreToUse, // Tamamlanan Tur Sayısı
        max_score: TOTAL_ROUNDS,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalRounds: TOTAL_ROUNDS,
          wrongCount,
          successRate,
        },
        completed: true,
      });
    } catch (err) {
      console.log('❌ Error sending game result:', err);
    }

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setRound(1);
        setScore(0);
        setWrongCount(0);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
        startNewRound();
      },
    });

    let completionMessage = '';
    if (scoreToUse === TOTAL_ROUNDS) {
      completionMessage = '🎉 Perfect! You sorted all numbers!';
    } else {
      completionMessage = 'Good job! Keep practicing!';
    }

    gameNav.showCompletionMessage(
      scoreToUse,
      TOTAL_ROUNDS,
      completionMessage
    );
  };

  // Render için başarı oranı (Anlık gösterim)
  const renderSuccessRate = Math.round((score / (score + wrongCount)) * 100);
  const displaySuccessRate = isNaN(renderSuccessRate) ? 100 : renderSuccessRate;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🔢 Sort Numbers</Text>
            <Text style={styles.subtitle}>Level 1</Text>
          </View>
          <View style={styles.progressBox}>
            <Text style={styles.questionCounter}>
              Round {round}/{TOTAL_ROUNDS}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(round / TOTAL_ROUNDS) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* SCORE CARDS */}
          <View style={styles.scoreCards}>
            <View style={[styles.scoreCard, styles.correctCard]}>
              <Text style={styles.scoreEmoji}>🎯</Text>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreLabel}>Rounds</Text>
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

          {/* INSTRUCTION */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Smallest ➡️ Largest</Text>
            <TouchableOpacity style={styles.replayButton} onPress={handleHearAgain}>
              <Text style={styles.replayButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* DROP ZONES */}
          <Animated.View
            style={[
              styles.dropZoneContainer,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {correctOrder.map((expectedVal, idx) => {
              const placedValue = sortedOrder[idx];
              const isCorrect = placedValue === expectedVal;
              return (
                <TouchableOpacity
                  key={`drop-${idx}`}
                  style={[
                    styles.dropZone,
                    placedValue !== undefined && styles.dropZoneFilled,
                    isCorrect && placedValue !== undefined && styles.dropZoneCorrect,
                  ]}
                  onPress={() => handleDropZonePress(idx)}
                  activeOpacity={0.8}
                >
                  {placedValue !== undefined ? (
                    <View style={[styles.placedNumber, { backgroundColor: COLORS[(placedValue - 1) % COLORS.length].color }]}>
                      <Text style={styles.dropText}>{placedValue}</Text>
                    </View>
                  ) : (
                    <Text style={styles.dropHint}>{idx + 1}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          {/* NUMBER CARDS */}
          <View style={styles.numbersContainer}>
            {numbers.map((item) => {
              const isPlaced = sortedOrder.includes(item.value);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.numberCard,
                    {
                      backgroundColor: isPlaced ? '#E0E0E0' : item.color,
                      opacity: isPlaced ? 0.3 : 1,
                    },
                  ]}
                  onPress={() => !isPlaced && handleNumberPress(item)}
                  disabled={isPlaced}
                  activeOpacity={0.7}
                >
                  <Text style={styles.numberEmoji}>{item.emoji}</Text>
                  <Text style={styles.numberText}>{item.value}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
  },
  progressBox: {
    alignItems: 'flex-end',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6B6B',
    marginBottom: 5,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#74C0FC',
    borderRadius: 10,
  },
  scoreCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  scoreEmoji: { fontSize: 18, marginBottom: 2 },
  scoreNumber: { fontSize: 20, fontWeight: '700', color: '#4A4A4A' },
  scoreLabel: { fontSize: 10, color: '#999', fontWeight: '500' },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  replayButton: {
    backgroundColor: '#E7F5FF',
    padding: 8,
    borderRadius: 20,
  },
  replayButtonText: { fontSize: 18 },
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  dropZone: {
    width: DROP_SIZE,
    height: DROP_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#85C1E9',
    borderStyle: 'dashed',
    backgroundColor: '#E8F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneFilled: {
    borderStyle: 'solid',
    borderColor: '#4ECDC4',
    backgroundColor: '#fff',
    elevation: 2,
  },
  dropZoneCorrect: {
    borderColor: '#51CF66',
    backgroundColor: '#EBFBEE',
  },
  dropHint: {
    fontSize: 14,
    color: '#85C1E9',
    fontWeight: '600',
  },
  placedNumber: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  numberCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numberEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});