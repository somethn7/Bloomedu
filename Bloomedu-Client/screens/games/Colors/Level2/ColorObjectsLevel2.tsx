// -umut: LEVEL 2 ColorObjectsLevel2 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların iki özelliği birden (Renk + Nesne) tanıma becerilerini geliştirir
// Oyun sonuçları database'e kaydedilir (wrong_count, success_rate)
// Özellikler: Renkli kutular + Emoji, Sesli yönergeler, 10 Soru

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width } = Dimensions.get('window');

// OBJECTS & COLORS DATA
const OBJECTS = [
  { id: 1, name: 'CAR', emoji: '🚗', label: 'Araba' },
  { id: 2, name: 'BALL', emoji: '⚽', label: 'Top' },
  { id: 3, name: 'BALLOON', emoji: '🎈', label: 'Balon' },
  { id: 4, name: 'APPLE', emoji: '🍎', label: 'Elma' },
  { id: 5, name: 'BOOK', emoji: '📚', label: 'Kitap' },
  { id: 6, name: 'CUP', emoji: '🥤', label: 'Bardak' },
];

const COLORS = [
  { id: 1, name: 'RED', code: '#FF6B6B', pastelBg: '#FFE5E5' },
  { id: 2, name: 'BLUE', code: '#4DABF7', pastelBg: '#E7F5FF' },
  { id: 3, name: 'YELLOW', code: '#FFD43B', pastelBg: '#FFF9DB' },
  { id: 4, name: 'GREEN', code: '#51CF66', pastelBg: '#EBFBEE' },
];

const TOTAL_QUESTIONS = 10;

