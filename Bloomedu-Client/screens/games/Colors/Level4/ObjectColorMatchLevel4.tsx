// 🌈 Colors Level 4 – Select All Objects With the Target Color
// - ShapeMatchLevel3 ile aynı header + score kartları
// - Wrong seçince kırmızı kalıp durmaz, sadece shake + feedback
// - Success rate düzgün hesaplanır & DB'ye doğru gider

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

// 🎨 AVAILABLE COLORS
const COLORS = [
  { name: "yellow", color: "#FFD93D" },
  { name: "red", color: "#FF6B6B" },
  { name: "blue", color: "#4D96FF" },
  { name: "green", color: "#6BCB77" },
  { name: "purple", color: "#C679FF" },
  { name: "orange", color: "#FF9F45" },
];

// 🧸 OBJECT LIST
const OBJECTS = [
  { id: 1, name: "Lemon", color: "yellow", emoji: "🍋" },
  { id: 2, name: "Banana", color: "yellow", emoji: "🍌" },
  { id: 3, name: "Sun", color: "yellow", emoji: "☀️" },

  { id: 4, name: "Apple", color: "red", emoji: "🍎" },
  { id: 5, name: "Strawberry", color: "red", emoji: "🍓" },
  { id: 6, name: "Chili", color: "red", emoji: "🌶️" },

  { id: 7, name: "Blueberry", color: "blue", emoji: "🫐" },
  { id: 8, name: "Ocean", color: "blue", emoji: "🌊" },

  { id: 9, name: "Broccoli", color: "green", emoji: "🥦" },
  { id: 10, name: "Frog", color: "green", emoji: "🐸" },

  { id: 11, name: "Grapes", color: "purple", emoji: "🍇" },
  { id: 12, name: "Eggplant", color: "purple", emoji: "🍆" },

  { id: 13, name: "Carrot", color: "orange", emoji: "🥕" },
  { id: 14, name: "Pumpkin", color: "orange", emoji: "🎃" },
];

const TOTAL_QUESTIONS = 10;

