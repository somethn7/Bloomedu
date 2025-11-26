import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';
import { sendGameResult } from '../../../config/api';

const { width } = Dimensions.get('window');
const DROP_SIZE = Math.min(width * 0.18, 90);
const CARD_SIZE = Math.min(width * 0.18, 80);

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
  position: { x: number; y: number };
};

const COLORS = [
  { color: '#FF6B9A', emoji: '🔹' },
  { color: '#4ECDC4', emoji: '⭐' },
  { color: '#45B7D1', emoji: '✨' },
  { color: '#96CEB4', emoji: '🎯' },
  { color: '#FFEAA7', emoji: '🎈' },
];

const generateNumbers = (count: number): NumberItem[] => {
  // 5 uzunluğunda artan ardışık bir aralık seç (ör: 1-5, 3-7, 5-9, 6-10)
  const startNum = Math.floor(Math.random() * (10 - count + 1)) + 1; // 1..6
  const range = Array.from({ length: count }, (_, i) => startNum + i);

  // Shuffle for initial cards layout
  const shuffled = range.sort(() => Math.random() - 0.5);

  return shuffled.map((num, idx) => ({
    id: `num-${num}-${Math.random()}`,
    value: num,
    color: COLORS[(num - 1) % COLORS.length].color,
    emoji: COLORS[(num - 1) % COLORS.length].emoji,
    position: {
      x: 0,
      y: 0,
    },
  }));
};

