import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { GAME_CONTENTS } from './gameData';
import { createGameCompletionHandler } from '../../utils/gameNavigation';
import { sendGameResult } from '../../config/api';

const { width } = Dimensions.get('window');
const TOTAL_QUESTIONS = 10; 

export default function GenericMatchingGame({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle, categoryKey }: any = route.params || {};

  // LEVEL KEY GÜNCELLEMESİ: Level 3'ü sisteme dahil ettik
  const levelKey = child?.level === 3 ? 'Level3' : (child?.level === 2 ? 'Level2' : 'Level1');
  const categoryData = GAME_CONTENTS[categoryKey] || GAME_CONTENTS.Numbers;
  const dataSource = categoryData[levelKey] || categoryData['Level1'];

  const bounceAnim = useRef(new Animated.Value(1)).current; 
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const [targetItem, setTargetItem] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [selectedOptionId, setSelectedOptionId] = useState<any>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const scoreRef = useRef(0);
  const wrongCountRef = useRef(0);
  const gameStartTimeRef = useRef<number>(Date.now());
  const usedIdsRef = useRef<any[]>([]);

  useEffect(() => {
    Tts.setDefaultLanguage("en-US");
    Tts.setDefaultRate(0.35);
    newQuestion();
    return () => { Tts.stop(); };
  }, [currentQuestion]);

  const triggerSuccessFeedback = () => {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.spring(successAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const newQuestion = () => {
    setFeedback("");
    setSelectedOptionId(null);
    
    if (!dataSource || dataSource.length === 0) return;

    let availableItems = dataSource.filter((item: any) => !usedIdsRef.current.includes(item.id));
    
    if (availableItems.length === 0) {
      usedIdsRef.current = [];
      availableItems = dataSource;
    }

    const randomTarget = availableItems[Math.floor(Math.random() * availableItems.length)];
    
    if (!randomTarget) return;

    setTargetItem(randomTarget);
    usedIdsRef.current.push(randomTarget.id);

    // MANTIK GÜNCELLEMESİ: Level 2 ve Level 3 artık 'options' yapısını kullanıyor
    if (levelKey === 'Level2' || levelKey === 'Level3') {
      const currentOpts = randomTarget.options ? [...randomTarget.options] : [];
      setOptions(currentOpts.sort(() => Math.random() - 0.5));
      Tts.stop();
      Tts.speak(randomTarget.audioText || randomTarget.instruction);
    } else {
      // Level 1: Eskisi gibi rastgele yanlış seçenekler üretir
      const otherItems = dataSource.filter((item: any) => item.id !== randomTarget.id);
      const randomOthers = [...otherItems].sort(() => Math.random() - 0.5).slice(0, 2);
      const finalOptions = [randomTarget, ...randomOthers].sort(() => Math.random() - 0.5);
      
      setOptions(finalOptions);
      Tts.stop();
      Tts.speak(randomTarget.speech || randomTarget.name);
    }
  };

  const handleSelect = (item: any) => {
    if (feedback !== "" || gameFinished || !targetItem) return;
    setSelectedOptionId(item.id);

    // Doğruluk kontrolü Level 2 ve 3 için isCorrect'e bakar
    const isCorrect = (levelKey === 'Level2' || levelKey === 'Level3') 
      ? item.isCorrect === true 
      : (item.id === targetItem.id);

    if (isCorrect) {
      scoreRef.current += 1;
      setFeedback("correct");
      triggerSuccessFeedback();

      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.25, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();

      Tts.stop();
      Tts.speak("Great!");

      setTimeout(() => {
        if (currentQuestion >= TOTAL_QUESTIONS || currentQuestion >= dataSource.length) {
          setGameFinished(true);
        } else {
          setCurrentQuestion(prev => prev + 1);
        }
      }, 2000);
    } else {
      wrongCountRef.current += 1;
      setFeedback("wrong");
      triggerShake();
      Tts.stop();
      Tts.speak("Try again!");
      setTimeout(() => {
        setFeedback("");
        setSelectedOptionId(null);
      }, 1000);
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = scoreRef.current + wrongCountRef.current;
    const successRate = totalAttempts > 0 ? Math.round((scoreRef.current / totalAttempts) * 100) : 0;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: `matching_${categoryKey?.toLowerCase() || 'generic'}`,
        level: child?.level || 1,
        score: scoreRef.current,
        max_score: TOTAL_QUESTIONS,
        duration_seconds: duration,
        wrong_count: wrongCountRef.current,
        success_rate: successRate,
        completed: true,
        details: { totalAttempts, successRate }
      });
    } catch (err) { console.log("API Error:", err); }

    const gameNav = createGameCompletionHandler({
      navigation, child, gameSequence, currentGameIndex, categoryTitle,
      resetGame: () => {
        scoreRef.current = 0; wrongCountRef.current = 0;
        usedIdsRef.current = [];
        setCurrentQuestion(1); setGameFinished(false);
        gameStartTimeRef.current = Date.now();
        newQuestion();
      },
    });
    gameNav.showCompletionMessage(scoreRef.current, TOTAL_QUESTIONS, "🎉 Amazing Progress!");
  };

  useEffect(() => {
    if (gameFinished) finalizeGame();
  }, [gameFinished]);

  if (!targetItem) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{categoryTitle} Lvl {child?.level || 1}</Text>
        <Text style={styles.progressText}>{currentQuestion} / {TOTAL_QUESTIONS}</Text>
      </View>

      <View style={styles.gameArea}>
        <Animated.View style={[
          styles.successMessage, 
          { 
            opacity: successAnim,
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
          }
        ]}>
          <Text style={styles.successText}>🎉 Correct! 🎉</Text>
        </Animated.View>

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>
            {(levelKey === 'Level2' || levelKey === 'Level3') ? "Think carefully:" : "Which one is:"}
          </Text>
          <Text style={[styles.targetName, { fontSize: (levelKey === 'Level2' || levelKey === 'Level3') ? 22 : 36 }]}>
            {(levelKey === 'Level2' || levelKey === 'Level3') ? targetItem.instruction : targetItem.name}
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {options.map((item, index) => {
            const isSelected = item.id === selectedOptionId;
            const isCorrectOption = (levelKey === 'Level2' || levelKey === 'Level3') 
              ? item.isCorrect === true 
              : (item.id === targetItem.id);

            return (
              <Animated.View 
                key={`${item.id}-${index}`}
                style={{
                  transform: [
                    { translateX: feedback === "wrong" && isSelected ? shakeAnim : 0 },
                    { scale: feedback === "correct" && isCorrectOption ? bounceAnim : 1 }
                  ]
                }}
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[
                    styles.optionBox, 
                    feedback === "correct" && isCorrectOption && styles.correctBox,
                    feedback === "wrong" && isSelected && styles.wrongBox
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionEmoji}>{item.emoji}</Text>
                  <Text style={styles.optionLabel}>
                    {(levelKey === 'Level2' || levelKey === 'Level3') ? item.label : item.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: 'center', backgroundColor: "#FFF", elevation: 2 },
  backBtn: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  progressText: { fontSize: 18, fontWeight: "bold", color: "#FF6B9A" },
  gameArea: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  targetCard: { backgroundColor: "#FFF", padding: 25, borderRadius: 25, alignItems: "center", elevation: 5, marginBottom: 40, width: "95%" },
  targetLabel: { fontSize: 16, color: "#666", marginBottom: 10 },
  targetName: { fontWeight: "900", color: "#FF6B9A", textAlign: 'center' },
  optionsGrid: { width: "100%", gap: 15, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  optionBox: { backgroundColor: "#FFF", width: width * 0.28, height: width * 0.38, borderRadius: 20, elevation: 3, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "transparent", padding: 5 },
  optionEmoji: { fontSize: 45 },
  optionLabel: { marginTop: 5, fontSize: 13, fontWeight: 'bold', color: '#444', textAlign: 'center' },
  correctBox: { borderColor: "#4CAF50" },
  wrongBox: { borderColor: "#FF5252" },
  successMessage: { position: 'absolute', top: 20, backgroundColor: 'rgba(76, 175, 80, 0.9)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 30, zIndex: 999, elevation: 5 },
  successText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
});