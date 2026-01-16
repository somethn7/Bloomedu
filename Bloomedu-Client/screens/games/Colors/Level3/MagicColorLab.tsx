import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// Ana renkler (karışım için)
const PRIMARY_COLORS = [
  { id: 'red', name: 'RED', code: '#FF0000', emoji: '🔴' },
  { id: 'blue', name: 'BLUE', code: '#0000FF', emoji: '🔵' },
  { id: 'yellow', name: 'YELLOW', code: '#FFD700', emoji: '🟡' },
];

// Karışım sonuçları
const COLOR_MIXES: Record<string, { code: string; name: string; emoji: string }> = {
  'red+blue': { code: '#8B00FF', name: 'PURPLE', emoji: '🟣' },
  'red+yellow': { code: '#FF8C00', name: 'ORANGE', emoji: '🟠' },
  'blue+yellow': { code: '#00FF00', name: 'GREEN', emoji: '🟢' },
};

const TARGETS = [
  { mix: 'red+blue', result: COLOR_MIXES['red+blue'] },
  { mix: 'red+yellow', result: COLOR_MIXES['red+yellow'] },
  { mix: 'blue+yellow', result: COLOR_MIXES['blue+yellow'] },
  { mix: 'red+blue', result: COLOR_MIXES['red+blue'] }, // Tekrar
  { mix: 'red+yellow', result: COLOR_MIXES['red+yellow'] },
];

const MAX_ROUNDS = 5;