const SortNumbersLevel1 = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  const gameSequence = (route.params as RouteParams)?.gameSequence;
  const currentGameIndex = (route.params as RouteParams)?.currentGameIndex ?? -1;
  const categoryTitle = (route.params as RouteParams)?.categoryTitle;
  
  const [numbers, setNumbers] = useState<NumberItem[]>(() => generateNumbers(5));
  const [sortedOrder, setSortedOrder] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const totalRounds = 3; // 3-4 tekrar: min 3; istenirse 4'e çıkarılabilir
  const [shakeAnim] = useState(new Animated.Value(0));
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const correctOrder = numbers.map((n) => n.value).sort((a, b) => a - b);

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
        await Tts.setDefaultPitch(1.0);
        setTimeout(() => {
          Tts.speak('Let\'s arrange the numbers in order.');
        }, 600);
      } catch {}
    };
    initTts();
  }, []);

  useEffect(() => {
    if (sortedOrder.length === numbers.length) {
      const isCorrect = sortedOrder.every((val, idx) => val === correctOrder[idx]);
      if (isCorrect) {
        const min = correctOrder[0];
        const max = correctOrder[correctOrder.length - 1];
        try {
          Tts.speak(`Perfect! We sorted from ${min} to ${max}!`);
        } catch {}
        setTimeout(() => {
          if (round < totalRounds) {
            // Bir sonraki varyasyona geç
            setRound(round + 1);
            setNumbers(generateNumbers(5));
            setSortedOrder([]);
          } else {
            const totalTime = Date.now() - gameStartTime;
            const gameResult = {
              correctAnswers: totalRounds,
              totalQuestions: totalRounds,
              totalTime: totalTime,
            };
            sendToDatabase(gameResult);

            const gameNav = createGameCompletionHandler({
              navigation,
              child,
              gameSequence,
              currentGameIndex,
              categoryTitle,
              resetGame,
            });
            gameNav.showCompletionMessage(
              totalRounds,
              totalRounds,
              gameNav.getCompletionMessage()
            );
          }
        }, 1500);
      } else {
        // Wrong order
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
        try {
          Tts.speak('Please try again');
        } catch {}
        setTimeout(() => {
          setSortedOrder([]);
        }, 1000);
      }
    }
  }, [sortedOrder, numbers.length]);

  const sendToDatabase = async (data: any) => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }
    
    await sendGameResult({
      child_id: child.id,
      game_type: 'numbers-sort',
      level: 1,
      score: data.correctAnswers,
      max_score: data.totalQuestions,
      duration_seconds: Math.floor(data.totalTime / 1000),
      completed: true,
    });
  };

  const resetGame = () => {
    setNumbers(generateNumbers(5));
    setSortedOrder([]);
    setRound(1);
    setGameStartTime(Date.now());
    setTimeout(() => {
      try {
        Tts.speak('Let\'s arrange the numbers in order.');
      } catch {}
    }, 500);
  };

  const handleNumberPress = (item: NumberItem) => {
    if (sortedOrder.includes(item.value)) return;
    setSortedOrder([...sortedOrder, item.value]);
  };

  const handleDropZonePress = (index: number) => {
    if (sortedOrder[index] !== undefined) {
      const newOrder = sortedOrder.filter((_, i) => i !== index);
      setSortedOrder(newOrder);
    }
  };

  const handleHearAgain = () => {
    try {
      Tts.stop();
      setTimeout(() => {
        Tts.speak('Let\'s arrange the numbers in order.');
      }, 200);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔢 Sort Numbers</Text>
        <TouchableOpacity style={styles.reset} onPress={resetGame}>
          <Text style={styles.resetText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Arrange numbers from smallest to largest 👇</Text>

      <TouchableOpacity style={styles.replayButton} onPress={handleHearAgain}>
        <Text style={styles.replayButtonText}>🔊 Hear again</Text>
      </TouchableOpacity>

      {/* Drop Zones */}
      <Animated.View
        style={[
          styles.dropZoneContainer,
          {
            transform: [{ translateX: shakeAnim }],
          },
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
            >
              {placedValue !== undefined ? (
                <View style={[styles.placedNumber, { backgroundColor: COLORS[(placedValue - 1) % COLORS.length].color }]}>
                  <Text style={styles.dropEmoji}>{COLORS[(placedValue - 1) % COLORS.length].emoji}</Text>
                  <Text style={styles.dropText}>{placedValue}</Text>
                </View>
              ) : (
                <Text style={styles.dropHint}>{idx + 1}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Numbers to drag */}
      <View style={styles.numbersContainer}>
        {numbers.map((item) => {
          const isPlaced = sortedOrder.includes(item.value);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.numberCard,
                {
                  backgroundColor: isPlaced ? '#ccc' : item.color,
                  opacity: isPlaced ? 0.5 : 1,
                },
              ]}
              onPress={() => !isPlaced && handleNumberPress(item)}
              disabled={isPlaced}
            >
              <Text style={styles.numberEmoji}>{item.emoji}</Text>
              <Text style={styles.numberText}>{item.value}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {sortedOrder.length === 0
            ? 'Click numbers to arrange from smallest to largest!'
            : `${sortedOrder.length}/${numbers.length} numbers sorted`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  back: { padding: 8 },
  backText: { color: '#FF6B9A', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: '700', color: '#333' },
  reset: { padding: 8 },
  resetText: { color: '#4ECDC4', fontWeight: 'bold' },
  subtitle: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  replayButton: {
    alignSelf: 'center',
    backgroundColor: '#EAF7F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B8EAE2',
  },
  replayButtonText: { color: '#2E7D74', fontWeight: '700' },
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 30,
    gap: 15,
  },
  dropZone: {
    width: DROP_SIZE,
    height: DROP_SIZE,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#85C1E9',
    borderStyle: 'dashed',
    backgroundColor: '#E8F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneFilled: {
    borderColor: '#96CEB4',
    borderStyle: 'solid',
    backgroundColor: '#fff',
  },
  dropZoneCorrect: {
    borderColor: '#4ECDC4',
    backgroundColor: '#E8F9F5',
  },
  dropHint: {
    fontSize: 12,
    color: '#85C1E9',
    fontWeight: '600',
  },
  placedNumber: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  dropText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: Math.max(10, width * 0.02),
  },
  numberCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  hint: {
    color: '#777',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SortNumbersLevel1;

