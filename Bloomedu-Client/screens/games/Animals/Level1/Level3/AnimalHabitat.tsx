import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../../config/api';
const { width, height } = Dimensions.get('window');

// FOOTER Ayarları
const FOOTER_HEIGHT = height * 0.3; 
// Koordinatları biraz daha yukarı (eksi yönde) çektik
const ROW_1_Y = height - FOOTER_HEIGHT - 15; // Panel çizgisinin hemen üstünden başlar
const ROW_2_Y = height - FOOTER_HEIGHT + 75; // İkinci sıra da yukarı çekildi

const ANIMALS = [
  { id: 'lion', name: 'Lion', emoji: '🦁', habitat: 'forest', startPos: { x: width * 0.1, y: ROW_1_Y } },
  { id: 'whale', name: 'Whale', emoji: '🐋', habitat: 'sea', startPos: { x: width * 0.4, y: ROW_1_Y } },
  { id: 'cow', name: 'Cow', emoji: '🐮', habitat: 'farm', startPos: { x: width * 0.7, y: ROW_1_Y } },
  { id: 'monkey', name: 'Monkey', emoji: '🐒', habitat: 'forest', startPos: { x: width * 0.1, y: ROW_2_Y } },
  { id: 'shark', name: 'Shark', emoji: '🦈', habitat: 'sea', startPos: { x: width * 0.4, y: ROW_2_Y } },
  { id: 'chicken', name: 'Chicken', emoji: '🐔', habitat: 'farm', startPos: { x: width * 0.7, y: ROW_2_Y } },
];

const HABITATS = [
  { id: 'forest', name: 'Forest', icon: '🌲', bgColor: '#2D5A27' },
  { id: 'sea', name: 'Sea', icon: '🌊', bgColor: '#1E3D59' },
  { id: 'farm', name: 'Farm', icon: '🚜', bgColor: '#8D5524' },
];

const ROUNDS = [
  { id: 1, habitatId: 'sea', question: "Who lives in the sea?", targetEmoji: '🌊' },
  { id: 2, habitatId: 'forest', question: "Who lives in the forest?", targetEmoji: '🌲' },
  { id: 3, habitatId: 'farm', question: "Who lives on the farm?", targetEmoji: '🚜' },
  { id: 4, habitatId: 'sea', question: "Find another one who lives in the sea!", targetEmoji: '🌊' },
  { id: 5, habitatId: 'forest', question: "Find another one who lives in the forest!", targetEmoji: '🌲' },
];

const MAX_ROUNDS = 5;

const DraggableAnimal = ({ animal, onDrop, disabled }: any) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.moveY < height * 0.6) {
        onDrop(animal.id);
      }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  }), [disabled, animal.id, onDrop]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        { transform: pan.getTranslateTransform() },
        styles.animalCard,
        { position: 'absolute', left: animal.startPos.x, top: animal.startPos.y, zIndex: 1000 }
      ]}
    >
      <Text style={styles.animalEmoji}>{animal.emoji}</Text>
    </Animated.View>
  );
};

const AnimalHabitatsLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child: childData, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completedAnimals, setCompletedAnimals] = useState<string[]>([]); // Doğru cevap verilen hayvanlar
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
    Tts.speak(ROUNDS[round].question);
  }, [bgAnim, feedbackAnim]);

  // Doğru cevap verilen hayvanları filtrele
  const availableAnimals = useMemo(() => {
    return ANIMALS.filter(animal => !completedAnimals.includes(animal.id));
  }, [completedAnimals]);

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

  const handleDrop = useCallback((animalId: string) => {
    if (isBusy) return;
    const isCorrect = ANIMALS.find(a => a.id === animalId)?.habitat === ROUNDS[currentRound].habitatId;

    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.timing(bgAnim, { toValue: isCorrect ? 1 : -1, duration: 500, useNativeDriver: false }).start();
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      // Doğru cevap verilen hayvanı listeye ekle
      setCompletedAnimals(prev => [...prev, animalId]);
      Tts.speak("Great job!");
      setTimeout(() => {
        if (currentRound < MAX_ROUNDS - 1) {
          setCurrentRound(r => r + 1);
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
        Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
      }, 1500);
    }
  }, [currentRound, isBusy, startNewRound]);

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: childData?.id,
        game_type: 'animal_habitats_logic',
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
    createGameCompletionHandler({ navigation, child: childData, gameSequence, currentGameIndex, categoryTitle })
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Animal Explorer! 🦁🌊');
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#fff5f5', '#F8F9FA', '#e6ffed'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Animal Habitats 🌍</Text>
          <Text style={styles.roundText}>Round {currentRound + 1} / {MAX_ROUNDS}</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.targetContainer}>
            <Text style={styles.questionText}>{ROUNDS[currentRound].question}</Text>
            <View style={[styles.habitatBox, { borderColor: HABITATS.find(h => h.id === ROUNDS[currentRound].habitatId)?.bgColor }]}>
              <Text style={styles.habitatIcon}>{ROUNDS[currentRound].targetEmoji}</Text>
            </View>
          </View>

          {feedback && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackEmoji}>{feedback === 'success' ? '✅' : '❌'}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.paletteBackground} />

        {availableAnimals.map(a => (
          <DraggableAnimal key={a.id} animal={a} onDrop={handleDrop} disabled={isBusy} />
        ))}
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 15, zIndex: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  roundText: { fontSize: 16, color: '#666' },
  gameArea: { 
    height: height * 0.5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  targetContainer: { alignItems: 'center', width: '85%' },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#444', marginBottom: 15 },
  habitatBox: { 
    width: 160, height: 160, borderRadius: 40, backgroundColor: 'white', 
    borderStyle: 'dashed', borderWidth: 4, justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  habitatIcon: { fontSize: 80 },
  feedbackOverlay: { position: 'absolute', zIndex: 2000, alignSelf: 'center' },
  feedbackEmoji: { fontSize: 100 },
  paletteBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: FOOTER_HEIGHT, 
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 1,
  },
  animalCard: {
    width: 75, height: 75, borderRadius: 20, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4
  },
  animalEmoji: { fontSize: 45 },
});

export default AnimalHabitatsLevel3;