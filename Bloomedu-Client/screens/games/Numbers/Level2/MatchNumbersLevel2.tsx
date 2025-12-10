// -umut: LEVEL 2 MatchNumbersLevel2 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların hafıza ve sayı eşleştirme becerilerini geliştirir (Memory Game)
// Oyun sonuçları database'e kaydedilir (wrong_count, success_rate)
// Özellikler: 4 Çift (8 Kart), Hafıza mekaniği, Skor takibi

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
const CARD_SIZE = width * 0.2; // Kart boyutu

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
  color: string;
};

const COLORS = ['#FF6B9A', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

const MatchNumbersLevel2 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [cards, setCards] = useState<Card[]>([]);
  const [firstPick, setFirstPick] = useState<Card | null>(null);
  const [secondPick, setSecondPick] = useState<Card | null>(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0); // Matches found
  const [wrongCount, setWrongCount] = useState(0); // Failed attempts
  const [attempts, setAttempts] = useState(0); // Total pair flips

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const totalPairs = 4;

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    startNewGame();

    return () => {
      Tts.stop();
    };
  }, []);

  const startNewGame = () => {
    const generatedCards = generatePairs();
    setCards(generatedCards);
    setScore(0);
    setWrongCount(0);
    setAttempts(0);
    setFirstPick(null);
    setSecondPick(null);
    setLockBoard(false);
    setGameFinished(false);
    gameStartTimeRef.current = Date.now();

    setTimeout(() => {
      Tts.speak('Match the same numbers');
    }, 600);
  };

  const generatePairs = (): Card[] => {
    // 1-10 arasından rastgele 4 sayı seç
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const selected: number[] = [];
    while (selected.length < totalPairs) {
      const idx = Math.floor(Math.random() * pool.length);
      const num = pool.splice(idx, 1)[0];
      selected.push(num);
    }

    const newCards: Card[] = [];
    selected.forEach((n, index) => {
      const color = COLORS[index % COLORS.length];
      newCards.push({ id: `${n}-a-${Math.random()}`, value: n, isFlipped: false, isMatched: false, color });
      newCards.push({ id: `${n}-b-${Math.random()}`, value: n, isFlipped: false, isMatched: false, color });
    });

    // Shuffle
    return newCards.sort(() => Math.random() - 0.5);
  };

  // --- INTERACTION ---
  const onCardPress = (card: Card) => {
    if (lockBoard || card.isMatched || card.isFlipped) return;

    // Flip animation logic (implied by state change)
    const newCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    if (!firstPick) {
      // First card flipped
      setFirstPick({ ...card, isFlipped: true });
    } else {
      // Second card flipped
      setSecondPick({ ...card, isFlipped: true });
      setLockBoard(true);
      setAttempts(prev => prev + 1);

      checkForMatch(firstPick, card, newCards);
    }
  };

  const checkForMatch = (card1: Card, card2: Card, currentCards: Card[]) => {
    if (card1.value === card2.value) {
      // ✅ MATCH
      Tts.speak(`Great! ${card1.value}!`);
      setTimeout(() => {
        const matchedCards = currentCards.map((c) =>
          c.value === card1.value ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);
        setScore(prev => prev + 1);
        resetTurn();

        // Check Game Over
        if (matchedCards.every(c => c.isMatched)) {
          setGameFinished(true);
        }
      }, 500);
    } else {
      // ❌ NO MATCH
      setWrongCount(prev => prev + 1);
      setTimeout(() => {
        const resetCards = currentCards.map((c) =>
          c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
        );
        setCards(resetCards);
        resetTurn();
        Tts.speak('Try again');
      }, 1000);
    }
  };

  const resetTurn = () => {
    setFirstPick(null);
    setSecondPick(null);
    setLockBoard(false);
  };

  const handleHearAgain = () => {
    Tts.speak('Match the same numbers');
  };

  // --- DATABASE & COMPLETION ---
  const sendToDatabase = async () => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Başarı oranı: (Toplam Eşleşme / Toplam Deneme) * 100
    // Eğer hiç deneme yapılmadıysa 0
    const safeAttempts = attempts > 0 ? attempts : 1;
    const successRate = Math.round((totalPairs / safeAttempts) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'numbers-match',
        level: 2,
        score: score,
        max_score: totalPairs,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalPairs,
          attempts,
          wrongCount,
          successRate,
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

  const handleGameCompletion = () => {
    Tts.stop();
    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: startNewGame,
    });

    gameNav.showCompletionMessage(
      score,
      totalPairs,
      '🎉 Amazing! You found all pairs!'
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  const currentSuccessRate = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🔢 Memory Match</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {score}/{totalPairs}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* SCORE CARDS */}
          <View style={styles.scoreCards}>
            <View style={[styles.scoreCard, styles.correctCard]}>
              <Text style={styles.scoreEmoji}>🎯</Text>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreLabel}>Pairs</Text>
            </View>
            <View style={[styles.scoreCard, styles.wrongCard]}>
              <Text style={styles.scoreEmoji}>✗</Text>
              <Text style={styles.scoreNumber}>{wrongCount}</Text>
              <Text style={styles.scoreLabel}>Misses</Text>
            </View>
            <View style={[styles.scoreCard, styles.rateCard]}>
              <Text style={styles.scoreEmoji}>⭐</Text>
              <Text style={styles.scoreNumber}>{currentSuccessRate}%</Text>
              <Text style={styles.scoreLabel}>Success</Text>
            </View>
          </View>

          {/* INSTRUCTION */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Find the matching numbers!</Text>
            <TouchableOpacity style={styles.replayButton} onPress={handleHearAgain}>
              <Text style={styles.replayButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* GRID */}
          <View style={styles.grid}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  card.isFlipped || card.isMatched ? { backgroundColor: card.color } : styles.cardHidden,
                  card.isMatched && styles.cardMatched
                ]}
                onPress={() => onCardPress(card)}
                activeOpacity={0.8}
                disabled={card.isFlipped || card.isMatched || lockBoard}
              >
                <Text style={styles.cardText}>
                  {card.isFlipped || card.isMatched ? card.value : '❓'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  // Score Cards
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
  
  // Instruction
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

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHidden: {
    backgroundColor: '#85C1E9',
  },
  cardMatched: {
    opacity: 0.6,
  },
  cardText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default MatchNumbersLevel2;