import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const PRIMARY_COLORS = [
  { id: 'red', name: 'RED', code: '#FF0000', emoji: '🔴' },
  { id: 'blue', name: 'BLUE', code: '#0000FF', emoji: '🔵' },
  { id: 'yellow', name: 'YELLOW', code: '#FFD700', emoji: '🟡' },
];

const COLOR_MIXES: Record<string, { code: string; name: string; emoji: string }> = {
  'red+blue': { code: '#8B00FF', name: 'PURPLE', emoji: '🟣' },
  'red+yellow': { code: '#FF8C00', name: 'ORANGE', emoji: '🟠' },
  'blue+yellow': { code: '#00FF00', name: 'GREEN', emoji: '🟢' },
};

const TARGETS = [
  { mix: 'red+blue', result: COLOR_MIXES['red+blue'] },
  { mix: 'red+yellow', result: COLOR_MIXES['red+yellow'] },
  { mix: 'blue+yellow', result: COLOR_MIXES['blue+yellow'] },
  { mix: 'red+blue', result: COLOR_MIXES['red+blue'] },
  { mix: 'blue+yellow', result: COLOR_MIXES['blue+yellow'] },
];

const MAX_ROUNDS = 5;

const MagicColorLab = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [tube1, setTube1] = useState<any>(null);
  const [tube2, setTube2] = useState<any>(null);
  const [isMixing, setIsMixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const tube1Ref = useRef<any>(null);
  const tube2Ref = useRef<any>(null);
  const isBusyRef = useRef(false);
  const sparkleLoopRef = useRef<any>(null); // Eksik olan ref eklendi

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Animations
  const liquid1Anim = useRef(new Animated.Value(0)).current;
  const liquid2Anim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tube1Ref.current = tube1;
    tube2Ref.current = tube2;
  }, [tube1, tube2]);

  const startNewRound = useCallback((round: number) => {
    setTube1(null);
    setTube2(null);
    setResult(null);
    setFeedback(null);
    setIsMixing(false);
    isBusyRef.current = false;
    liquid1Anim.setValue(0);
    liquid2Anim.setValue(0);
    feedbackAnim.setValue(0);
    
    Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();

    if (TARGETS[round]) {
      Tts.speak(`Target: ${TARGETS[round].result.name}.`);
    }
  }, [bgAnim, feedbackAnim, liquid1Anim, liquid2Anim]);

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.4);
        startNewRound(0);
      } catch (error) {
        console.log("TTS Error:", error);
      }
    };

    initTts();

    return () => {
      Tts.stop();
    };
  }, [startNewRound]);

  const autoFillTube = (color: any) => {
    if (isBusyRef.current) return;
    if (!tube1Ref.current) {
      setTube1(color);
      Tts.speak(color.name);
      Animated.timing(liquid1Anim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    } else if (!tube2Ref.current) {
      setTube2(color);
      Tts.speak(color.name);
      Animated.timing(liquid2Anim, { toValue: 1, duration: 800, useNativeDriver: false }).start(() => {
        mixProcess(tube1Ref.current, color);
      });
    }
  };

  const mixProcess = (c1: any, c2: any) => {
    isBusyRef.current = true;
    setIsMixing(true);
    Tts.speak("Mixing...");
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      ]),
      { iterations: 8 }
    );
    
    sparkleLoopRef.current = animation;
    animation.start();

    const mixKey1 = `${c1.id}+${c2.id}`;
    const mixKey2 = `${c2.id}+${c1.id}`;
    const mixResult = COLOR_MIXES[mixKey1] || COLOR_MIXES[mixKey2];

    setTimeout(() => {
      if (sparkleLoopRef.current) {
        sparkleLoopRef.current.stop();
        sparkleLoopRef.current = null;
      }
      setIsMixing(false);
      setResult(mixResult);
      
      const isCorrect = mixResult?.name === TARGETS[currentRound].result.name;
      setFeedback(isCorrect ? 'success' : 'error');
      
      Animated.timing(bgAnim, { toValue: isCorrect ? 1 : -1, duration: 500, useNativeDriver: false }).start();
      Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

      if (isCorrect) {
        setScore(s => s + 1);
        Tts.speak(`Perfect! You made ${mixResult.name}!`);
        setTimeout(() => {
          if (currentRound < MAX_ROUNDS - 1) {
            const next = currentRound + 1;
            setCurrentRound(next);
            startNewRound(next);
          } else {
            finalizeGame();
          }
        }, 2500);
      } else {
        setWrongCount(w => w + 1);
        Tts.speak("Not quite. Let's try again!");
        setTimeout(() => {
          setTube1(null);
          setTube2(null);
          setResult(null);
          setFeedback(null);
          isBusyRef.current = false;
          liquid1Anim.setValue(0);
          liquid2Anim.setValue(0);
          feedbackAnim.setValue(0);
          Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
        }, 2000);
      }
    }, 1500);
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: child?.id,
        game_type: 'magic-color-lab',
        level: 3,
        score: score + 1,
        max_score: MAX_ROUNDS,
        duration_seconds: duration,
        wrong_count: wrongCount,
        completed: true,
        success_rate: successRate,
        details: {
          rounds_completed: currentRound + 1,
          total_attempts: totalAttempts + 1,
          wrong_count: wrongCount,
          success_rate: successRate,
        },
      } as any);
    } catch (e) { console.log(e); }

    createGameCompletionHandler({ navigation, child, gameSequence, currentGameIndex, categoryTitle })
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Color Scientist! 🧪');
  };

  const DraggableColor = ({ color }: { color: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: () => !isBusyRef.current && !feedback,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.moveY < height * 0.7) autoFillTube(color);
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    }), [color, feedback]);

    return (
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.colorCircle, { backgroundColor: color.code }]}>
        <Text style={styles.emoji}>{color.emoji}</Text>
      </Animated.View>
    );
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#fff5f5', '#F8F9FA', '#e6ffed'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.targetTitle}>Target: {TARGETS[currentRound].result.name}</Text>
          <View style={[styles.targetPreview, { backgroundColor: TARGETS[currentRound].result.code }]} />
        </View>

        <View style={styles.labArea}>
          <View style={styles.tubesContainer}>
            <Animated.View style={[styles.tubeFrame, { transform: [{ translateX: feedback === 'error' ? shakeAnim : (isMixing ? shakeAnim : 0) }] }]}>
              <View style={styles.tubeInside}>
                <Animated.View style={[styles.liquid, { 
                  backgroundColor: tube1?.code || 'transparent',
                  height: liquid1Anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '85%'] })
                }]} />
              </View>
              <Text style={styles.tubeLabel}>Tube 1</Text>
            </Animated.View>

            <Text style={styles.plusSign}>{isMixing ? '🧪' : '+'}</Text>

            <Animated.View style={[styles.tubeFrame, { transform: [{ translateX: feedback === 'error' ? shakeAnim : (isMixing ? shakeAnim : 0) }] }]}>
              <View style={styles.tubeInside}>
                <Animated.View style={[styles.liquid, { 
                  backgroundColor: tube2?.code || 'transparent',
                  height: liquid2Anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '85%'] })
                }]} />
              </View>
              <Text style={styles.tubeLabel}>Tube 2</Text>
            </Animated.View>
          </View>

          {feedback && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackIcon}>{feedback === 'success' ? '✅' : '❌'}</Text>
              <Text style={[styles.feedbackText, { color: feedback === 'success' ? '#28a745' : '#dc3545' }]}>
                {feedback === 'success' ? 'WELL DONE!' : 'TRY AGAIN!'}
              </Text>
            </Animated.View>
          )}

          {result && !feedback && (
            <View style={styles.resultFlask}>
              <View style={[styles.flaskInside, { backgroundColor: result.code }]}>
                 <Text style={styles.flaskEmoji}>{result.emoji}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.palette}>
          {PRIMARY_COLORS.map(c => <DraggableColor key={c.id} color={c} />)}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 15 },
  targetTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  targetPreview: { width: 50, height: 50, borderRadius: 25, marginTop: 8, borderWidth: 2, borderColor: '#DDD' },
  labArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tubesContainer: { flexDirection: 'row', alignItems: 'center' },
  tubeFrame: { alignItems: 'center', marginHorizontal: 15 },
  tubeInside: {
    width: 75, height: 165, borderWidth: 4, borderColor: '#444',
    borderBottomLeftRadius: 37, borderBottomRightRadius: 37,
    backgroundColor: '#FFF', overflow: 'hidden', justifyContent: 'flex-end'
  },
  liquid: { width: '100%' },
  tubeLabel: { marginTop: 10, fontWeight: 'bold', color: '#666' },
  plusSign: { fontSize: 40, marginHorizontal: 10, color: '#444' },
  feedbackOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  feedbackIcon: { fontSize: 100 },
  feedbackText: { fontSize: 28, fontWeight: '900', marginTop: 10 },
  resultFlask: { position: 'absolute' },
  flaskInside: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#444', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  flaskEmoji: { fontSize: 45 },
  palette: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 40, backgroundColor: '#FFF', paddingTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  colorCircle: { width: 85, height: 85, borderRadius: 42, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  emoji: { fontSize: 38 }
});

export default MagicColorLab;