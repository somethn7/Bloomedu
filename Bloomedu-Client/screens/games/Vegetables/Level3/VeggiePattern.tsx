import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// ÖRÜNTÜ MANTIĞI DÜZENLENDİ:
// Round 1: ABAB (1-1-1-1)
// Round 2: AABB (2-2)
// Round 3: ABAB (1-1-1-1)
// Round 4: AABB (2-2)
// Round 5: AABB (2-2) -> Havuç-Havuç-Domates-Domates
const PATTERNS = [
  { id: 1, sequence: ['🥕', '🍅', '🥕'], target: '🍅', options: ['🍅', '🥦', '🌽'], hint: "Carrot, Tomato, Carrot... What is next?" },
  { id: 2, sequence: ['🥦', '🥦', '🌽'], target: '🌽', options: ['🌽', '🥕', '🍅'], hint: "Broccoli, Broccoli, Corn... What is next?" },
  { id: 3, sequence: ['🌽', '🥕', '🌽'], target: '🥕', options: ['🥕', '🥦', '🍅'], hint: "Corn, Carrot, Corn... What is next?" },
  { id: 4, sequence: ['🍅', '🍅', '🥦'], target: '🥦', options: ['🥦', '🥕', '🌽'], hint: "Tomato, Tomato, Broccoli... What is next?" },
  { id: 5, sequence: ['🥕', '🥕', '🍅'], target: '🍅', options: ['🍅', '🌽', '🥦'], hint: "Carrot, Carrot, Tomato... What is next?" },
];

const MAX_ROUNDS = 5;

const VeggiePatternLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child: childData, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const currentPattern = PATTERNS[currentRound];

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak(PATTERNS[round].hint);
  }, [feedbackAnim]);

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.4);
        startNewRound(0);
      } catch (err) {
        console.log("TTS error:", err);
      }
    };
    initTts();
    return () => {
      Tts.stop();
    };
  }, [startNewRound]);

  const handleOptionPress = (choice: string) => {
    if (isBusy) return;

    const isCorrect = choice === currentPattern.target;
    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak("Great! Correct!");
      setTimeout(() => {
        if (currentRound < MAX_ROUNDS - 1) {
          const next = currentRound + 1;
          setCurrentRound(next);
          startNewRound(next);
        } else {
          finalizeGame();
        }
      }, 2500);
    } else {
      setWrongCount(w => w + 1);
      Tts.speak("Try again!");
      setTimeout(() => {
        setFeedback(null);
        setIsBusy(false);
        feedbackAnim.setValue(0);
      }, 1500);
    }
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: childData?.id,
        game_type: 'veggie_pattern_logic',
        level: 3,
        score: score + 1,
        max_score: MAX_ROUNDS,
        duration_seconds: duration,
        wrong_count: wrongCount,
        completed: true,
        success_rate: successRate,
        details: {
          rounds_completed: currentRound + 1,
          total_attempts: totalAttempts + 1,
          wrong_count: wrongCount,
          success_rate: successRate,
        },
      } as any);
    } catch (e) { console.log(e); }
    
    createGameCompletionHandler({ navigation, child: childData, gameSequence, currentGameIndex, categoryTitle })
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Logic Master! 🧩');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundText}>Round {currentRound + 1} / {MAX_ROUNDS}</Text>
        <Text style={styles.title}>What comes next? 🤔</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.patternRow}>
          {currentPattern.sequence.map((emoji, index) => (
            <React.Fragment key={index}>
              <View style={styles.patternBox}>
                <Text style={styles.emoji}>{emoji}</Text>
              </View>
              <Text style={styles.arrowIndicator}>➔</Text>
            </React.Fragment>
          ))}
          
          <View style={[styles.patternBox, styles.targetBox]}>
            {feedback === 'success' ? (
              <Text style={styles.emoji}>{currentPattern.target}</Text>
            ) : (
              <Text style={styles.questionMark}>?</Text>
            )}
          </View>
        </View>

        {feedback && (
          <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
            <Text style={styles.feedbackEmoji}>{feedback === 'success' ? '✅' : '❌'}</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.palette}>
        <Text style={styles.paletteTitle}>Pick the right veggie:</Text>
        <View style={styles.optionsRow}>
          {currentPattern.options.map((emoji, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.optionCard} 
              onPress={() => handleOptionPress(emoji)}
              disabled={isBusy}
            >
              <Text style={styles.optionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  header: { alignItems: 'center', paddingTop: 30 },
  roundText: { fontSize: 18, fontWeight: 'bold', color: '#888' },
  title: { fontSize: 26, fontWeight: '900', color: '#333', marginTop: 10 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  patternRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 25, 
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  patternBox: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 },
  arrowIndicator: { fontSize: 20, color: '#BDC3C7', fontWeight: 'bold', marginHorizontal: 2 },
  targetBox: { 
    borderWidth: 3, 
    borderColor: '#FF6B9A', 
    borderStyle: 'dashed', 
    borderRadius: 15, 
    backgroundColor: '#FFF0F5' 
  },
  emoji: { fontSize: 40 },
  questionMark: { fontSize: 35, color: '#FF6B9A', fontWeight: 'bold' },
  feedbackOverlay: { position: 'absolute', zIndex: 10 },
  feedbackEmoji: { fontSize: 100 },
  palette: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, elevation: 20 },
  paletteTitle: { fontSize: 18, fontWeight: 'bold', color: '#AAA', textAlign: 'center', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  optionCard: { 
    width: 85, 
    height: 85, 
    backgroundColor: '#F8F9FA', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  optionEmoji: { fontSize: 45 },
});

export default VeggiePatternLevel3;