const MagicColorLab = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [targetMix, setTargetMix] = useState<any>(null);
  const [tube1, setTube1] = useState<any>(null);
  const [tube2, setTube2] = useState<any>(null);
  const [isMixing, setIsMixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Animations
  const mixAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.35);
    startNewRound();
    return () => Tts.stop();
  }, []);

  const startNewRound = () => {
    if (currentRound >= MAX_ROUNDS) {
      setGameFinished(true);
      return;
    }

    const target = TARGETS[currentRound];
    setTargetMix(target);
    setTube1(null);
    setTube2(null);
    setResult(null);
    setIsMixing(false);

    setTimeout(() => {
      Tts.speak(`Let's make ${target.result.name}! Which two colors should we mix?`);
    }, 500);
  };

  const handleColorDrop = (color: any, tubeNumber: 1 | 2) => {
    if (isMixing || result) return;

    if (tubeNumber === 1) {
      setTube1(color);
    } else {
      setTube2(color);
    }

    // Her iki tüp doluysa karıştır
    if ((tubeNumber === 1 && tube2) || (tubeNumber === 2 && tube1)) {
      setTimeout(() => {
        mixColors(tubeNumber === 1 ? color : tube1, tubeNumber === 2 ? color : tube2);
      }, 300);
    }
  };

  const mixColors = (color1: any, color2: any) => {
    setIsMixing(true);
    const mixKey1 = `${color1.id}+${color2.id}`;
    const mixKey2 = `${color2.id}+${color1.id}`;
    const mixResult = COLOR_MIXES[mixKey1] || COLOR_MIXES[mixKey2];

    // Animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(mixAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(mixAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(sparkleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ),
    ]).start();

    setTimeout(() => {
      setIsMixing(false);
      setResult(mixResult);

      if (mixResult && mixResult.name === targetMix.result.name) {
        // ✅ Correct!
        setScore(prev => prev + 1);
        Tts.speak(`Perfect! We made ${mixResult.name}!`);
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          startNewRound();
        }, 2000);
      } else {
        // ❌ Wrong
        setWrongCount(prev => prev + 1);
        Tts.speak(`Hmm, that's not ${targetMix.result.name}. Let's try again!`);
        setTimeout(() => {
          setTube1(null);
          setTube2(null);
          setResult(null);
        }, 2000);
      }
    }, 1000);
  };

  const DraggableColor = ({ color }: { color: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          const { moveX, moveY } = gesture;
          const centerX = width / 2;

          // Tube positions (approx)
          const tube1X = centerX - 80;
          const tube2X = centerX + 80;
          const tubeY = height * 0.4;

          if (moveY > tubeY - 50 && moveY < tubeY + 50) {
            if (moveX > tube1X - 40 && moveX < tube1X + 40 && !tube1) {
              handleColorDrop(color, 1);
            } else if (moveX > tube2X - 40 && moveX < tube2X + 40 && !tube2) {
              handleColorDrop(color, 2);
            }
          }

          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      })
    ).current;

    return (
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout()]}>
        <TouchableOpacity
          style={[styles.colorChip, { backgroundColor: color.code }]}
          disabled={isMixing || !!result}
        >
          <Text style={styles.colorEmoji}>{color.emoji}</Text>
          <Text style={styles.colorName}>{color.name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const successRate = Math.round((score / MAX_ROUNDS) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'colors-magic-lab',
        level: 3,
        score,
        max_score: MAX_ROUNDS,
        duration_seconds: duration,
        wrong_count: wrongCount,
        success_rate: successRate,
        completed: true,
      });
    } catch (err) {
      console.log('DB Error:', err);
    }

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setScore(0);
        setWrongCount(0);
        setCurrentRound(0);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
        startNewRound();
      },
    });
    gameNav.showCompletionMessage(score, MAX_ROUNDS, '🎨 Amazing Color Scientist!');
  };

  useEffect(() => {
    if (gameFinished) finalizeGame();
  }, [gameFinished]);

  if (!targetMix) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Magic Color Lab 🧪</Text>
        <Text style={styles.progressText}>Round {currentRound + 1} / {MAX_ROUNDS}</Text>
      </View>

      <View style={styles.gameArea}>
        {/* Target */}
        <View style={styles.targetBox}>
          <Text style={styles.targetLabel}>Make this color:</Text>
          <View style={[styles.targetColorBox, { backgroundColor: targetMix.result.code }]}>
            <Text style={styles.targetEmoji}>{targetMix.result.emoji}</Text>
            <Text style={styles.targetName}>{targetMix.result.name}</Text>
          </View>
        </View>

        {/* Mixing Tubes */}
        <View style={styles.tubesRow}>
          <View style={[styles.tube, { backgroundColor: tube1?.code || '#E8E8E8' }]}>
            {tube1 && <Text style={styles.tubeEmoji}>{tube1.emoji}</Text>}
            <Text style={styles.tubeLabel}>Tube 1</Text>
          </View>

          {isMixing && (
            <Animated.View
              style={[
                styles.sparkle,
                {
                  opacity: sparkleAnim,
                  transform: [{ scale: sparkleAnim }],
                },
              ]}
            >
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>
          )}

          <View style={[styles.tube, { backgroundColor: tube2?.code || '#E8E8E8' }]}>
            {tube2 && <Text style={styles.tubeEmoji}>{tube2.emoji}</Text>}
            <Text style={styles.tubeLabel}>Tube 2</Text>
          </View>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultBox}>
            <View style={[styles.resultColor, { backgroundColor: result.code }]}>
              <Text style={styles.resultEmoji}>{result.emoji}</Text>
              <Text style={styles.resultName}>{result.name}</Text>
            </View>
          </View>
        )}

        {/* Primary Colors (Draggable) */}
        <View style={styles.colorsRow}>
          {PRIMARY_COLORS.map((color) => (
            <DraggableColor key={color.id} color={color} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8FF' },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  progressText: { fontSize: 16, fontWeight: '600', color: '#666' },
  gameArea: { flex: 1, padding: 20, alignItems: 'center' },
  targetBox: { alignItems: 'center', marginBottom: 30 },
  targetLabel: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 10 },
  targetColorBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  targetEmoji: { fontSize: 50, marginBottom: 5 },
  targetName: { fontSize: 18, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.3)' },
  tubesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 30,
  },
  tube: {
    width: 70,
    height: 150,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
    elevation: 4,
  },
  tubeEmoji: { fontSize: 30 },
  tubeLabel: {
    position: 'absolute',
    bottom: -25,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
  sparkleText: { fontSize: 40 },
  resultBox: {
    marginBottom: 30,
    alignItems: 'center',
  },
  resultColor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  resultEmoji: { fontSize: 40, marginBottom: 5 },
  resultName: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 'auto',
    paddingBottom: 30,
  },
  colorChip: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  colorEmoji: { fontSize: 35, marginBottom: 5 },
  colorName: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
});

export default MagicColorLab;
