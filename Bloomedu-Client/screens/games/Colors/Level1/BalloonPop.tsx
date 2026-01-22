import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from "@react-navigation/native";
import { sendGameResult } from "../../../../config/api";
import { createGameCompletionHandler } from "../../../../utils/gameNavigation";

const { width, height } = Dimensions.get('window');

const ALL_COLORS = [
  { id: 'red', name: 'RED', code: '#FF0000' },
  { id: 'blue', name: 'BLUE', code: '#0000FF' },
  { id: 'yellow', name: 'YELLOW', code: '#FFD700' },
  { id: 'green', name: 'GREEN', code: '#008000' },
  { id: 'black', name: 'BLACK', code: '#000000' },
  { id: 'white', name: 'WHITE', code: '#FFFFFF', border: true },
];

const TOTAL_STAGES = 10; 
const FEEDBACKS = ["Correct!", "Great!", "Awesome!", "Well done!", "Perfect!"];

const BalloonPopGame = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [balloons, setBalloons] = useState<any[]>([]);
  const [targetColor, setTargetColor] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  
  // Metrikler
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());
  
  // Animasyon Değerleri
  const successAnim = useRef(new Animated.Value(0)).current;
  const balloonIdCounter = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeAnimationsRef = useRef<Map<number, Animated.CompositeAnimation>>(new Map());
  const isMountedRef = useRef(true);

  useEffect(() => {
    initTts();
    setNewTarget();
    intervalRef.current = setInterval(addBalloon, 2000);
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      activeAnimationsRef.current.forEach((anim) => anim.stop());
      activeAnimationsRef.current.clear();
      void Tts.stop();
    };
  }, []);

  const initTts = async () => {
    try {
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.35);
    } catch (err) {}
  };

  const setNewTarget = () => {
    const randomColor = ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
    setTargetColor(randomColor);
    Tts.stop();
    Tts.speak(`Find the ${randomColor.name} balloon!`);
  };

  const triggerSuccessFeedback = () => {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.spring(successAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addBalloon = () => {
    if (gameFinished) return;
    const randomColor = ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
    const startX = Math.random() * (width - 100) + 10;

    const newBalloon = {
      id: balloonIdCounter.current++,
      color: randomColor,
      anim: new Animated.Value(0),
      startX: startX,
    };

    setBalloons(prev => [...prev.slice(-15), newBalloon]); 

    const anim = Animated.timing(newBalloon.anim, {
      toValue: 1,
      duration: 15000, 
      useNativeDriver: true,
    });
    activeAnimationsRef.current.set(newBalloon.id, anim);
    anim.start(() => {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        activeAnimationsRef.current.delete(newBalloon.id);
        setBalloons(prev => prev.filter(b => b.id !== newBalloon.id));
      }, 0);
    });
  };

  const handlePop = (id: number, color: any) => {
    if (gameFinished) return;

    const anim = activeAnimationsRef.current.get(id);
    if (anim) {
      anim.stop();
      activeAnimationsRef.current.delete(id);
    }

    if (color.id === targetColor.id) {
      const randomFeedback = FEEDBACKS[Math.floor(Math.random() * FEEDBACKS.length)];
      Tts.stop();
      Tts.speak(randomFeedback);
      
      triggerSuccessFeedback();
      setScore(s => s + 1);
      setBalloons(prev => prev.filter(b => b.id !== id));
      
      if (currentStage + 1 >= TOTAL_STAGES) {
        setGameFinished(true);
      } else {
        setCurrentStage(s => s + 1);
        setTimeout(setNewTarget, 1000); 
      }
    } else {
      setWrongCount(w => w + 1);
      Tts.stop();
      Tts.speak("Not that one! Look again.");
    }
  };

  const finalize = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    

    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: "balloon_pop",
        level: 1,
        score: score,
        max_score: TOTAL_STAGES,
        duration_seconds: duration,
        wrong_count: wrongCount,
        success_rate: successRate,
        completed: true,
        details: {
          totalAttempts,
          successRate
        }
      });
    } catch (err) {
        console.log("Database Error:", err);
    }

    const gameNav = createGameCompletionHandler({
      navigation, child, gameSequence, currentGameIndex, categoryTitle,
      resetGame: () => {
        setScore(0); setWrongCount(0); setCurrentStage(0);
        setGameFinished(false); setNewTarget();
      }
    });
    gameNav.showCompletionMessage(score, TOTAL_STAGES, "🎉 Amazing Popping!");
  };

  useEffect(() => {
    if (gameFinished) finalize();
  }, [gameFinished]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pop It! 🎈</Text>
        <Text style={styles.progressText}>{currentStage} / {TOTAL_STAGES}</Text>
      </View>

      <View style={styles.gameArea}>
        {targetColor && (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Find the <Text style={{ color: targetColor.code === '#FFFFFF' ? '#888' : targetColor.code }}>
                {targetColor.name}
              </Text>
            </Text>
          </View>
        )}

        {/* Success Message */}
        <Animated.View style={[
          styles.successMessage, 
          { 
            opacity: successAnim,
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }]
          }
        ]}>
          <Text style={styles.successText}>🎉 Perfect ! 🎉</Text>
        </Animated.View>

        {balloons.map(b => (
          <TouchableOpacity
            key={b.id}
            onPress={() => handlePop(b.id, b.color)}
            activeOpacity={1}
            style={[styles.balloonContainer, {
              left: b.startX,
              transform: [{
                translateY: b.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, -250]
                })
              }]
            }]}
          >
            <View style={[styles.balloonBody, { 
                backgroundColor: b.color.code, 
                borderColor: b.color.border ? '#CCC' : 'transparent',
                borderWidth: b.color.border ? 2 : 0 
            }]}>
               <View style={styles.balloonHighlight} />
            </View>
            <View style={styles.knot} />
            <View style={styles.string} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E1F5FE' },
  header: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0288D1' },
  progressText: { fontSize: 18, fontWeight: 'bold', color: '#0288D1' },
  gameArea: { flex: 1, overflow: 'hidden' },
  
  instructionBox: { position: 'absolute', top: 20, alignSelf: 'center', padding: 12, backgroundColor: 'white', borderRadius: 20, elevation: 6, zIndex: 100 },
  instructionText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  successMessage: { 
    position: 'absolute', 
    top: height / 2 - 50, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(76, 175, 80, 0.95)', 
    paddingHorizontal: 25, 
    paddingVertical: 15, 
    borderRadius: 30, 
    zIndex: 999,
    elevation: 10
  },
  successText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  balloonContainer: { position: 'absolute', alignItems: 'center' },
  balloonBody: { 
    width: 80, 
    height: 105, 
    borderRadius: 40, 
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2
  },
  balloonHighlight: { 
    width: 18, 
    height: 28, 
    backgroundColor: 'rgba(255,255,255,0.4)', 
    borderRadius: 10, 
    position: 'absolute', 
    top: 15, 
    left: 15 
  },
  knot: { 
    width: 12, 
    height: 8, 
    backgroundColor: 'rgba(0,0,0,0.1)', 
    marginTop: -2,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6
  },
  string: { width: 1.5, height: 60, backgroundColor: '#AAA' }
});

export default BalloonPopGame as any;