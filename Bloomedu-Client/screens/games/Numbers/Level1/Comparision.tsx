import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width } = Dimensions.get('window');

type ComparisonData = {
  leftNum: number;
  rightNum: number;
  correctSymbol: '>' | '<' | '=';
};

const SYMBOLS = [
  { id: '<', label: 'Smaller', icon: '＜' },
  { id: '=', label: 'Equal', icon: '＝' },
  { id: '>', label: 'Bigger', icon: '＞' },
];

const MAX_ROUNDS = 5;

export default function ComparisonLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [data, setData] = useState<ComparisonData | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
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

  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.35);
    
    startNewRound();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => {
      Tts.stop();
      pulse.stop();
    };
  }, []);

  const generateComparison = (): ComparisonData => {
    const left = Math.floor(Math.random() * 10) + 1;
    const right = Math.floor(Math.random() * 10) + 1;
    let symbol: '>' | '<' | '=' = '=';
    
    if (left > right) symbol = '>';
    else if (left < right) symbol = '<';

    return { leftNum: left, rightNum: right, correctSymbol: symbol };
  };

  const startNewRound = () => {
    const newData = generateComparison();
    setData(newData);
    setSelectedSymbol(null);
    setIsCorrect(null);
    
    setTimeout(() => {
      Tts.speak(`${newData.leftNum} and ${newData.rightNum}. Which one is bigger?`);
    }, 600);
  };

  const handleSymbolPress = (symbol: string) => {
    if (selectedSymbol !== null || !data) return;

    setSelectedSymbol(symbol);
    const correct = symbol === data.correctSymbol;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      Tts.speak("Correct! Well done.");

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

      Tts.speak('Try again! Look at the numbers.');
      setTimeout(() => {
        setSelectedSymbol(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = MAX_ROUNDS + wrongCount;
    const successRate = Math.round((MAX_ROUNDS / (totalAttempts || 1)) * 100);

    // try {
    //     await sendGameResult({
    //         child_id: child.id,
    //         game_type: 'numbers-comparison',
    //         level: 1,
    //         score: score,
    //         max_score: MAX_ROUNDS,
    //         duration_seconds: duration,
    //         wrong_count: wrongCount,
    //         success_rate: successRate,
    //         completed: true,
    //     });
    // } catch (err) { console.log(err); }

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
    gameNav.showCompletionMessage(score, MAX_ROUNDS, '🎉 Comparison Champion!');
  };

  if (!data) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compare Numbers</Text>
          <View style={styles.scoreBox}><Text style={styles.scoreText}>⭐ {score}</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressBox}>
            <Text style={styles.progressText}>Round {currentRound} / {MAX_ROUNDS}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentRound / MAX_ROUNDS) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.comparisonArea}>
            <View style={[styles.numCard, { backgroundColor: '#4ECDC4' }]}>
              <Text style={styles.numText}>{data.leftNum}</Text>
            </View>

            <Animated.View style={[styles.symbolPlaceholder, { transform: [{ scale: pulseAnim }, { translateX: shakeAnim }] }]}>
                <Text style={styles.placeholderText}>
                    {selectedSymbol === null ? '?' : selectedSymbol}
                </Text>
            </Animated.View>

            <View style={[styles.numCard, { backgroundColor: '#FF6B9A' }]}>
              <Text style={styles.numText}>{data.rightNum}</Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            {SYMBOLS.map((sym) => (
              <TouchableOpacity
                key={sym.id}
                style={[
                    styles.optionBtn,
                    selectedSymbol === sym.id && (isCorrect ? styles.correctBtn : styles.wrongBtn)
                ]}
                onPress={() => handleSymbolPress(sym.id)}
                disabled={selectedSymbol !== null}
              >
                <Text style={styles.symIcon}>{sym.icon}</Text>
                <Text style={styles.symLabel}>{sym.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 3 },
  backText: { color: '#FF6B9A', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scoreBox: { backgroundColor: '#FF6B9A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: '#fff', fontWeight: 'bold' },
  scrollContent: { padding: 16, alignItems: 'center' },
  progressBox: { width: '100%', padding: 15, backgroundColor: '#fff', borderRadius: 15, marginBottom: 30, elevation: 2 },
  progressText: { textAlign: 'center', fontWeight: 'bold', color: '#666', marginBottom: 5 },
  progressBar: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4ECDC4' },
  comparisonArea: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 50 },
  numCard: { width: 85, height: 110, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  numText: { fontSize: 45, fontWeight: 'bold', color: '#fff' },
  symbolPlaceholder: { width: 80, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 45, fontWeight: '900', color: '#85C1E9' },
  optionsContainer: { flexDirection: 'row', gap: 15 },
  optionBtn: { width: 95, height: 110, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#eee' },
  symIcon: { fontSize: 40, fontWeight: 'bold', color: '#333' },
  symLabel: { fontSize: 12, color: '#999', marginTop: 5 },
  correctBtn: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  wrongBtn: { borderColor: '#FFB3BA', backgroundColor: '#FFF0F0' },
});