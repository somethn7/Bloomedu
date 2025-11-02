import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';

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

type Card = {
  id: string;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
};

const generatePairs = (): Card[] => {
  // pick 4 unique numbers from 1..6 for Level 2
  const pool = [1, 2, 3, 4, 5, 6];
  const selected: number[] = [];
  while (selected.length < 4) {
    const idx = Math.floor(Math.random() * pool.length);
    const num = pool.splice(idx, 1)[0];
    selected.push(num);
  }
  const cards: Card[] = [];
  selected.forEach((n) => {
    cards.push({ id: `${n}-a-${Math.random()}`, value: n, isFlipped: false, isMatched: false });
    cards.push({ id: `${n}-b-${Math.random()}`, value: n, isFlipped: false, isMatched: false });
  });
  // shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

const MatchNumbersLevel2 = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  const gameSequence = (route.params as RouteParams)?.gameSequence;
  const currentGameIndex = (route.params as RouteParams)?.currentGameIndex ?? -1;
  const categoryTitle = (route.params as RouteParams)?.categoryTitle;
  
  const [cards, setCards] = useState<Card[]>(() => generatePairs());
  const [firstPick, setFirstPick] = useState<Card | null>(null);
  const [secondPick, setSecondPick] = useState<Card | null>(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [matches, setMatches] = useState(0);
  const [pulse] = useState(new Animated.Value(1));
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const totalPairs = 4;

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
        await Tts.setDefaultPitch(1.0);
        setTimeout(() => {
          Tts.speak('Match the same numbers');
        }, 600);
      } catch {}
    };
    initTts();
    
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

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
          game_type: 'numbers-match',
          level: 2,
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
        console.log('✅ Match Numbers game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (matches === totalPairs) {
      const totalTime = Date.now() - gameStartTime;
      const gameResult = {
        correctAnswers: matches,
        totalQuestions: totalPairs,
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
      
      Alert.alert('🎉 Amazing!', gameNav.getCompletionMessage(), gameNav.createCompletionButtons());
    }
  }, [matches]);

  const resetGame = () => {
    const fresh = generatePairs();
    setCards(fresh);
    setFirstPick(null);
    setSecondPick(null);
    setLockBoard(false);
    setMatches(0);
    setGameStartTime(Date.now());
    setTimeout(() => {
      try {
        Tts.speak('Match the same numbers');
      } catch {}
    }, 500);
  };

  const onCardPress = (card: Card) => {
    if (lockBoard || card.isMatched || card.isFlipped) return;

    const next = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(next);

    if (!firstPick) {
      setFirstPick({ ...card, isFlipped: true });
      return;
    }

    if (!secondPick) {
      const picked = next.find((c) => c.id === card.id)!;
      setSecondPick(picked);
      setLockBoard(true);

      if (firstPick.value === picked.value) {
        // match
        const withMatch = next.map((c) =>
          c.value === picked.value ? { ...c, isMatched: true } : c
        );
        setTimeout(() => {
          setCards(withMatch);
          setMatches((m) => m + 1);
          setFirstPick(null);
          setSecondPick(null);
          setLockBoard(false);
          try { Tts.speak(`Great! ${picked.value} and ${picked.value} are the same!`); } catch {}
        }, 300);
      } else {
        // not a match
        setTimeout(() => {
          const reverted = next.map((c) =>
            c.id === picked.id || c.id === firstPick.id ? { ...c, isFlipped: false } : c
          );
          setCards(reverted);
          setFirstPick(null);
          setSecondPick(null);
          setLockBoard(false);
          try { Tts.speak('Please try again'); } catch {}
        }, 600);
      }
    }
  };

  const handleHearAgain = () => {
    try {
      Tts.stop();
      setTimeout(() => {
        Tts.speak('Match the same numbers');
      }, 200);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔢 Match Numbers</Text>
        <TouchableOpacity style={styles.reset} onPress={resetGame}>
          <Text style={styles.resetText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Matches: {matches}/{totalPairs}</Text>
      </View>

      <Text style={styles.subtitle}>Match the same numbers 👇</Text>

      <TouchableOpacity style={styles.replayButton} onPress={handleHearAgain}>
        <Text style={styles.replayButtonText}>🔊 Hear again</Text>
      </TouchableOpacity>

      <View style={styles.grid}>
        {cards.map((card) => {
          return (
            <Animated.View key={card.id} style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                style={[styles.card, card.isMatched && styles.cardMatched]}
                onPress={() => onCardPress(card)}
                activeOpacity={0.9}
                disabled={lockBoard || card.isMatched}
              >
                <View style={styles.face}>
                  <Text style={styles.valueText}>
                    {card.isFlipped || card.isMatched ? card.value : '❓'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Find all {totalPairs} pairs to win!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  scoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#4ECDC4' },
  subtitle: { textAlign: 'center', marginVertical: 16, color: '#555', fontWeight: '600' },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  card: {
    width: 100,
    height: 120,
    marginVertical: 8,
    borderRadius: 14,
    backgroundColor: '#85C1E9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardMatched: { backgroundColor: '#96CEB4' },
  face: { alignItems: 'center', justifyContent: 'center' },
  valueText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: { alignItems: 'center', paddingVertical: 24 },
  hint: { color: '#777', fontWeight: '600' },
});

export default MatchNumbersLevel2;

