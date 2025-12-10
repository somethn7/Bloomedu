// 🌈 Colors Level 3 – Object Color Match (NO SCORE VERSION)

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

// 🎨 COLOR POOL
const COLORS = [
  { name: "yellow", color: "#FFD93D" },
  { name: "red", color: "#FF6B6B" },
  { name: "blue", color: "#4D96FF" },
  { name: "green", color: "#6BCB77" },
  { name: "purple", color: "#C679FF" },
  { name: "orange", color: "#FF9F45" },
];

// 🧸 OBJECTS
const OBJECTS = [
  { id: 1, name: "Lemon", color: "yellow", emoji: "🍋" },
  { id: 2, name: "Sun", color: "yellow", emoji: "☀️" },
  { id: 3, name: "Banana", color: "yellow", emoji: "🍌" },
  { id: 4, name: "Apple", color: "red", emoji: "🍎" },
  { id: 5, name: "Strawberry", color: "red", emoji: "🍓" },
  { id: 6, name: "Blueberry", color: "blue", emoji: "🫐" },
  { id: 7, name: "Ocean", color: "blue", emoji: "🌊" },
  { id: 8, name: "Broccoli", color: "green", emoji: "🥦" },
  { id: 9, name: "Frog", color: "green", emoji: "🐸" },
  { id: 10, name: "Grapes", color: "purple", emoji: "🍇" },
  { id: 11, name: "Eggplant", color: "purple", emoji: "🍆" },
  { id: 12, name: "Carrot", color: "orange", emoji: "🥕" },
  { id: 13, name: "Pumpkin", color: "orange", emoji: "🎃" },
];

const TOTAL_QUESTIONS = 10;