export default function ObjectColorMatchLevel4({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any =
    (route.params as any) || {};

  const [targetColor, setTargetColor] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  const scoreRef = useRef(0);
  const wrongRef = useRef(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // INIT
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await Tts.setDefaultLanguage("en-US");
      } catch {}
      Tts.setDefaultRate(0.32);

      if (isMounted) newQuestion();
    };

    init();

    return () => {
      isMounted = false;
      Tts.stop();
    };
  }, []);

  const speak = (text: string) => {
    try {
      Tts.stop();
      Tts.speak(text);
    } catch {}
  };

  const animateFeedback = () => {
    colorAnim.setValue(0);
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  };

  // 💡 NEW QUESTION
  const newQuestion = () => {
    setSelected([]);
    setFeedback("");

    const chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(chosenColor);

    const correctObjects = OBJECTS.filter(o => o.color === chosenColor.name);
    const wrongObjects = OBJECTS.filter(o => o.color !== chosenColor.name);

    const numCorrect = Math.random() < 0.5 ? 2 : 3;

    const chosenCorrect = correctObjects
      .sort(() => Math.random() - 0.5)
      .slice(0, numCorrect);

    const chosenWrong = wrongObjects
      .sort(() => Math.random() - 0.5)
      .slice(0, 8 - numCorrect);

    const finalOptions = [...chosenCorrect, ...chosenWrong].sort(
      () => Math.random() - 0.5
    );

    setOptions(finalOptions);
    setCorrectIds(chosenCorrect.map(o => o.id));

    setTimeout(() => speak(`Select all ${chosenColor.name} objects`), 300);
  };

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
    ]).start();
  };

  // SELECT ITEM
  const selectOption = (item: any) => {
    if (feedback || gameFinished) return;
    if (selected.includes(item.id)) return;

    const newSelected = [...selected, item.id];
    setSelected(newSelected);

    const isCorrect = correctIds.includes(item.id);

    if (!isCorrect) {
      wrongRef.current++;
      setWrongCount(wrongRef.current);
      setFeedback("wrong");
      animateFeedback();
      runShake();
      speak("Try again!");

      setTimeout(() => setFeedback(""), 600);
      return;
    }

    // doğru seçim ise ama hala eksik varsa devam
    const remaining = correctIds.filter(id => !newSelected.includes(id));

    if (remaining.length === 0) {
      scoreRef.current++;
      setScore(scoreRef.current);
      setFeedback("correct");
      animateFeedback();
      speak("Great!");

      if (currentQuestion >= TOTAL_QUESTIONS) {
        setGameFinished(true);
      } else {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          newQuestion();
        }, 800);
      }
    }
  };

  // FINISH
  useEffect(() => {
    if (gameFinished) finishGame();
  }, [gameFinished]);

  const finishGame = async () => {
    const totalTimeMs = Date.now() - gameStartTimeRef.current;

    const successRate =
      scoreRef.current + wrongRef.current > 0
        ? Math.round(
            (scoreRef.current / (scoreRef.current + wrongRef.current)) * 100
          )
        : 0;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: "colors-object-multi",
        level: 4,
        score: scoreRef.current,
        max_score: TOTAL_QUESTIONS,
        wrong_count: wrongRef.current,
        success_rate: successRate,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        details: {
          correctCount: scoreRef.current,
          wrongCount: wrongRef.current,
          successRate,
        },
        completed: true,
      });
    } catch {}

    const nav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: restartGame,
    });

    nav.showCompletionMessage(
      scoreRef.current,
      TOTAL_QUESTIONS,
      "🎉 Great job!"
    );
  };

  const restartGame = () => {
    scoreRef.current = 0;
    wrongRef.current = 0;
    setScore(0);
    setWrongCount(0);
    setCurrentQuestion(1);
    setGameFinished(false);
    gameStartTimeRef.current = Date.now();
    newQuestion();
  };

  if (!targetColor) return <View style={{ flex: 1, backgroundColor: "#FFFDF8" }} />;

  const successRateDisplay =
    score + wrongCount > 0
      ? Math.round((score / (score + wrongCount)) * 100)
      : 0;

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange:
      feedback === "correct" ? ["#FFF", "#77DD77"] : ["#FFF", "#FF6961"],
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER (ShapeMatch tarzı) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎨 Color Match</Text>
            <Text style={styles.subtitle}>Level 4</Text>
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

        {/* SCORE CARDS */}
        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, { borderTopColor: "#51CF66" }]}>
            <Text style={styles.scoreEmoji}>🏆</Text>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>

          <View style={[styles.scoreCard, { borderTopColor: "#FF8787" }]}>
            <Text style={styles.scoreEmoji}>✗</Text>
            <Text style={styles.scoreNumber}>{wrongCount}</Text>
            <Text style={styles.scoreLabel}>Wrong</Text>
          </View>

          <View style={[styles.scoreCard, { borderTopColor: "#FFD43B" }]}>
            <Text style={styles.scoreEmoji}>⭐</Text>
            <Text style={styles.scoreNumber}>{successRateDisplay}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* TARGET COLOR (ShapeMatch target alanı gibi) */}
        <View style={styles.target}>
          <Text style={styles.questionText}>Find all objects with this color 👇</Text>

          <Animated.View
            style={{
              borderWidth: 6,
              borderColor,
              borderRadius: 28,
              padding: 18,
              marginTop: 10,
              transform: [{ translateX: shakeAnim }],
            }}
          >
            <View
              style={[
                styles.colorHintCircle,
                { backgroundColor: targetColor.color },
              ]}
            />
          </Animated.View>

          <Text style={styles.subQuestion}>
            Select all <Text style={{ fontWeight: "700" }}>{targetColor.name}</Text> objects
          </Text>
        </View>

        {/* OPTIONS GRID */}
        <View style={styles.options}>
          {options.map(obj => (
            <TouchableOpacity
              key={obj.id}
              style={[
                styles.option,
                selected.includes(obj.id) && correctIds.includes(obj.id)
                  ? styles.correct
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

// STYLE
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF8" },
  scroll: { padding: 16, paddingBottom: 80 },

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
    justifyContent: "space-between",
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
  },
  subQuestion: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
    marginTop: 8,
  },

  colorHintCircle: {
    width: 75,
    height: 75,
    borderRadius: 75,
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },

  option: {
    width: (width - 120) / 2,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderColor: "#DDD",
  },

  correct: {
    borderColor: "#4CD964",
    backgroundColor: "#E9FFE9",
  },

  emoji: { fontSize: 60 },
});
