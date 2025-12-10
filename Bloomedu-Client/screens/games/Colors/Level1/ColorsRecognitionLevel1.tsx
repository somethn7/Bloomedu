// -umut: LEVEL 1 RENK EŞLEŞTIRME OYUNU - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların renk tanıma becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir ve öğretmenler bu verileri takip edebilir(wrong_count, success_rate)
// Özellikler: 10 soru, 6 renk, skorlama, süre takibi, sesli okuma
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Tts from "react-native-tts";
import { createGameCompletionHandler } from "../../../../utils/gameNavigation";
import { sendGameResult } from "../../../../config/api";

const { width } = Dimensions.get("window");

// -umut: Level 1 için 6 temel renk (28.10.2025)
const COLORS = [
  { id: 1, name: "RED", code: "#FF6B6B", emoji: "🔴", pastelBg: "#FFE5E5" },
  { id: 2, name: "BLUE", code: "#4DABF7", emoji: "🔵", pastelBg: "#E7F5FF" },
  { id: 3, name: "YELLOW", code: "#FFD43B", emoji: "🟡", pastelBg: "#FFF9DB" },
  { id: 4, name: "GREEN", code: "#51CF66", emoji: "🟢", pastelBg: "#EBFBEE" },
  { id: 5, name: "BLACK", code: "#495057", emoji: "⚫", pastelBg: "#E9ECEF" },
  {
    id: 6,
    name: "WHITE",
    code: "#F8F9FA",
    emoji: "⚪",
    pastelBg: "#FFFFFF",
    border: true,
  },
];

const TOTAL_QUESTIONS = 10;

