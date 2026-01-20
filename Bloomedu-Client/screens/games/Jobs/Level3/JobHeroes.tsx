import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// EKRAN AYARLARI
const FOOTER_HEIGHT = height * 0.28;
const CARD_SIZE = 95; 
const DROP_ZONE_Y = height * 0.55;

const ALL_HEROES = [
  { id: 'electrician', emoji: '👨‍🔧', name: 'Electrician' },
  { id: 'dentist', emoji: '👩‍⚕️', name: 'Dentist' },
  { id: 'firefighter', emoji: '👩‍🚒', name: 'Firefighter' },
  { id: 'vet', emoji: '👨‍⚕️', name: 'Vet' },
  { id: 'chef', emoji: '🧑‍🍳', name: 'Chef' },
  { id: 'police', emoji: '👮', name: 'Police' },
  { id: 'teacher', emoji: '🧑‍🏫', name: 'Teacher' },
];

const MISSIONS = [
  { id: 1, problem: "Oh no! The lights went out. It's very dark!", targetJob: 'electrician', story: "Who can fix the lights?" },
  { id: 2, problem: "Ali's tooth hurts so much! Ouch!", targetJob: 'dentist', story: "Who should Ali visit?" },
  { id: 3, problem: "There is a fire in the kitchen! Help!", targetJob: 'firefighter', story: "Who can put out the fire?" },
  { id: 4, problem: "The little puppy is sick and sad.", targetJob: 'vet', story: "Who can make the puppy feel better?" },
  { id: 5, problem: "We are all very hungry for dinner!", targetJob: 'chef', story: "Who can cook for us?" }
];

const MAX_ROUNDS = 5;

const DraggableHero = ({ hero, onDrop, disabled, startPos }: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.moveY < DROP_ZONE_Y) {
        onDrop(hero.id);
      }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  }), [disabled, hero.id, onDrop]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        { transform: pan.getTranslateTransform() },
        styles.heroCard,
        { position: 'absolute', left: startPos.x, top: startPos.y, zIndex: 1000 }
      ]}
    >
      <Text style={styles.heroEmoji}>{hero.emoji}</Text>
      <Text style={styles.heroLabel}>{hero.name}</Text>
    </Animated.View>
  );
};

const JobHeroesLevel3 = ({ navigation }: any) => {
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
    const correctHero = ALL_HEROES.find(h => h.id === currentMission.targetJob);
    const others = ALL_HEROES.filter(h => h.id !== currentMission.targetJob).sort(() => Math.random() - 0.5).slice(0, 2);
    const combined = [correctHero, ...others].sort(() => Math.random() - 0.5);
    
    return combined.map((h, idx) => ({
      ...h,
      x: (width * 0.05) + (idx * (width * 0.31))
    }));
  }, [currentRound]);

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak(MISSIONS[round].problem);
    setTimeout(() => Tts.speak(MISSIONS[round].story), 3000);
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

  const handleDrop = useCallback((heroId: string) => {
    if (isBusy) return;
    const isCorrect = heroId === currentMission.targetJob;
    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak("Great! You found the hero!");
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
      Tts.speak("Try another one!");
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
        game_type: 'jobs_problem_logic', 
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
      .showCompletionMessage(score + 1, MISSIONS.length, 'Town Hero! 🦸‍♂️');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.roundText}>Mission {currentRound + 1} / {MISSIONS.length}</Text>
          <Text style={styles.title}>Town Heroes 🦸‍♂️</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.problemCard}>
            <Text style={styles.problemEmoji}>🚨</Text>
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
          <Text style={styles.paletteTitle}>Drag the right hero to help!</Text>
        </View>

        {currentOptions.map((hero: any) => (
          <DraggableHero 
            key={`${currentRound}-${hero.id}`}
            hero={hero} 
            onDrop={handleDrop} 
            disabled={isBusy} 
            // y koordinatı 60'tan 20'ye çekildi (Yukarı taşındı)
            startPos={{ x: hero.x, y: height - FOOTER_HEIGHT + 20 }} 
          />
        ))}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { alignItems: 'center', marginTop: 10 },
  roundText: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8' },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25, marginBottom: FOOTER_HEIGHT * 0.4 },
  problemCard: { backgroundColor: 'white', padding: 20, borderRadius: 25, width: '100%', elevation: 10, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  problemEmoji: { fontSize: 40, marginBottom: 10 },
  problemText: { fontSize: 18, fontWeight: '800', color: '#EF4444', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#F1F5F9', width: '80%', marginVertical: 15 },
  instructionText: { fontSize: 16, fontWeight: '600', color: '#475569', textAlign: 'center' },
  feedbackOverlay: { position: 'absolute', zIndex: 2000 },
  feedbackIcon: { fontSize: 100 },
  paletteBackground: { position: 'absolute', bottom: 0, width: '100%', height: FOOTER_HEIGHT, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, elevation: 20, zIndex: 1, alignItems: 'center', paddingTop: 12 },
  paletteTitle: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8' },
  heroCard: { width: CARD_SIZE, height: CARD_SIZE + 25, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, borderWidth: 1, borderColor: '#E2E8F0' },
  heroEmoji: { fontSize: 45 },
  heroLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B', marginTop: 5 }
});

export default JobHeroesLevel3;