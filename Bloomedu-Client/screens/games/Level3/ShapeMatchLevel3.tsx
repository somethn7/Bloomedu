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
import Tts from 'react-native-tts';
import { createGameCompletionHandler } from "../../../utils/gameNavigation";
import { sendGameResult } from "../../../config/api";

const { width } = Dimensions.get("window");

const SHAPES = [
  { id: 1, type: "circle", color: "#FFD1DC" },
  { id: 2, type: "square", color: "#B5EAD7" },
  { id: 3, type: "triangle", color: "#C7CEEA" },
  { id: 4, type: "star", color: "#FFF5BA" },
];

const TOTAL_QUESTIONS = 10;

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
  gameSequence?: any[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

const ShapeMatchLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } =
    (route.params as RouteParams) || {};

  const [targetShape, setTargetShape] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0); // SKOR: Doğru cevaplardan yanlış düşülür
  const [wrongCount, setWrongCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gameStartTime] = useState(Date.now());

  const colorAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // TTS ayarları
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3); // Yavaş konuşma
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');
    
    newQuestion();
  }, []);

  const newQuestion = () => {
    setFeedback("");
    setSelectedId(null);
    const newTarget = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setTargetShape(newTarget);
    setOptions([...SHAPES].sort(() => Math.random() - 0.5));
    
    // Şekil adını söyle
    setTimeout(() => {
      Tts.speak(`Find the ${newTarget.type}`);
    }, 500);
  };

  const selectShape = (shape: any) => {
    if (feedback) return;

    setSelectedId(shape.id);
    const isCorrect = shape.id === targetShape.id;

    if (isCorrect) {
      // Doğru cevap - skor artar
      setScore((p) => p + 1);
      setFeedback("correct");
      animateFeedback(true);
      Tts.speak("Correct! Well done!");
      setTimeout(() => nextStep(), 800);
    } else {
      // Yanlış cevap - skor düşer (minimum 0)
      setScore((p) => Math.max(0, p - 1));
      setWrongCount((p) => p + 1);
      setFeedback("wrong");
      animateFeedback(false);
      runShake();
      Tts.speak("Try again!");
      setTimeout(() => setFeedback(""), 700);
    }
  };

  const animateFeedback = (isCorrect: boolean) => {
    colorAnim.setValue(0);
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start();
    });
  };

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const nextStep = () => {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      setGameFinished(true);
    } else {
      setCurrentQuestion((p) => p + 1);
      newQuestion();
    }
  };

  const restartGame = () => {
    setScore(0);
    setWrongCount(0);
    setCurrentQuestion(1);
    setGameFinished(false);
    Tts.stop();
    newQuestion();
  };

  const sendToDatabase = async () => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }

    const totalTime = Date.now() - gameStartTime;
    await sendGameResult({
      child_id: child.id,
      game_type: 'shape-match',
      level: 3,
      score: score, // Güncel skor (yanlış cevaplar düşülmüş)
      max_score: TOTAL_QUESTIONS,
      duration_seconds: Math.floor(totalTime / 1000),
      completed: true,
    });
  };

  // Oyun bittiği an
  useEffect(() => {
    if (gameFinished) {
      // 1) Önce DB'ye gönder
      sendToDatabase();

      // 2) Sonra completion handler'ı çağır
      handleGameCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFinished]);

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
      score, // Güncel skor (yanlış düşülmüş)
      TOTAL_QUESTIONS,
      '🎉 Amazing! You matched all the shapes perfectly!'
    );
  };

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange:
      feedback === "correct" ? ["#FFF", "#77DD77"] : ["#FFF", "#FF6961"],
  });

  // Başarı oranı hesaplama
  const totalAnswered = currentQuestion > 1 ? currentQuestion - 1 : 0;
  const successRate =
    totalAnswered > 0
      ? Math.round((score / totalAnswered) * 100)
      : 0;

  const renderShape = (type: string, color: string, size = 90) => {
    switch (type) {
      case "circle":
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            }}
          />
        );
      case "square":
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: 18,
              backgroundColor: color,
            }}
          />
        );
      case "triangle":
        return (
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: color,
            }}
          />
        );
      case "star":
        return <Text style={{ fontSize: size * 0.8, color: "#FFD700" }}>★</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🌼 Shape Match</Text>
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
                  {
                    width: `${
                      (currentQuestion / TOTAL_QUESTIONS) * 100
                    }%`,
                  },
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
            <Text style={styles.scoreNumber}>{successRate}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* TARGET SHAPE */}
        <View style={styles.target}>
          <Text style={styles.questionText}>Find this shape 👇</Text>
          {targetShape && (
            <Animated.View
              style={{
                borderWidth: 6,
                borderColor,
                borderRadius: 25,
                padding: 20,
                transform: [{ translateX: shakeAnim }],
              }}
            >
              {renderShape(targetShape.type, targetShape.color, 110)}
            </Animated.View>
          )}
        </View>

        {/* OPTIONS */}
        <View style={styles.options}>
          {options.map((shape) => (
            <TouchableOpacity
              key={shape.id}
              style={[
                styles.optionBox,
                {
                  borderColor:
                    selectedId === shape.id
                      ? feedback === "correct"
                        ? "#77DD77"
                        : "#FF6961"
                      : "#F1EFE9",
                },
              ]}
              onPress={() => selectShape(shape)}
              activeOpacity={0.8}
            >
              {renderShape(shape.type, shape.color, 80)}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ShapeMatchLevel3;

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
  scoreEmoji: { fontSize: 20, marginBottom: 4 },
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
  },
});

