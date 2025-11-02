import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';
import { createGameCompletionHandler, GameSequenceParams } from '../../../utils/gameNavigation';

const { width } = Dimensions.get('window');

interface RouteParams {
  child?: { id: number; level: number; name?: string };
  gameSequence?: any[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

interface NumberData {
  value: number;
  display: string;
  color: string;
  emoji: string;
}

const LearnNumbersLevel1 = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  const gameSequence = (route.params as RouteParams)?.gameSequence;
  const currentGameIndex = (route.params as RouteParams)?.currentGameIndex ?? -1;
  const categoryTitle = (route.params as RouteParams)?.categoryTitle;

  const [currentNumber, setCurrentNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  // Animations
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const numbers: NumberData[] = useMemo(() => ([
    { value: 1, display: '1', color: '#FF6B9A', emoji: '🌟' },
    { value: 2, display: '2', color: '#4ECDC4', emoji: '⭐' },
    { value: 3, display: '3', color: '#45B7D1', emoji: '✨' },
    { value: 4, display: '4', color: '#96CEB4', emoji: '🎯' },
    { value: 5, display: '5', color: '#FFEAA7', emoji: '🎈' },
    { value: 6, display: '6', color: '#DDA0DD', emoji: '🎨' },
    { value: 7, display: '7', color: '#98D8C8', emoji: '🎪' },
    { value: 8, display: '8', color: '#F7DC6F', emoji: '🎭' },
    { value: 9, display: '9', color: '#BB8FCE', emoji: '🎨' },
    { value: 10, display: '10', color: '#85C1E9', emoji: '🎊' },
  ]), []);

  // Initialize TTS once
  useEffect(() => {
    try {
      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
      Tts.setDefaultPitch(1.0);
      // test ses
      setTimeout(() => Tts.speak('Ready'), 400);
    } catch {}
  }, []);

  const speakFindNumber = (num: number) => {
    try {
      Tts.stop();
      // Hafif gecikme ile sakin bir şekilde okut
      setTimeout(() => {
        Tts.speak(`Find number ${num}.`);
      }, 250);
    } catch {}
  };

  // Pulse animation and prompt for current number
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Speak instruction slowly for the current number
    speakFindNumber(currentNumber);

    return () => {
      pulse.stop();
    };
  }, [currentNumber]);

  const animateCorrectAnswer = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 180, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: -20, duration: 300, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 900);
  };

  const handleNumberPress = (selectedNumber: number) => {
    if (!isPlaying) return;
    if (selectedNumber === currentNumber) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      animateCorrectAnswer();
      setTimeout(() => {
        if (currentNumber < 10) {
          setCurrentNumber(currentNumber + 1);
        } else {
          setIsPlaying(false);
          showCompletionMessage();
        }
      }, 800);
    } else {
      setStreak(0);
      try { Tts.speak('Please try again.'); } catch {}
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const sendToDatabase = async (data: { correctAnswers: number; totalQuestions: number; totalTime: number; }) => {
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
          game_type: 'numbers-learn',
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
      if (result?.success) {
        console.log('✅ Learn Numbers game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result?.message);
      }
    } catch (error: any) {
      console.error('❌ Error sending data:', error?.message || 'Unknown error');
    }
  };

  const showCompletionMessage = () => {
    const totalTime = Date.now() - gameStartTime;
    const gameResult = { correctAnswers: score, totalQuestions: 10, totalTime };
    sendToDatabase(gameResult);
    
    const gameNavigation = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setCurrentNumber(1);
        setScore(0);
        setStreak(0);
        setIsPlaying(true);
        setGameStartTime(Date.now());
      },
    });

    gameNavigation.showCompletionMessage(
      score,
      10,
      gameNavigation.getCompletionMessage()
    );
  };

  const currentNumberData = numbers[currentNumber - 1];
  const progress = (currentNumber / 10) * 100;
  const sequenceProgress = gameSequence && currentGameIndex >= 0 ? `${currentGameIndex + 1}/${gameSequence.length}` : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Learn Numbers</Text>
          {sequenceProgress && (
            <Text style={styles.sequenceText}>Game {sequenceProgress}</Text>
          )}
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentNumber} / 10</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.currentNumberContainer}>
          <Animated.View
            style={[
              styles.currentNumberDisplay,
              {
                backgroundColor: currentNumberData.color,
                transform: [
                  { scale: pulseAnim },
                  { rotate: rotateAnim.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] }) },
                ],
              },
            ]}
          >
            <Text style={styles.currentNumberEmoji}>{currentNumberData.emoji}</Text>
            <Animated.Text style={[styles.currentNumberText, { transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] }]}>
              {currentNumberData.display}
            </Animated.Text>
          </Animated.View>
        </View>

        <Text style={styles.instruction}>Find and touch this number! 👆</Text>
        <TouchableOpacity style={styles.replayButton} onPress={() => speakFindNumber(currentNumber)}>
          <Text style={styles.replayButtonText}>🔊 Hear again</Text>
        </TouchableOpacity>

        <View style={styles.numbersGrid}>
          {numbers.map((number, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.numberButton, { backgroundColor: number.color, opacity: isPlaying ? 1 : 0.7 }]}
              onPress={() => handleNumberPress(number.value)}
              disabled={!isPlaying}
            >
              <Text style={styles.numberEmoji}>{number.emoji}</Text>
              <Text style={styles.numberText}>{number.display}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {showCelebration && (
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationText}>🎉 Correct! 🎉</Text>
          </View>
        )}

        {streak > 0 && (
          <View style={styles.streakContainer} pointerEvents="none">
            <Text style={styles.streakText}>🔥 {streak} in a row!</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.encouragementText}>
          {currentNumber <= 3 && 'Great start! 🌟'}
          {currentNumber > 3 && currentNumber <= 7 && "You're doing great! ⭐"}
          {currentNumber > 7 && 'Almost done! 🎯'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  backButton: { padding: 10 },
  backButtonText: { fontSize: 16, color: '#FF6B9A', fontWeight: 'bold' },
  titleContainer: { alignItems: 'center', flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sequenceText: { fontSize: 12, color: '#666', marginTop: 2 },
  scoreContainer: { backgroundColor: '#FF6B9A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  progressBar: { height: 8, backgroundColor: '#E9ECEF', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4ECDC4', borderRadius: 4 },
  progressText: { textAlign: 'center', marginTop: 8, fontSize: 14, color: '#666', fontWeight: '600' },
  gameArea: { flex: 1, paddingHorizontal: 20, paddingVertical: 30 },
  currentNumberContainer: { alignItems: 'center', marginBottom: 30 },
  currentNumberDisplay: {
    width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  currentNumberEmoji: { fontSize: 40, marginBottom: 5 },
  currentNumberText: { fontSize: 48, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  instruction: { textAlign: 'center', fontSize: 18, color: '#333', marginBottom: 30, fontWeight: '600' },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
  numberButton: {
    width: (width - 80) / 5, height: (width - 80) / 5, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  numberEmoji: { fontSize: 16, marginBottom: 2 },
  numberText: { fontSize: 16, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  celebrationContainer: {
    position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }], backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  celebrationText: { fontSize: 24, fontWeight: 'bold', color: '#FF6B9A', textAlign: 'center' },
  streakContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  streakText: { fontSize: 16, fontWeight: 'bold', color: '#FF6B9A', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' },
  encouragementText: { fontSize: 16, color: '#666', textAlign: 'center', fontStyle: 'italic' },
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
});

export default LearnNumbersLevel1;


