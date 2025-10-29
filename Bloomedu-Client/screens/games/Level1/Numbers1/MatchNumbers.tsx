import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Vibration } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
}

type Card = {
  id: string;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
};

const generatePairs = (): Card[] => {
  // pick 3 unique numbers from 1..5
  const pool = [1, 2, 3, 4, 5];
  const selected: number[] = [];
  while (selected.length < 3) {
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

const MatchNumbers = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  
  const [cards, setCards] = useState<Card[]>(() => generatePairs());
  const [firstPick, setFirstPick] = useState<Card | null>(null);
  const [secondPick, setSecondPick] = useState<Card | null>(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [matches, setMatches] = useState(0);
  const [pulse] = useState(new Animated.Value(1));
  const [flipMap, setFlipMap] = useState<Record<string, Animated.Value>>({});
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.8);
    Tts.setDefaultPitch(1.2);
    Tts.setDefaultVoice('en-US');
    Tts.setIgnoreSilentSwitch('ignore');
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
          game_type: 'match_numbers',
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
        console.log('✅ Match Numbers game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (matches === 3) {
      try { Vibration.vibrate(150); } catch {}
      
      const totalTime = Date.now() - gameStartTime;
      const gameResult = {
        correctAnswers: matches,
        totalQuestions: 3,
        totalTime: totalTime,
      };
      
      // Send to database
      sendToDatabase(gameResult);
      
      Alert.alert('🎉 Amazing!', 'You found all the pairs!', [
        { text: 'Play Again', onPress: () => resetGame() },
        { text: 'Next Game', onPress: () => navigation.navigate('Education', { child }) },
        { text: 'Back', onPress: () => navigation.goBack() },
      ]);
    }
  }, [matches]);

  const resetGame = () => {
    const fresh = generatePairs();
    const map: Record<string, Animated.Value> = {};
    fresh.forEach((c) => (map[c.id] = new Animated.Value(0)));
    setFlipMap(map);
    setCards(fresh);
    setFirstPick(null);
    setSecondPick(null);
    setLockBoard(false);
    setMatches(0);
    setGameStartTime(Date.now());
  };

  useEffect(() => {
    // initialize flip map for initial set
    const map: Record<string, Animated.Value> = {};
    cards.forEach((c) => (map[c.id] = new Animated.Value(0)));
    setFlipMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCardPress = (card: Card) => {
    if (lockBoard || card.isMatched || card.isFlipped) return;

    const next = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(next);

    if (!firstPick) {
      setFirstPick({ ...card, isFlipped: true });
      try { Vibration.vibrate(30); } catch {}
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
          try { Vibration.vibrate(80); } catch {}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Level 2 — Match Numbers</Text>
        <TouchableOpacity style={styles.reset} onPress={resetGame}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Match the same numbers 👇</Text>

      <View style={styles.grid}>
        {cards.map((card) => {
          const anim = flipMap[card.id] || new Animated.Value(card.isFlipped ? 1 : 0);
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
        <Text style={styles.hint}>Complete 3 matches!</Text>
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
  subtitle: { textAlign: 'center', marginVertical: 16, color: '#555', fontWeight: '600' },
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
  },
  cardMatched: { backgroundColor: '#96CEB4' },
  face: { alignItems: 'center', justifyContent: 'center' },
  hiddenFace: {},
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

export default MatchNumbers;
