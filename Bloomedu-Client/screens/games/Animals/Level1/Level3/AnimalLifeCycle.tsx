import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../../config/api';

const { width, height } = Dimensions.get('window');

// GÖRSEL VERİLER (Yüklenmezse Emojiye Döner)
const CYCLES = [
  {
    id: 1,
    title: "Butterfly Cycle 🦋",
    steps: [
      { id: 'b1', img: 'https://img.icons8.com/color/512/egg.png', image: require('../../../../../assets/images/leaf-311715_1280.jpg'), label: 'Egg', emoji: '🥚', color: '#FFF9C4' },
      { id: 'b2', img: 'https://img.icons8.com/color/512/caterpillar.png', label: 'Caterpillar', emoji: '🐛', color: '#C8E6C9' },
      { id: 'b3', img: 'https://img.icons8.com/color/512/butterfly.png', label: 'Butterfly', emoji: '🦋', color: '#F8BBD0' }
    ],
    story: "A butterfly starts as an egg, grows into a caterpillar, and then becomes a butterfly."
  },
  {
    id: 2,
    title: "Chicken Cycle 🐣",
    steps: [
      { id: 'c1', img: 'https://img.icons8.com/color/512/egg-shell.png', label: 'Egg', emoji: '🥚', color: '#F5F5F5' },
      { id: 'c2', img: 'https://img.icons8.com/color/512/chick.png', label: 'Chick', emoji: '🐤', color: '#FFF9C4' },
      { id: 'c3', img: 'https://img.icons8.com/color/512/chicken.png', label: 'Chicken', emoji: '🐔', color: '#FFCCBC' }
    ],
    story: "First comes the egg, then a little chick, and finally a big chicken!"
  },
  {
    id: 3,
    title: "Frog Cycle 🐸",
    steps: [
      { id: 'f1', img: 'https://img.icons8.com/color/512/caviar.png', image: require('../../../../../assets/images/frogegg.jpg'), label: 'Eggs', emoji: '🫧', color: '#E1F5FE' },
      { id: 'f2', img: 'https://img.icons8.com/color/512/tadpole.png', image: require('../../../../../assets/images/larva.jpg'), label: 'Tadpole', emoji: '🐟', color: '#DCEDC8' },
      { id: 'f3', img: 'https://img.icons8.com/color/512/frog.png', label: 'Frog', emoji: '🐸', color: '#A5D6A7' }
    ],
    story: "Frogs start as eggs in the water, turn into tadpoles, and then grow into frogs!"
  }
];

const AnimalLifeCycleLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [userSequence, setUserSequence] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Seçeneklerin karışık gelmesini sağla (Round bazlı memoize edildi)
  const currentOptions = useMemo(() => {
    return [...CYCLES[currentRound].steps].sort(() => Math.random() - 0.5);
  }, [currentRound]);

  const startNewRound = useCallback((round: number) => {
    setUserSequence([]);
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak(CYCLES[round].story);
  }, [feedbackAnim]);

  // TAM İSTEDİĞİN EFFECT YAPISI
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
    return () => { Tts.stop(); };
  }, [startNewRound]);

  const handleOptionPress = (item: any) => {
    if (isBusy || userSequence.find(i => i.id === item.id)) return;
    const newSequence = [...userSequence, item];
    setUserSequence(newSequence);
    Tts.speak(item.label);
    if (newSequence.length === 3) checkSequence(newSequence);
  };

  const checkSequence = (finalSeq: any[]) => {
    setIsBusy(true);
    const correctSeq = CYCLES[currentRound].steps;
    const isCorrect = finalSeq.every((val, index) => val.id === correctSeq[index].id);

    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak("Great job!");
      setTimeout(() => {
        if (currentRound < CYCLES.length - 1) {
          const next = currentRound + 1;
          setCurrentRound(next);
          startNewRound(next);
        } else {
          finalizeGame();
        }
      }, 2500);
    } else {
      setWrongCount(w => w + 1);
      Tts.speak("Try again!");
      setTimeout(() => {
        setUserSequence([]);
        setFeedback(null);
        setIsBusy(false);
        feedbackAnim.setValue(0);
      }, 1500);
    }
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: child?.id,
        game_type: 'animal_lifecycle_logic',
        level: 3,
        score: score + 1,
        max_score: CYCLES.length,
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
      .showCompletionMessage(score + 1, CYCLES.length, 'Brilliant Scientist! 🔬🦁');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundText}>Round {currentRound + 1} / {CYCLES.length}</Text>
        <Text style={styles.title}>{CYCLES[currentRound].title}</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.timelineRow}>
          {[0, 1, 2].map((idx) => (
            <React.Fragment key={idx}>
              <View style={[styles.slot, userSequence[idx] && { backgroundColor: userSequence[idx].color, borderStyle: 'solid', borderColor: '#4C51BF' }]}>
                {userSequence[idx] ? (
                  userSequence[idx].image ? (
                    <Image source={userSequence[idx].image} style={styles.slotImage} />
                  ) : (
                    <Text style={styles.emojiText}>{userSequence[idx].emoji}</Text>
                  )
                ) : (
                  <Text style={styles.slotNumber}>{idx + 1}</Text>
                )}
              </View>
              {idx < 2 && <Text style={styles.arrow}>➔</Text>}
            </React.Fragment>
          ))}
        </View>

        {feedback && (
          <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
            <Text style={styles.feedbackEmoji}>{feedback === 'success' ? '✅' : '❌'}</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.palette}>
        <Text style={styles.paletteTitle}>Order the life cycle:</Text>
        <View style={styles.optionsRow}>
          {currentOptions.map((item) => {
            const isSelected = userSequence.find(i => i.id === item.id);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.optionCard, { backgroundColor: isSelected ? '#F1F5F9' : 'white' }]} 
                onPress={() => handleOptionPress(item)}
                disabled={isBusy || !!isSelected}
              >
                <View style={[styles.imageContainer, { backgroundColor: item.color }]}>
                  {item.image ? (
                    <Image source={item.image} style={styles.optionImage} />
                  ) : (
                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                  )}
                </View>
                <Text style={styles.optionLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingTop: 20 },
  roundText: { fontSize: 16, fontWeight: 'bold', color: '#94A3B8' },
  title: { fontSize: 26, fontWeight: '900', color: '#1E293B', marginTop: 5 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  slot: { width: 85, height: 85, borderRadius: 22, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#CBD5E1', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  emojiText: { fontSize: 45 },
  slotImage: { width: 85, height: 85, resizeMode: 'cover' },
  slotNumber: { fontSize: 24, fontWeight: 'bold', color: '#CBD5E1' },
  arrow: { fontSize: 20, color: '#CBD5E1', marginHorizontal: 8 },
  feedbackOverlay: { position: 'absolute', zIndex: 10 },
  feedbackEmoji: { fontSize: 100 },
  palette: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, elevation: 20 },
  paletteTitle: { fontSize: 16, fontWeight: 'bold', color: '#64748B', textAlign: 'center', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  optionCard: { width: width * 0.28, padding: 10, borderRadius: 25, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  imageContainer: { width: 65, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5, overflow: 'hidden' },
  optionEmoji: { fontSize: 40 },
  optionImage: { width: 65, height: 65, resizeMode: 'cover' },
  optionLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', textAlign: 'center' },
});

export default AnimalLifeCycleLevel3;