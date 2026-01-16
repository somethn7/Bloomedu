// -umut & Gemini: GENERIC LEVEL 1 & 2 - Akıllı Sürüm
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView, Alert } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { GAME_CONTENTS } from './gameData';
import { createGameCompletionHandler } from '../../utils/gameNavigation';

const { width } = Dimensions.get('window');
const TOTAL_QUESTIONS = 5; // Level 2 için 5 soru daha ideal olabilir

export default function GenericMatchingGame({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle, categoryKey }: any = route.params || {};

  // --- KRİTİK DEĞİŞİKLİK: Seviyeye göre veri çekme ---
  const levelKey = child?.level === 2 ? 'Level2' : 'Level1';
  const categoryData = GAME_CONTENTS[categoryKey] || GAME_CONTENTS.Numbers;
  const dataSource = categoryData[levelKey] || categoryData['Level1']; // Level 2 yoksa Level 1'e düş

  const bounceAnim = useRef(new Animated.Value(1)).current; 
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [targetItem, setTargetItem] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [selectedOptionId, setSelectedOptionId] = useState<any>(null);

  const scoreRef = useRef(0);
  const wrongCountRef = useRef(0);

  useEffect(() => {
    Tts.setDefaultLanguage("en-US");
    Tts.setDefaultRate(0.35);
    newQuestion();
    return () => { Tts.stop(); };
  }, [currentQuestion]);

  const newQuestion = () => {
    setFeedback("");
    setSelectedOptionId(null);
    
    // Rastgele soru seç
    const randomTarget = dataSource[Math.floor(Math.random() * dataSource.length)];
    setTargetItem(randomTarget);

    if (levelKey === 'Level2') {
      // Level 2'de seçenekler zaten veri içinde (options dizisi)
      setOptions(randomTarget.options.sort(() => Math.random() - 0.5));
      Tts.stop();
      Tts.speak(randomTarget.audioText);
    } else {
      // Level 1: Klasik eşleştirme (3 seçenek oluştur)
      let ops = [randomTarget];
      while (ops.length < 3) {
        let r = dataSource[Math.floor(Math.random() * dataSource.length)];
        if (!ops.find(o => o.id === r.id)) ops.push(r);
      }
      setOptions(ops.sort(() => Math.random() - 0.5));
      Tts.stop();
      Tts.speak(randomTarget.speech);
    }
  };

  const handleSelect = (item: any) => {
    if (feedback !== "") return;
    setSelectedOptionId(item.id);

    // Doğruluk kontrolü (Level 1 ve 2 için farklı kontrol)
    const isCorrect = levelKey === 'Level2' ? item.isCorrect : (item.id === targetItem.id);

    if (isCorrect) {
      scoreRef.current += 1;
      setFeedback("correct");
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.25, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();

      Tts.stop();
      Tts.speak("Great!");

      setTimeout(() => {
        if (currentQuestion >= (dataSource.length < TOTAL_QUESTIONS ? dataSource.length : TOTAL_QUESTIONS)) {
          finalizeGame();
        } else {
          setCurrentQuestion(prev => prev + 1);
        }
      }, 1500);
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
    const gameNav = createGameCompletionHandler({
      navigation, child, gameSequence, currentGameIndex, categoryTitle,
      resetGame: () => {
        scoreRef.current = 0; wrongCountRef.current = 0;
        setCurrentQuestion(1);
        newQuestion();
      },
    });
    gameNav.showCompletionMessage(scoreRef.current, currentQuestion, "🎉 Amazing Progress!");
  };

  if (!targetItem) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{categoryTitle} {levelKey === 'Level2' ? 'Lvl 2' : 'Lvl 1'}</Text>
        <Text style={styles.progressText}>{currentQuestion} / {TOTAL_QUESTIONS}</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>
            {levelKey === 'Level2' ? "Think carefully:" : "Which one is:"}
          </Text>
          <Text style={[styles.targetName, { fontSize: levelKey === 'Level2' ? 24 : 36 }]}>
            {levelKey === 'Level2' ? targetItem.instruction : targetItem.name}
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {options.map((item, index) => {
            const isSelected = item.id === selectedOptionId;
            const isCorrect = levelKey === 'Level2' ? item.isCorrect : (item.id === targetItem.id);

            return (
              <Animated.View 
                key={index}
                style={{
                  transform: [
                    { translateX: feedback === "wrong" && isSelected ? shakeAnim : 0 },
                    { scale: feedback === "correct" && isCorrect ? bounceAnim : 1 }
                  ]
                }}
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[
                    styles.optionBox, 
                    feedback === "correct" && isCorrect && styles.correctBox,
                    feedback === "wrong" && isSelected && styles.wrongBox
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionEmoji}>{item.emoji}</Text>
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
  header: { padding: 20, flexDirection: "row", justifyContent: "space-between", backgroundColor: "#FFF", elevation: 2 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  progressText: { fontSize: 18, fontWeight: "bold", color: "#FF6B9A" },
  gameArea: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  targetCard: { backgroundColor: "#FFF", padding: 25, borderRadius: 25, alignItems: "center", elevation: 5, marginBottom: 40, width: "90%" },
  targetLabel: { fontSize: 16, color: "#666", marginBottom: 10 },
  targetName: { fontWeight: "900", color: "#FF6B9A", textAlign: 'center' },
  optionsGrid: { width: "100%", gap: 15, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  optionBox: { backgroundColor: "#FFF", width: width * 0.28, height: width * 0.28, borderRadius: 20, elevation: 3, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "transparent" },
  optionEmoji: { fontSize: 50 },
  correctBox: { borderColor: "#4CAF50" },
  wrongBox: { borderColor: "#FF5252" },
});