export default function ObjectColorMatchLevel3(props: any) {
  const { navigation } = props;
  const route = useRoute();

  const { child, gameSequence, currentGameIndex, categoryTitle } =
    (route.params as any) || {};

  // STATE
  const [targetColor, setTargetColor] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [wrongCount, setWrongCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // COUNTERS
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  // ANIMATIONS
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const gameStartTimeRef = useRef<number>(Date.now());

  // INIT
  useEffect(() => {
    Tts.setDefaultLanguage("en-US").catch(() => {});
    Tts.setDefaultRate(0.32);
    Tts.setDefaultPitch(1.0);

    newQuestion();
  }, []);

  const speak = (text: string) => {
    try {
      Tts.stop();
      Tts.speak(text);
    } catch {}
  };

  // NEW QUESTION
  const newQuestion = () => {
    setFeedback("");
    setSelectedId(null);

    const chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(chosenColor);

    const correctObjects = OBJECTS.filter(o => o.color === chosenColor.name);
    const wrongObjects = OBJECTS.filter(o => o.color !== chosenColor.name);

    const correctOption =
      correctObjects[Math.floor(Math.random() * correctObjects.length)];

    const wrongRandom = wrongObjects.sort(() => Math.random() - 0.5).slice(0, 3);

    setOptions([...wrongRandom, correctOption].sort(() => Math.random() - 0.5));

    setTimeout(() => speak(`Find the ${chosenColor.name} one`), 300);
  };

  // FINISH LISTENER
  useEffect(() => {
    if (gameFinished) {
      finishGame(correctRef.current, wrongRef.current);
    }
  }, [gameFinished]);

  // FINISH GAME
  const finishGame = async (finalCorrect: number, finalWrong: number) => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;

    const successRate =
      finalCorrect + finalWrong > 0
        ? Math.round((finalCorrect / (finalCorrect + finalWrong)) * 100)
        : 0;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: "colors-object-match",
        level: 3,
        score: 0 , // ❗ SCORE ARTIK YOK
        max_score: TOTAL_QUESTIONS,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: finalWrong,
        success_rate: successRate,
        details: { finalCorrect, finalWrong, successRate },
        completed: true,
      });
    } catch (err) {
      console.log("❌ Error sending:", err);
    }

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: restartGame,
    });

    gameNav.showCompletionMessage(
      successRate,
      100,
      "🌈 Well done!"
    );
  };

  const restartGame = () => {
    wrongRef.current = 0;
    correctRef.current = 0;
    setWrongCount(0);
    setCurrentQuestion(1);
    setGameFinished(false);
    newQuestion();
  };

  // OPTION SELECT
  const selectOption = (item: any) => {
    if (feedback || gameFinished) return;

    setSelectedId(item.id);

    const isCorrect = item.color === targetColor?.name;

    if (isCorrect) {
      correctRef.current += 1;

      setFeedback("correct");
      speak("Correct!");

      Animated.sequence([
        Animated.timing(colorAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
      ]).start();

      if (currentQuestion >= TOTAL_QUESTIONS) {
        setGameFinished(true);
      } else {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          newQuestion();
        }, 700);
      }
    } else {
      wrongRef.current += 1;
      setWrongCount(wrongRef.current);

      setFeedback("wrong");
      speak("Try again!");
      runShake();

      setTimeout(() => setFeedback(""), 700);
    }
  };

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 6, duration: 70, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 70, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 70, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: false }),
    ]).start();
  };

  const animatedBorderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: feedback === "correct" ? ["#FFF", "#77DD77"] : ["#FFF", "#FF6961"],
  });

  if (!targetColor)
    return <View style={{ flex: 1, backgroundColor: "#FFFDF8" }} />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎨 Color Match</Text>
            <Text style={styles.subtitle}>Level 3</Text>
          </View>

          <View style={styles.progressBox}>
            <Text style={styles.questionCounter}>
              {currentQuestion}/{TOTAL_QUESTIONS}
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

        {/* WRONG + SUCCESS ONLY */}
        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, { borderTopColor: "#FF8787" }]}>
            <Text style={styles.scoreEmoji}>❌</Text>
            <Text style={styles.scoreNumber}>{wrongCount}</Text>
            <Text style={styles.scoreLabel}>Wrong</Text>
          </View>

          <View style={[styles.scoreCard, { borderTopColor: "#FFD43B" }]}>
            <Text style={styles.scoreEmoji}>⭐</Text>
            <Text style={styles.scoreNumber}>
              {correctRef.current + wrongRef.current > 0
                ? Math.round(
                    (correctRef.current /
                      (correctRef.current + wrongRef.current)) *
                      100
                  )
                : 0}%
            </Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* TARGET COLOR */}
        <View style={styles.target}>
          <Text style={styles.questionText}>Find this color 👇</Text>

          <Animated.View
            style={{
              width: width * 0.55,
              height: width * 0.55,
              backgroundColor: targetColor.color,
              borderRadius: 25,
              borderWidth: 6,
              borderColor: animatedBorderColor,
              transform: [{ translateX: shakeAnim }],
            }}
          />
        </View>

        {/* OPTIONS */}
        <View style={styles.options}>
          {options.map(obj => (
            <TouchableOpacity
              key={obj.id}
              style={[
                styles.optionBox,
                selectedId === obj.id && feedback === "correct"
                  ? { borderColor: "#77DD77" }
                  : selectedId === obj.id && feedback === "wrong"
                  ? { borderColor: "#FF6961" }
                  : {},
              ]}
              onPress={() => selectOption(obj)}
            >
              <Text style={styles.emoji}>{obj.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF8" },
  scroll: { padding: 16, paddingBottom: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#4A4A4A" },
  subtitle: { fontSize: 13, color: "#999" },

  progressBox: { alignItems: "flex-end" },
  questionCounter: { fontSize: 14, fontWeight: "600", color: "#6B6B6B" },

  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: "#E9E9E9",
    borderRadius: 10,
    marginTop: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#74C0FC",
    borderRadius: 10,
  },

  scoreCards: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 15,
  },
  scoreCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderTopWidth: 2,
    elevation: 2,
  },
  scoreEmoji: { fontSize: 20 },
  scoreNumber: { fontSize: 20, fontWeight: "700", color: "#4A4A4A" },
  scoreLabel: { fontSize: 11, color: "#888" },

  target: { alignItems: "center", marginVertical: 16 },
  questionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#5A5A5A",
    marginBottom: 12,
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  optionBox: {
    width: (width - 120) / 2,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDD",
  },
  emoji: { fontSize: 60 },
});
