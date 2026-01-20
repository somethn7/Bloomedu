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

const ALL_ITEMS = [
  { id: 'bandage', emoji: '🩹', name: 'Band-aid' },
  { id: 'toothbrush', emoji: '🪥', name: 'Toothbrush' },
  { id: 'sunglasses', emoji: '🕶️', name: 'Sunglasses' },
  { id: 'gloves', emoji: '🧤', name: 'Gloves' },
  { id: 'soap', emoji: '🧼', name: 'Soap' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream' },
  { id: 'ball', emoji: '⚽', name: 'Ball' },
  { id: 'book', emoji: '📚', name: 'Book' },
];

const MISSIONS = [
  { id: 1, problem: "Ali fell down and his knee is bleeding!", targetItem: 'bandage', story: "What does Ali need for his knee?", icon: '🤕' },
  { id: 2, problem: "Ayşe ate food and her teeth are dirty!", targetItem: 'toothbrush', story: "What should Ayşe use to clean her teeth?", icon: '🦷' },
  { id: 3, problem: "The sun is too bright and Ali can't see!", targetItem: 'sunglasses', story: "What should Ali wear to protect his eyes?", icon: '☀️' },
  { id: 4, problem: "It is snowing and Ayşe's hands are very cold!", targetItem: 'gloves', story: "What should Ayşe wear to warm her hands?", icon: '❄️' },
  { id: 5, problem: "Ali's hands are very dirty and muddy!", targetItem: 'soap', story: "What does Ali need to wash his hands?", icon: '🦠' }
];

const MAX_ROUNDS = 5;

const DraggableItem = ({ item, onDrop, disabled, startPos }: any) => {
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
      style={[{ transform: pan.getTranslateTransform() }, styles.itemCard, { position: 'absolute', left: startPos.x, top: startPos.y, zIndex: 1000 }]}
    >
      <Text style={styles.itemEmoji}>{item.emoji}</Text>
      <Text style={styles.itemLabel}>{item.name}</Text>
    </Animated.View>
  );
};

const BodyCareLevel3 = ({ navigation }: any) => {
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
    const correctItem = ALL_ITEMS.find(i => i.id === currentMission.targetItem);
    const others = ALL_ITEMS.filter(i => i.id !== currentMission.targetItem).sort(() => Math.random() - 0.5).slice(0, 2);
    const combined = [correctItem, ...others].sort(() => Math.random() - 0.5);
    return combined.map((item, idx) => ({ ...item, x: (width * 0.05) + (idx * (width * 0.31)) }));
  }, [currentRound]);

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak(MISSIONS[round].problem);
    setTimeout(() => Tts.speak(MISSIONS[round].story), 3500);
  }, [feedbackAnim]);

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
  const handleDrop = useCallback((itemId: string) => {
    if (isBusy) return;
    const isCorrect = itemId === currentMission.targetItem;
    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak("Perfect!");
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
      Tts.speak("Try again!");
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
      await sendGameResult({
        child_id: child?.id, 
        game_type: 'body_care_logic', 
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
      .showCompletionMessage(score + 1, MISSIONS.length, 'Body Care Hero! 🩹🧼');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.roundText}>Mission {currentRound + 1} / {MAX_ROUNDS}</Text>
          <Text style={styles.title}>Body Care Hero 🩹</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.problemCard}>
            {/* BURASI DİNAMİK OLDU: Her sorunun kendi ikonu var */}
            <Text style={styles.problemEmoji}>{currentMission.icon}</Text>
            <Text style={styles.problemText}>{currentMission.problem}</Text>
            <View style={styles.divider} />
            <Text style={styles.instructionText}>{currentMission.story}</Text>
          </View>
          {feedback && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackIcon}>{feedback === 'success' ? '✅' : '❌'}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.paletteBackground}>
          <Text style={styles.paletteTitle}>Find the right tool to help!</Text>
        </View>

        {currentOptions.map((item: any) => (
          <DraggableItem 
            key={`${currentRound}-${item.id}`}
            item={item} 
            onDrop={handleDrop} 
            disabled={isBusy} 
            startPos={{ x: item.x, y: height - FOOTER_HEIGHT + 25 }} 
          />
        ))}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  header: { alignItems: 'center', marginTop: 10 },
  roundText: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8' },
  title: { fontSize: 24, fontWeight: '900', color: '#0369A1' },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25, marginBottom: FOOTER_HEIGHT * 0.4 },
  problemCard: { backgroundColor: 'white', padding: 25, borderRadius: 30, width: '100%', elevation: 10, alignItems: 'center', borderWidth: 2, borderColor: '#BAE6FD' },
  problemEmoji: { fontSize: 60, marginBottom: 10 }, // Biraz büyüttük
  problemText: { fontSize: 19, fontWeight: '800', color: '#0369A1', textAlign: 'center', lineHeight: 26 },
  divider: { height: 1, backgroundColor: '#E0F2FE', width: '80%', marginVertical: 15 },
  instructionText: { fontSize: 17, fontWeight: '600', color: '#475569', textAlign: 'center' },
  feedbackOverlay: { position: 'absolute', zIndex: 2000 },
  feedbackIcon: { fontSize: 100 },
  paletteBackground: { position: 'absolute', bottom: 0, width: '100%', height: FOOTER_HEIGHT, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, elevation: 20, zIndex: 1, alignItems: 'center', paddingTop: 12 },
  paletteTitle: { fontSize: 15, fontWeight: 'bold', color: '#94A3B8' },
  itemCard: { width: CARD_SIZE, height: CARD_SIZE + 25, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, borderWidth: 1, borderColor: '#E0F2FE' },
  itemEmoji: { fontSize: 50 },
  itemLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginTop: 5 }
});

export default BodyCareLevel3;