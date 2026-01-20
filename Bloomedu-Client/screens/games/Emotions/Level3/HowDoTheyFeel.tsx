import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// HİKAYE VE DUYGU VERİLERİ
const SCENARIOS = [
  {
    id: 1,
    story: "Ali was playing with his favorite ball, but it popped!",
    question: "How does Ali feel now?",
    correctEmotion: '😢',
    label: 'Sad',
    options: ['😊', '😢', '😡'],
    hint: "He is sad because his ball is broken."
  },
  {
    id: 2,
    story: "It's Ayşe's birthday and her father bought her a big gift!",
    question: "How does Ayşe feel?",
    correctEmotion: '😊',
    label: 'Happy',
    options: ['😨', '😊', '😢'],
    hint: "She is very happy for the surprise!"
  },
  {
    id: 3,
    story: "Suddenly, the lights went out and it's very dark!",
    question: "How do they feel in the dark?",
    correctEmotion: '😨',
    label: 'Scared',
    options: ['😡', '😨', '😊'],
    hint: "It's a bit scary when it's dark."
  },
  {
    id: 4,
    story: "Someone took Mehmet's toy without asking!",
    question: "How does Mehmet feel?",
    correctEmotion: '😡',
    label: 'Angry',
    options: ['😊', '😡', '😴'],
    hint: "He is angry because he wants his toy back."
  },
  {
    id: 5,
    story: "Zeynep has been playing all day and now it's bedtime.",
    question: "How does Zeynep feel now?",
    correctEmotion: '😴',
    label: 'Sleepy',
    options: ['😴', '😡', '😊'],
    hint: "She is tired and wants to sleep."
  }
];

const MAX_ROUNDS = 5;

const SocialReasoningLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const currentScenario = SCENARIOS[currentRound];

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak(SCENARIOS[round].story);
    setTimeout(() => {
      Tts.speak(SCENARIOS[round].question);
    }, 4000);
  }, [feedbackAnim]);

  // İSTEDİĞİN ÖZEL EFFECT YAPISI
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.4);
        startNewRound(0);
      } catch (error) {
        console.log("TTS Error:", error);
      }
    };
    initTts();
    return () => { Tts.stop(); };
  }, [startNewRound]);

  const handleOptionPress = (emoji: string) => {
    if (isBusy) return;

    const isCorrect = emoji === currentScenario.correctEmotion;
    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak(`Yes! ${currentScenario.label}!`);
      setTimeout(() => {
        if (currentRound < MAX_ROUNDS - 1) {
          const next = currentRound + 1;
          setCurrentRound(next);
          startNewRound(next);
        } else {
          finalizeGame();
        }
      }, 3000);
    } else {
      setWrongCount(w => w + 1);
      Tts.speak("Not quite. Listen to the story again.");
      setTimeout(() => {
        setFeedback(null);
        setIsBusy(false);
        feedbackAnim.setValue(0);
        Tts.speak(currentScenario.story);
      }, 2000);
    }
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: child?.id,
        game_type: 'emotions_reasoning',
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
    
    createGameCompletionHandler({ navigation, child, gameSequence, currentGameIndex, categoryTitle })
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Emotions Expert! 😊😢😡');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.roundText}>Question {currentRound + 1} / {MAX_ROUNDS}</Text>
        <Text style={styles.title}>Social Logic 🧠</Text>
      </View>

      <View style={styles.gameArea}>
        {/* HİKAYE KARTI */}
        <View style={styles.storyCard}>
          <Text style={styles.storyEmoji}>📖</Text>
          <Text style={styles.storyText}>{currentScenario.story}</Text>
          <View style={styles.divider} />
          <Text style={styles.questionText}>{currentScenario.question}</Text>
        </View>

        {/* FEEDBACK OVERLAY */}
        {feedback && (
          <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
            <Text style={styles.feedbackIcon}>{feedback === 'success' ? '✅' : '❌'}</Text>
          </Animated.View>
        )}
      </View>

      {/* SEÇENEKLER PANELİ */}
      <View style={styles.palette}>
        <Text style={styles.paletteTitle}>Choose the emotion:</Text>
        <View style={styles.optionsRow}>
          {currentScenario.options.map((emoji, index) => (
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
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { alignItems: 'center', paddingTop: 30, paddingHorizontal: 20 },
  roundText: { fontSize: 16, fontWeight: 'bold', color: '#FFB7C5' },
  title: { fontSize: 28, fontWeight: '900', color: '#D63384', marginTop: 5 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  storyCard: { backgroundColor: 'white', padding: 25, borderRadius: 30, width: '100%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, alignItems: 'center' },
  storyEmoji: { fontSize: 50, marginBottom: 15 },
  storyText: { fontSize: 20, fontWeight: '600', color: '#4A5568', textAlign: 'center', lineHeight: 28 },
  divider: { height: 2, backgroundColor: '#FEE2E2', width: '80%', marginVertical: 20 },
  questionText: { fontSize: 22, fontWeight: '900', color: '#D63384', textAlign: 'center' },
  feedbackOverlay: { position: 'absolute', zIndex: 10, top: '40%' },
  feedbackIcon: { fontSize: 100 },
  palette: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, elevation: 20 },
  paletteTitle: { fontSize: 16, fontWeight: 'bold', color: '#A0AEC0', textAlign: 'center', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  optionCard: { width: 90, height: 90, backgroundColor: '#FFF5F7', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 2, borderColor: '#FFD1DC' },
  optionEmoji: { fontSize: 50 },
});

export default SocialReasoningLevel3;