export default function ColorObjectsLevel2({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as any) || {};

  // Game State
  const [targetColorObject, setTargetColorObject] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | ''>('');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  
  // Animations
  const animValue = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

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

    newQuestion();

    return () => {
      Tts.stop();
    };
  }, []);

  const speakColorObject = (colorName: string, objectName: string) => {
    const text = `Find ${colorName} ${objectName}`;
    try {
      Tts.stop();
      Tts.speak(text);
    } catch {}
  };

  // --- QUESTION LOGIC ---
  const newQuestion = () => {
    setFeedback('');
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    
    const target = {
      color: randomColor,
      object: randomObject,
      id: `${randomColor.id}-${randomObject.id}`,
    };
    
    setTargetColorObject(target);
    
    const optionsList = [target];
    
    while (optionsList.length < 4) {
      const wrongColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const wrongObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
      const wrongOption = {
        color: wrongColor,
        object: wrongObject,
        id: `${wrongColor.id}-${wrongObject.id}`,
      };
      
      if (!optionsList.find(opt => opt.id === wrongOption.id)) {
        optionsList.push(wrongOption);
      }
    }
    
    const shuffled = optionsList.sort(() => Math.random() - 0.5);
    setOptions(shuffled);

    setTimeout(() => {
      speakColorObject(randomColor.name, randomObject.name);
    }, 500);
  };

  // --- INTERACTION ---
  const selectOption = (selectedOption: any) => {
    if (feedback || gameFinished) return;

    const isCorrect = selectedOption.id === targetColorObject.id;

    if (isCorrect) {
      // ✅ Correct
      setFeedback('correct');
      setScore(prev => prev + 1);
      setAnsweredCount(prev => prev + 1);

      // Animations
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(confettiAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(confettiAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ]).start();

      Tts.speak('Correct!');

      setTimeout(() => {
        if (currentQuestion >= TOTAL_QUESTIONS) {
          setGameFinished(true);
        } else {
          setCurrentQuestion(prev => prev + 1);
          newQuestion();
        }
      }, 1500);
    } else {
      // ❌ Wrong
      setFeedback('wrong');
      setWrongCount(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 1));

      // Shake animation
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      Tts.speak('Try again!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const handleHearAgain = () => {
    if (targetColorObject) {
      speakColorObject(targetColorObject.color.name, targetColorObject.object.name);
    }
  };

  // --- DATABASE & COMPLETION ---
  const sendToDatabase = async () => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    const safeAnswered = answeredCount > 0 ? answeredCount : 1;
    const safeScore = score < 0 ? 0 : score;
    const successRate = Math.round((safeScore / safeAnswered) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'color_objects',
        level: 2,
        score: safeScore,
        max_score: TOTAL_QUESTIONS,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalQuestions: TOTAL_QUESTIONS,
          answeredCount: safeAnswered,
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

  const restartGame = () => {
    setScore(0);
    setWrongCount(0);
    setAnsweredCount(0);
    setCurrentQuestion(1);
    setGameFinished(false);
    gameStartTimeRef.current = Date.now();
    newQuestion();
  };

  const handleGameCompletion = () => {
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
      TOTAL_QUESTIONS,
      '🎉 Great Job! Level 2 Complete!'
    );
  };

  // --- RENDER HELPERS ---
  const successRate = answeredCount > 0 ? Math.round((Math.max(score, 0) / answeredCount) * 100) : 0;

  const targetAnimStyle = {
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: feedback === 'correct' ? [1, 1.15] : [1, 0.95],
        }),
      },
      {
        rotate: animValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-5deg', '0deg', '5deg'],
        }),
      },
    ],
  };

  const confettiStyle = {
    opacity: confettiAnim,
    transform: [
      {
        translateY: confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        }),
      },
      {
        scale: confettiAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1.2, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎨 Color Objects</Text>
            <Text style={styles.subtitle}>Level 2</Text>
          </View>
          <View style={styles.progressBox}>
            <Text style={styles.questionCounter}>
              {currentQuestion} / {TOTAL_QUESTIONS}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentQuestion / TOTAL_QUESTIONS) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* SCORE CARDS */}
        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, styles.correctCard]}>
            <Text style={styles.scoreEmoji}>✓</Text>
            <Text style={styles.scoreNumber}>{Math.max(score, 0)}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          <View style={[styles.scoreCard, styles.wrongCard]}>
            <Text style={styles.scoreEmoji}>✗</Text>
            <Text style={styles.scoreNumber}>{wrongCount}</Text>
            <Text style={styles.scoreLabel}>Wrong</Text>
          </View>
          <View style={[styles.scoreCard, styles.rateCard]}>
            <Text style={styles.scoreEmoji}>⭐</Text>
            <Text style={styles.scoreNumber}>{successRate}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* TARGET SECTION */}
        <View style={styles.targetSection}>
          <Text style={styles.questionText}>Find this! 👇</Text>
          {targetColorObject && (
            <Animated.View style={targetAnimStyle}>
              <TouchableOpacity onPress={handleHearAgain} activeOpacity={0.9}>
                <View style={[
                  styles.targetBox,
                  { backgroundColor: targetColorObject.color.code }
                ]}>
                  <Text style={styles.targetEmoji}>{targetColorObject.object.emoji}</Text>
                  <Text style={styles.targetName}>
                    {targetColorObject.color.name} {targetColorObject.object.name}
                  </Text>
                  <Text style={styles.hearHint}>🔊 Tap to hear</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {feedback === 'correct' && (
            <Animated.View style={[styles.confetti, confettiStyle]}>
              <Text style={styles.confettiText}>✨🎉✨</Text>
            </Animated.View>
          )}
        </View>

        {/* OPTIONS GRID */}
        <View style={styles.optionsSection}>
          <View style={styles.optionsGrid}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionContainer}
                onPress={() => selectOption(option)}
                activeOpacity={0.7}
                disabled={feedback !== ''}
              >
                <View style={[
                  styles.optionBox,
                  { backgroundColor: option.color.code }
                ]}>
                  <Text style={styles.optionEmoji}>{option.object.emoji}</Text>
                  <Text style={styles.optionLabelWhite}>{option.color.name}</Text>
                  <Text style={styles.optionLabelWhite}>{option.object.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F3' },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 30 },
  bgCircle1: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFE5E5', opacity: 0.25, top: -40, left: -40 },
  bgCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#E7F5FF', opacity: 0.25, top: 80, right: -30 },
  bgCircle3: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFF9DB', opacity: 0.25, bottom: 100, left: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 16, zIndex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: '#4A4A4A' },
  subtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  progressBox: { alignItems: 'flex-end' },
  questionCounter: { fontSize: 14, fontWeight: '600', color: '#6B6B6B', marginBottom: 5 },
  progressBar: { width: 80, height: 6, backgroundColor: '#E9E9E9', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#74C0FC', borderRadius: 10 },
  scoreCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 8, zIndex: 1 },
  scoreCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderTopWidth: 2 },
  correctCard: { borderTopColor: '#51CF66' },
  wrongCard: { borderTopColor: '#FF8787' },
  rateCard: { borderTopColor: '#FFD43B' },
  scoreEmoji: { fontSize: 14, fontWeight: '700', color: '#4A4A4A' },
  scoreNumber: { fontSize: 20, fontWeight: '700', color: '#4A4A4A' },
  scoreLabel: { fontSize: 10, color: '#999', marginTop: 1, fontWeight: '500' },
  targetSection: { alignItems: 'center', marginVertical: 16, zIndex: 1 },
  questionText: { fontSize: 17, fontWeight: '600', color: '#5A5A5A', marginBottom: 14 },
  targetBox: { borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, minWidth: 200, minHeight: 200, justifyContent: 'center' },
  targetEmoji: { fontSize: 80, marginBottom: 10 },
  targetName: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1, textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  hearHint: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 10, fontWeight: '600' },
  confetti: { position: 'absolute', top: 30 },
  confettiText: { fontSize: 36 },
  optionsSection: { zIndex: 1, marginBottom: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  optionContainer: { width: (width - 42) / 2, marginBottom: 10 },
  optionBox: { borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4, minHeight: 140, justifyContent: 'center' },
  optionEmoji: { fontSize: 50, marginBottom: 10 },
  optionLabelWhite: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
});