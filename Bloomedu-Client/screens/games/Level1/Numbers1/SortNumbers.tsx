import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
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
  // Generate random numbers between 1-10 (not necessarily consecutive)
  const pool = Array.from({ length: 10 }, (_, i) => i + 1);
  const selected: number[] = [];
  
  // Pick random numbers (not necessarily consecutive)
  while (selected.length < count) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const num = pool[randomIndex];
    if (!selected.includes(num)) {
      selected.push(num);
    }
  }
  
  // Shuffle the selected numbers
  const shuffled = selected.sort(() => Math.random() - 0.5);
  
  return shuffled.map((num, idx) => ({
    id: `num-${num}-${Math.random()}`,
    value: num,
    color: COLORS[(num - 1) % COLORS.length].color,
    emoji: COLORS[(num - 1) % COLORS.length].emoji,
    position: {
      x: 50 + (idx % 3) * 100,
      y: 200 + Math.floor(idx / 3) * 120,
    },
  }));
};

const SortNumbers = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  
  const [numbers, setNumbers] = useState<NumberItem[]>(() => generateNumbers(5));
  const [sortedOrder, setSortedOrder] = useState<number[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [shakeAnim] = useState(new Animated.Value(0));
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const correctOrder = numbers.map((n) => n.value).sort((a, b) => a - b);

  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.8);
    Tts.setDefaultPitch(1.2);
    Tts.setDefaultVoice('en-US');
    Tts.setIgnoreSilentSwitch('ignore');
    setTimeout(() => {
      try {
        Tts.speak('Let\'s arrange the numbers in order.');
      } catch {}
    }, 500);
  }, []);

  useEffect(() => {
    if (sortedOrder.length === numbers.length) {
      const isCorrect = sortedOrder.every((val, idx) => val === correctOrder[idx]);
      if (isCorrect) {
        try {
          Vibration.vibrate(150);
        } catch {}
        const min = correctOrder[0];
        const max = correctOrder[correctOrder.length - 1];
        try {
          Tts.speak(`Perfect! We sorted from ${min} to ${max}!`);
        } catch {}
        setTimeout(() => {
          const totalTime = Date.now() - gameStartTime;
          const gameResult = {
            correctAnswers: 1,
            totalQuestions: 1,
            totalTime: totalTime,
          };
          
          // Send to database
          sendToDatabase(gameResult);
          
          Alert.alert('🎉 Amazing!', 'You sorted the numbers correctly!', [
            { text: 'Play Again', onPress: () => resetGame() },
            { text: 'Next Game', onPress: () => navigation.navigate('MatchNumbers', { child }) },
            { text: 'Back', onPress: () => navigation.goBack() },
          ]);
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
          Vibration.vibrate([0, 50, 100, 50]);
        } catch {}
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
    
    try {
      const response = await fetch('http://10.0.2.2:3000/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          game_type: 'sort_numbers',
          level: 1,
          score: data.correctAnswers,
          max_score: data.totalQuestions,
          duration_seconds: Math.floor(data.totalTime / 1000),
          completed: true,
        }),
      });

      if (!response.ok) {
        console.error('❌ Backend error. Response status:', response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ Sort Numbers game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const resetGame = () => {
    setNumbers(generateNumbers(3));
    setSortedOrder([]);
    setDraggedId(null);
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
    try {
      Vibration.vibrate(30);
    } catch {}
  };

  const handleDropZonePress = (index: number) => {
    if (sortedOrder[index] !== undefined) {
      // Remove from this position
      const newOrder = sortedOrder.filter((_, i) => i !== index);
      setSortedOrder(newOrder);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Level 3 — Sort Numbers</Text>
        <TouchableOpacity style={styles.reset} onPress={resetGame}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

        <Text style={styles.subtitle}>Arrange numbers from smallest to largest 👇</Text>

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
                  <Text style={styles.dropHint}>{idx + 1}st</Text>
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
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 30,
    gap: 15,
  },
  dropZone: {
    width: 90,
    height: 90,
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
    gap: 15,
  },
  numberCard: {
    width: 80,
    height: 80,
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

export default SortNumbers;