export default function ColorsRecognitionLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any =
    (route.params as any) || {};

  // Game State
  const [targetColor, setTargetColor] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
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

  // --- TTS & INIT ---
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage("en-US");
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

  const speakColorName = (colorName: string) => {
    const text = `Find the ${colorName} color`;
    try {
      Tts.stop();
      Tts.speak(text);
    } catch {}
  };

  const newQuestion = () => {
    setFeedback("");
    
    // Rastgele hedef renk seç
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(target);

    // Seçenekleri karıştır
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    setOptions(shuffledColors);

    setTimeout(() => {
      speakColorName(target.name);
    }, 500);
  };

  // --- INTERACTION ---
  const selectColor = (selectedColor: any) => {
    if (feedback || gameFinished) return;

    const isCorrect = selectedColor.id === targetColor.id;

    if (isCorrect) {
      // Correct Answer
      setScore((prev) => prev + 1);
      setFeedback("correct");
      setAnsweredCount((prev) => prev + 1);

      // Animations
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      Tts.speak("Correct!");

      setTimeout(() => {
        if (currentQuestion >= TOTAL_QUESTIONS) {
          setGameFinished(true);
        } else {
          setCurrentQuestion((prev) => prev + 1);
          newQuestion();
        }
      }, 1500);
    } else {
      // Wrong Answer
      setScore((prev) => Math.max(0, prev - 1));
      setWrongCount((prev) => prev + 1);
      setFeedback("wrong");

      // Shake Animation
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      Tts.speak("Try again!");
      setTimeout(() => setFeedback(""), 800);
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
        game_type: "colors_recognition", // Type ID
        level: 1,
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
      console.log("❌ Error sending game result:", err);
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
      "🎉 Amazing! You know your colors!"
    );
  };

  // --- RENDER HELPERS ---
  const successRate =
    answeredCount > 0
      ? Math.round((Math.max(score, 0) / answeredCount) * 100)
      : 0;

  const targetAnimStyle = {
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: feedback === "correct" ? [1, 1.15] : [1, 0.95],
        }),
      },
      {
        rotate: animValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ["-5deg", "0deg", "5deg"],
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
      {/* Background Circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎨 Color Match</Text>
            <Text style={styles.subtitle}>Level 1</Text>
          </View>
          <View style={styles.progressBox}>
            <Text style={styles.questionCounter}>
              {currentQuestion} / {TOTAL_QUESTIONS}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentQuestion / TOTAL_QUESTIONS) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* SCORE CARDS */}
        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, styles.correctCard]}>
            <View style={styles.scoreIconCircle}>
              <Text style={styles.scoreEmoji}>✓</Text>
            </View>
            <Text style={styles.scoreNumber}>{Math.max(score, 0)}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>

          <View style={[styles.scoreCard, styles.wrongCard]}>
            <View style={styles.scoreIconCircle}>
              <Text style={styles.scoreEmoji}>✗</Text>
            </View>
            <Text style={styles.scoreNumber}>{wrongCount}</Text>
            <Text style={styles.scoreLabel}>Wrong</Text>
          </View>

          <View style={[styles.scoreCard, styles.rateCard]}>
            <View style={styles.scoreIconCircle}>
              <Text style={styles.scoreEmoji}>⭐</Text>
            </View>
            <Text style={styles.scoreNumber}>{successRate}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* TARGET COLOR */}
        <View style={styles.targetSection}>
          <Text style={styles.questionText}>Find this color! 👇</Text>
          {targetColor && (
            <Animated.View style={targetAnimStyle}>
              <View
                style={[
                  styles.targetColorBox,
                  { backgroundColor: targetColor.pastelBg },
                ]}
              >
                <View
                  style={[
                    styles.targetColor,
                    {
                      backgroundColor: targetColor.code,
                      borderWidth: targetColor.border ? 2 : 0,
                      borderColor: "#C0C0C0",
                    },
                  ]}
                >
                  <Text style={styles.colorEmoji}>{targetColor.emoji}</Text>
                </View>
                <Text style={styles.colorName}>{targetColor.name}</Text>
              </View>
            </Animated.View>
          )}

          {feedback === "correct" && (
            <Animated.View style={[styles.confetti, confettiStyle]}>
              <Text style={styles.confettiText}>✨🎉✨</Text>
            </Animated.View>
          )}
        </View>

        {/* OPTIONS GRID */}
        <View style={styles.optionsSection}>
          <View style={styles.optionsGrid}>
            {options.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={styles.optionContainer}
                onPress={() => selectColor(color)}
                activeOpacity={0.7}
                disabled={feedback !== ""}
              >
                <View
                  style={[
                    styles.optionBox,
                    { backgroundColor: color.pastelBg },
                  ]}
                >
                  <View
                    style={[
                      styles.colorButton,
                      {
                        backgroundColor: color.code,
                        borderWidth: color.border ? 2 : 0,
                        borderColor: "#C0C0C0",
                      },
                    ]}
                  >
                    <Text style={styles.buttonEmoji}>{color.emoji}</Text>
                  </View>
                  <Text style={styles.optionName}>{color.name}</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#FAF8F3",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  // Background Circles
  bgCircle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFE5E5",
    opacity: 0.25,
    top: -40,
    left: -40,
  },
  bgCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E7F5FF",
    opacity: 0.25,
    top: 80,
    right: -30,
  },
  bgCircle3: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFF9DB",
    opacity: 0.25,
    bottom: 100,
    left: 10,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A4A4A",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  progressBox: {
    alignItems: "flex-end",
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B6B6B",
    marginBottom: 5,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: "#E9E9E9",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#74C0FC",
    borderRadius: 10,
  },
  // Score Cards
  scoreCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
    zIndex: 1,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderTopWidth: 2,
  },
  correctCard: { borderTopColor: "#51CF66" },
  wrongCard: { borderTopColor: "#FF8787" },
  rateCard: { borderTopColor: "#FFD43B" },
  scoreIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  scoreEmoji: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A4A4A",
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A4A4A",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 1,
    fontWeight: "500",
  },
  // Target
  targetSection: {
    alignItems: "center",
    marginVertical: 16,
    zIndex: 1,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#5A5A5A",
    marginBottom: 14,
  },
  targetColorBox: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  targetColor: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorEmoji: { fontSize: 46 },
  colorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A4A4A",
    marginTop: 10,
    letterSpacing: 0.8,
  },
  confetti: { position: "absolute", top: 30 },
  confettiText: { fontSize: 36 },
  // Options
  optionsSection: { zIndex: 1, marginBottom: 20 },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  optionContainer: {
    width: (width - 42) / 2,
    marginBottom: 10,
  },
  optionBox: {
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  colorButton: {
    width: 75,
    height: 75,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonEmoji: { fontSize: 36 },
  optionName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A4A4A",
    marginTop: 7,
    letterSpacing: 0.5,
  },
});