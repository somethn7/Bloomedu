import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

type AdditionData = {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
};

const MAX_ROUNDS = 5;

export default function Addition({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [data, setData] = useState<AdditionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Refs & Animations
  const gameStartTimeRef = useRef<number>(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.35);
    
    startNewRound();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => {
      Tts.stop();
      pulse.stop();
    };
  }, []);

  const triggerSuccessFeedback = () => {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.spring(successAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const generateAddition = (): AdditionData => {
    // Okul öncesi seviye için 1-10 arası basit toplamlar
    const n1 = Math.floor(Math.random() * 5) + 1;
    const n2 = Math.floor(Math.random() * 5) + 1;
    const correct = n1 + n2;

    // Şıkları oluştur (1 doğru, 2 yanlış)
    let options = [correct];
    while (options.length < 3) {
      const wrong = Math.max(1, correct + (Math.floor(Math.random() * 5) - 2));
      if (!options.includes(wrong)) options.push(wrong);
    }
    
    return { 
      num1: n1, 
      num2: n2, 
      correctAnswer: correct, 
      options: options.sort((a, b) => a - b) 
    };
  };

  const startNewRound = () => {
    const newData = generateAddition();
    setData(newData);
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    setTimeout(() => {
      Tts.speak(`How much is ${newData.num1} plus ${newData.num2}?`);
    }, 600);
  };

  const handleAnswerPress = (answer: number) => {
    if (selectedAnswer !== null || !data) return;

    setSelectedAnswer(answer);
    const correct = answer === data.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      Tts.stop();
      Tts.speak(`Correct! ${data.num1} plus ${data.num2} is ${data.correctAnswer}.`);
      triggerSuccessFeedback();

      setTimeout(() => {
        if (currentRound < MAX_ROUNDS) {
          setCurrentRound(prev => prev + 1);
          startNewRound();
        } else {
          setGameFinished(true);
        }
      }, 2000);
    } else {
      setWrongCount(prev => prev + 1);
      
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      Tts.stop();
      Tts.speak('Not quite, try counting them all together!');
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    try {
        await sendGameResult({
            child_id: child.id,
            game_type: 'addition_basic',
            level: 2,
            score: score,
            max_score: MAX_ROUNDS,
            duration_seconds: duration,
            wrong_count: wrongCount,
            success_rate: successRate,
            completed: true,
            details: { totalAttempts, successRate }
        });
    } catch (err) { console.log(err); }

    handleGameCompletion();
  };

  useEffect(() => {
    if (gameFinished) finalizeGame();
  }, [gameFinished]);

  const handleGameCompletion = () => {
    const gameNav = createGameCompletionHandler({
      navigation, child, gameSequence, currentGameIndex, categoryTitle,
      resetGame: () => {
        setScore(0); setWrongCount(0); setCurrentRound(1);
        setGameFinished(false); gameStartTimeRef.current = Date.now();
        startNewRound();
      },
    });
    gameNav.showCompletionMessage(score, MAX_ROUNDS, '🍎 Math Genius!');
  };

  if (!data) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Learn Addition</Text>
          <View style={styles.scoreBox}><Text style={styles.scoreText}>⭐ {score}</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressBox}>
            <Text style={styles.progressText}>Round {currentRound} / {MAX_ROUNDS}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentRound / MAX_ROUNDS) * 100}%` }]} />
            </View>
          </View>

          <Animated.View style={[
            styles.successMessage, 
            { opacity: successAnim, transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }
          ]}>
            <Text style={styles.successText}>🌟 Awesome! 🌟</Text>
          </Animated.View>

          <View style={styles.equationArea}>
            <View style={[styles.numCard, { backgroundColor: '#FF9F43' }]}>
              <Text style={styles.numText}>{data.num1}</Text>
            </View>

            <Text style={styles.operatorText}>+</Text>

            <View style={[styles.numCard, { backgroundColor: '#54a0ff' }]}>
              <Text style={styles.numText}>{data.num2}</Text>
            </View>

            <Text style={styles.operatorText}>=</Text>

            <Animated.View style={[styles.resultPlaceholder, { transform: [{ scale: pulseAnim }, { translateX: shakeAnim }] }]}>
                <Text style={styles.placeholderText}>
                    {selectedAnswer === null ? '?' : selectedAnswer}
                </Text>
            </Animated.View>
          </View>

          <Text style={styles.instruction}>Pick the correct answer:</Text>

          <View style={styles.optionsContainer}>
            {data.options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={[
                    styles.optionBtn,
                    selectedAnswer === opt && (isCorrect ? styles.correctBtn : styles.wrongBtn)
                ]}
                onPress={() => handleAnswerPress(opt)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  backText: { color: '#54a0ff', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scoreBox: { backgroundColor: '#FF9F43', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: '#fff', fontWeight: 'bold' },
  scrollContent: { padding: 16, alignItems: 'center' },
  progressBox: { width: '100%', padding: 15, backgroundColor: '#fff', borderRadius: 15, marginBottom: 40 },
  progressText: { textAlign: 'center', fontWeight: 'bold', color: '#666', marginBottom: 5 },
  progressBar: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#5f27cd' },
  equationArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 60, width: '100%' },
  numCard: { width: 70, height: 90, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  numText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  operatorText: { fontSize: 40, fontWeight: 'bold', color: '#576574', marginHorizontal: 10 },
  resultPlaceholder: { width: 80, height: 100, backgroundColor: '#fff', borderRadius: 15, borderStyle: 'dashed', borderWidth: 3, borderColor: '#5f27cd', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 45, fontWeight: '900', color: '#5f27cd' },
  instruction: { fontSize: 18, color: '#576574', marginBottom: 20, fontWeight: '600' },
  optionsContainer: { flexDirection: 'row', gap: 20 },
  optionBtn: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 4, borderWidth: 2, borderColor: '#eee' },
  optionText: { fontSize: 32, fontWeight: 'bold', color: '#2d3436' },
  correctBtn: { borderColor: '#1dd1a1', backgroundColor: '#e1fcf4' },
  wrongBtn: { borderColor: '#ff6b6b', backgroundColor: '#fff5f5' },
  successMessage: { position: 'absolute', top: height / 4, alignSelf: 'center', backgroundColor: '#1dd1a1', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, zIndex: 999, elevation: 10 },
  successText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
});