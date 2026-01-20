import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const FOOTER_HEIGHT = height * 0.28;
const CARD_SIZE = 100; 
const DROP_ZONE_Y = height * 0.55;

const ALL_FRUITS = [
  { id: 'lemon', emoji: '🍋', name: 'Lemon' },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon' },
  { id: 'grapes', emoji: '🍇', name: 'Grapes' },
  { id: 'banana', emoji: '🍌', name: 'Banana' },
  { id: 'strawberry', emoji: '🍓', name: 'Strawberry' },
  { id: 'apple', emoji: '🍎', name: 'Apple' },
  { id: 'orange', emoji: '🍊', name: 'Orange' },
  { id: 'pear', emoji: '🍐', name: 'Pear' },
];

const MISSIONS = [
  { id: 1, riddle: "It is yellow and it tastes very sour!", targetId: 'lemon', icon: '👅' },
  { id: 2, riddle: "It is green outside, but red inside!", targetId: 'watermelon', icon: '🔪' },
  { id: 3, riddle: "It grows in big bunches with many small pieces!", targetId: 'grapes', icon: '🍇' },
  { id: 4, riddle: "Monkeys love to eat this long yellow fruit!", targetId: 'banana', icon: '🐒' },
  { id: 5, riddle: "It is red and has tiny seeds on its skin!", targetId: 'strawberry', icon: '🍓' }
];

const MAX_ROUNDS = 5;

const DraggableFruit = ({ item, onDrop, disabled, startPos }: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.moveY < DROP_ZONE_Y) {
        onDrop(item.id);
      }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  }), [disabled, item.id, onDrop]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[{ transform: pan.getTranslateTransform() }, styles.fruitCard, { position: 'absolute', left: startPos.x, top: startPos.y, zIndex: 1000 }]}
    >
      <Text style={styles.fruitEmoji}>{item.emoji}</Text>
      <Text style={styles.fruitLabel}>{item.name}</Text>
    </Animated.View>
  );
};

const FruitLogicLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const currentMission = MISSIONS[currentRound];

  const currentOptions = useMemo(() => {
    const correct = ALL_FRUITS.find(f => f.id === currentMission.targetId);
    const others = ALL_FRUITS.filter(f => f.id !== currentMission.targetId)
      .sort(() => Math.random() - 0.5).slice(0, 2);
    const combined = [correct, ...others].sort(() => Math.random() - 0.5);
    return combined.map((item, idx) => ({ ...item, x: (width * 0.05) + (idx * (width * 0.31)) }));
  }, [currentRound]);

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak("Listen carefully.");
    setTimeout(() => Tts.speak(MISSIONS[round].riddle), 1500);
  }, [feedbackAnim]);

  useEffect(() => {
    const initGame = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.38);
        startNewRound(0);
      } catch (e) { console.log(e); }
    };
    initGame();
    return () => Tts.stop();
  }, [startNewRound]);

  const handleDrop = useCallback((fruitId: string) => {
    if (isBusy) return;
    const isCorrect = fruitId === currentMission.targetId;
    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak("Great job! You are a fruit detective!");
      setTimeout(() => {
        if (currentRound < MISSIONS.length - 1) {
          setCurrentRound(prev => prev + 1);
          startNewRound(currentRound + 1);
        } else {
          finalizeGame();
        }
      }, 2500);
    } else {
      setWrongCount(w => w + 1);
      Tts.speak("Not that one. Think about the clues!");
      setTimeout(() => {
        setFeedback(null);
        setIsBusy(false);
        feedbackAnim.setValue(0);
      }, 1500);
    }
  }, [currentRound, isBusy, startNewRound]);

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      if (!child?.id) {
        console.warn('Child ID not found');
        return;
      }
      await sendGameResult({
        child_id: child.id,
        game_type: 'fruit_logic_reasoning',
        level: 3,
        score: score + 1,
        max_score: MISSIONS.length,
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
      .showCompletionMessage(score + 1, MISSIONS.length, 'Fruit Detective! 🕵️‍♂️🍎');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.roundText}>Case #{currentRound + 1} / {MAX_ROUNDS}</Text>
          <Text style={styles.title}>Fruit Detective 🕵️‍♂️</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.riddleCard}>
            <Text style={styles.riddleIcon}>{currentMission.icon}</Text>
            <Text style={styles.riddleText}>{currentMission.riddle}</Text>
          </View>
          {feedback && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackIcon}>{feedback === 'success' ? '✅' : '❌'}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.paletteBackground}>
          <Text style={styles.paletteTitle}>Find the fruit from the clues!</Text>
        </View>

        {currentOptions.map((item: any) => (
          <DraggableFruit 
            key={`${currentRound}-${item.id}`}
            item={item} 
            onDrop={handleDrop} 
            disabled={isBusy} 
            startPos={{ x: item.x, y: height - FOOTER_HEIGHT + 20 }} 
          />
        ))}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { alignItems: 'center', marginTop: 10 },
  roundText: { fontSize: 14, fontWeight: 'bold', color: '#86EFAC' },
  title: { fontSize: 24, fontWeight: '900', color: '#166534' },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25, marginBottom: FOOTER_HEIGHT * 0.4 },
  riddleCard: { backgroundColor: 'white', padding: 25, borderRadius: 30, width: '100%', elevation: 10, alignItems: 'center', borderWidth: 2, borderColor: '#DCFCE7' },
  riddleIcon: { fontSize: 60, marginBottom: 15 },
  riddleText: { fontSize: 20, fontWeight: '800', color: '#166534', textAlign: 'center', lineHeight: 28 },
  feedbackOverlay: { position: 'absolute', zIndex: 2000 },
  feedbackIcon: { fontSize: 100 },
  paletteBackground: { position: 'absolute', bottom: 0, width: '100%', height: FOOTER_HEIGHT, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, elevation: 20, zIndex: 1, alignItems: 'center', paddingTop: 12 },
  paletteTitle: { fontSize: 15, fontWeight: 'bold', color: '#86EFAC' },
  fruitCard: { width: CARD_SIZE, height: CARD_SIZE + 25, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, borderWidth: 1, borderColor: '#DCFCE7' },
  fruitEmoji: { fontSize: 50 },
  fruitLabel: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginTop: 5 }
});

export default FruitLogicLevel3;
