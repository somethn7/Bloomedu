// 🚀 ColorsMatchingGameScreen – No Drag, Clean UseEffect

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
import { useRoute, useNavigation } from "@react-navigation/native";
import Tts from "react-native-tts";

const { width } = Dimensions.get("window");

const COLORS = [
  { name: "red", emoji: "🍎" },
  { name: "green", emoji: "🥦" },
  { name: "blue", emoji: "🔵" },
];

const OBJECTS = [
  { id: 1, color: "red", emoji: "🍎" },
  { id: 2, color: "red", emoji: "🍅" },
  { id: 3, color: "green", emoji: "🥦" },
  { id: 4, color: "green", emoji: "🥒" },
  { id: 5, color: "blue", emoji: "🔵" },
  { id: 6, color: "blue", emoji: "🟦" },
];

const TOTAL_QUESTIONS = 8;

const ColorsMatchingGameScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();

  const { child } = (route.params as any) || {};

  const [targetColor, setTargetColor] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  const colorAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ---------------------------
  // ✅ useEffect DOĞRU KULLANIM
  // ---------------------------
  useEffect(() => {
    const init = async () => {
      try {
        await Tts.setDefaultLanguage("en-US");
      } catch {}

      Tts.setDefaultRate(0.32);
      newQuestion();
    };

    init();

    return () => {
      Tts.stop();
    };
  }, []);

  const speak = (text: string) => {
    try {
      Tts.stop();
      Tts.speak(text);
    } catch {}
  };

  const newQuestion = () => {
    setFeedback("");
    setSelectedId(null);

    const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(newTarget);

    const shuffled = [...OBJECTS]
      .filter(o => o.color === newTarget.name)
      .concat(
        [...OBJECTS].filter(o => o.color !== newTarget.name).slice(0, 3)
      )
      .sort(() => Math.random() - 0.5);

    setOptions(shuffled);

    setTimeout(() => {
      speak(`Select all ${newTarget.name} objects`);
    }, 300);
  };

  const animateFeedback = () => {
    colorAnim.setValue(0);
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start(() =>
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start()
    );
  };

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 80, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: false }),
    ]).start();
  };

  const selectObject = (obj: any) => {
    if (feedback || gameFinished) return;

    setSelectedId(obj.id);

    const isCorrect = obj.color === targetColor.name;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback("correct");
      animateFeedback();
      speak("Correct!");

      setTimeout(() => {
        if (currentQuestion >= TOTAL_QUESTIONS) {
          setGameFinished(true);
        } else {
          setCurrentQuestion(prev => prev + 1);
          newQuestion();
        }
      }, 700);
    } else {
      setWrongCount(prev => prev + 1);
      setFeedback("wrong");
      animateFeedback();
      runShake();
      speak("Try again!");

      setTimeout(() => setFeedback(""), 600);
    }
  };

  if (!targetColor) return null;

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: feedback === "correct" ? ["#FFF", "#77DD77"] : ["#FFF", "#FF6961"],
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Color Match</Text>
          <Text style={styles.subtitle}>{currentQuestion}/{TOTAL_QUESTIONS}</Text>
        </View>

        {/* TARGET COLOR */}
        <View style={styles.target}>
          <Text style={styles.questionText}>Select all {targetColor.name} objects</Text>

          <Animated.View
            style={{
              borderWidth: 5,
              padding: 20,
              borderRadius: 20,
              borderColor,
              transform: [{ translateX: shakeAnim }],
            }}
          >
            <Text style={{ fontSize: 70 }}>{targetColor.emoji}</Text>
          </Animated.View>
        </View>

        {/* OPTIONS */}
        <View style={styles.options}>
          {options.map(obj => (
            <TouchableOpacity
              key={obj.id}
              style={[
                styles.optionBox,
                {
                  borderColor:
                    selectedId === obj.id
                      ? feedback === "correct"
                        ? "#77DD77"
                        : feedback === "wrong"
                        ? "#FF6961"
                        : "#DDD"
                      : "#DDD",
                },
              ]}
              onPress={() => selectObject(obj)}
            >
              <Text style={{ fontSize: 60 }}>{obj.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default ColorsMatchingGameScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF8" },
  scroll: { padding: 16, paddingBottom: 80 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "700", color: "#444" },
  subtitle: { fontSize: 15, fontWeight: "600", color: "#666" },
  target: { alignItems: "center", marginVertical: 20 },
  questionText: { fontSize: 18, fontWeight: "600", color: "#555", marginBottom: 12 },
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
    borderWidth: 3,
    borderRadius: 20,
    marginVertical: 10,
    backgroundColor: "#FFF",
  },
});
