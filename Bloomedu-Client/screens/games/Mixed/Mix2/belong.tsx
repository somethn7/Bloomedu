import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';
import { GAME_CONTENTS } from '../../../games/gameData';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width * 0.35;
const BASKET_SIZE = width * 0.38;

// --- TÜM KATEGORİLERİ KARIŞTIRAN FONKSİYON ---
const createMixedItems = () => {
  const allCategories = Object.keys(GAME_CONTENTS).filter(
    (key) => GAME_CONTENTS[key].Level1 && GAME_CONTENTS[key].Level1.length > 0
  );

  let pool: any[] = [];
  allCategories.forEach(catKey => {
    GAME_CONTENTS[catKey].Level1.forEach((item: any) => {
      pool.push({ ...item, correctCategory: catKey });
    });
  });

  return pool.sort(() => Math.random() - 0.5).slice(0, 10); // Toplam 10 karışık soru
};

export default function belong({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as any) || {};

  // Orijinal State Yapın
  const [items] = useState(() => createMixedItems());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | ''>('');
  const [gameFinished, setGameFinished] = useState(false);
  
  // Şıklar için dinamik state
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);

  // Orijinal Metrics (Dokunulmadı)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Orijinal Refs (Dokunulmadı)
  const gameStartTimeRef = useRef<number>(Date.now());
  const itemScale = useRef(new Animated.Value(1)).current;
  const itemShake = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const currentItem = items[currentIndex] || items[items.length - 1]; 
  const totalQuestions = items.length;

  // Her soru değiştiğinde şıkları (sepetleri) belirle
  useEffect(() => {
    if (currentItem && !gameFinished) {
      const correctCat = currentItem.correctCategory;
      const allCats = Object.keys(GAME_CONTENTS).filter(c => GAME_CONTENTS[c].Level1?.length > 0);
      const otherCats = allCats.filter(c => c !== correctCat);
      const wrongCat = otherCats[Math.floor(Math.random() * otherCats.length)];

      const options = [
        { id: correctCat, name: correctCat, emoji: GAME_CONTENTS[correctCat].Level1[0].emoji },
        { id: wrongCat, name: wrongCat, emoji: GAME_CONTENTS[wrongCat].Level1[0].emoji }
      ].sort(() => Math.random() - 0.5);

      setCurrentOptions(options);
    }
  }, [currentIndex]);

  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');
    return () => { Tts.stop(); };
  }, []);

  useEffect(() => {
    if (!gameFinished && currentItem) {
      setTimeout(() => { speakInstruction(); }, 500);
    }
  }, [currentIndex, gameFinished]);

  const speakInstruction = () => {
    if (currentItem && !gameFinished) {
      Tts.speak(`Where does the ${currentItem.name} belong?`);
    }
  };

  // Orijinal handleBasketTap Mantığın (Dokunulmadı)
  const handleBasketTap = (tappedCategory: string) => {
    if (feedback || gameFinished) return;

    if (tappedCategory === currentItem.correctCategory) {
      const newScore = score + 1;
      setScore(newScore);
      const newAnsweredCount = answeredCount + 1;
      setAnsweredCount(newAnsweredCount);
      setFeedback('correct');

      Animated.parallel([
        Animated.sequence([
          Animated.timing(itemScale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
          Animated.timing(itemScale, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      Tts.speak('Correct!');

      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
          setFeedback('');
          itemScale.setValue(1);
          successOpacity.setValue(0);
        } else {
          setGameFinished(true);
          completeGame(newScore, newAnsweredCount);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setWrongCount(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 1));

      Animated.sequence([
        Animated.timing(itemShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(itemShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(itemShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(itemShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      Tts.speak('Try again!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  // Orijinal Veri Gönderme ve Bitirme Mantığın (Dokunulmadı)
  const completeGame = async (finalScore?: number, finalAnswered?: number) => {
    if (!child?.id) return;
    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    const scoreToUse = finalScore !== undefined ? finalScore : score;
    const answeredToUse = finalAnswered !== undefined ? finalAnswered : answeredCount;
    const totalAttempts = totalQuestions + wrongCount;
    const successRate = Math.round((totalQuestions / totalAttempts) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'belonging',
        level: 2,
        score: scoreToUse,
        max_score: totalQuestions,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: { totalQuestions, answeredCount: answeredToUse, wrongCount, successRate },
        completed: true,
      });
    } catch (err) { console.log('❌ Error:', err); }

    let completionMessage = scoreToUse === totalQuestions ? 'Amazing! 🌟' : 'Great job! 👏';

    const gameNav = createGameCompletionHandler({
      navigation, child, gameSequence, currentGameIndex, categoryTitle,
      resetGame: () => {
        navigation.replace('belong', { ...route.params });
      },
    });
    gameNav.showCompletionMessage(scoreToUse, totalQuestions, completionMessage);
  };

  const sequenceInfo = gameSequence && currentGameIndex !== undefined ? `Game ${currentGameIndex + 1}/${gameSequence.length}` : '';

  if (!currentItem || currentOptions.length === 0) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🧺 Sorting Baskets</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {score}/{totalQuestions}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIndex + 1) / totalQuestions) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Item {Math.min(currentIndex + 1, totalQuestions)} of {totalQuestions}</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>Where does it belong? 🤔</Text>
            <TouchableOpacity style={styles.hearAgainButton} onPress={() => speakInstruction()}>
              <Text style={styles.hearAgainText}>🔊 Hear again</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemSection}>
            <Animated.View style={[styles.itemCard, { transform: [{ scale: itemScale }, { translateX: itemShake }], borderColor: feedback === 'wrong' ? '#D84315' : '#00796B' }]}>
              <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
              <Text style={styles.itemName}>{currentItem.name}</Text>
            </Animated.View>
            <Animated.View style={[styles.successMessage, { opacity: successOpacity }]}>
              <Text style={styles.successText}>✨ Perfect! ✨</Text>
            </Animated.View>
          </View>

          <View style={styles.basketsSection}>
            <Text style={styles.basketsTitle}>Choose the basket:</Text>
            <View style={styles.basketsContainer}>
              {currentOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.basket, feedback === 'correct' && currentItem.correctCategory === opt.id && styles.correctBasket]}
                  onPress={() => handleBasketTap(opt.id)}
                >
                  <View style={styles.basketContent}>
                    <Text style={styles.basketIcon}>{opt.emoji}</Text>
                    <Text style={styles.basketName}>{opt.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, backgroundColor: '#fff', elevation: 3 },
  backButton: { padding: 10 },
  backButtonText: { fontSize: 16, color: '#00796B', fontWeight: 'bold' },
  titleContainer: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sequenceText: { fontSize: 12, color: '#666', marginTop: 2 },
  scoreContainer: { backgroundColor: '#00796B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  progressBar: { height: 10, backgroundColor: '#E9ECEF', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00796B', borderRadius: 5 },
  progressText: { textAlign: 'center', marginTop: 8, fontSize: 14, color: '#666', fontWeight: '600' },
  gameArea: { flex: 1, paddingHorizontal: 20 },
  instructionBox: { marginTop: 10, marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', elevation: 3 },
  instructionText: { fontSize: 20, color: '#333', textAlign: 'center', fontWeight: '700', marginBottom: 12 },
  hearAgainButton: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#00796B', borderRadius: 20 },
  hearAgainText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  itemSection: { alignItems: 'center', marginBottom: 30 },
  itemCard: { width: ITEM_SIZE, height: ITEM_SIZE, backgroundColor: '#FFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 5, elevation: 10 },
  itemEmoji: { fontSize: ITEM_SIZE * 0.45, marginBottom: 10 },
  itemName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  successMessage: { position: 'absolute', top: -50, backgroundColor: 'rgba(76, 175, 80, 0.95)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  successText: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  basketsSection: { flex: 1 },
  basketsTitle: { fontSize: 18, fontWeight: '700', color: '#555', textAlign: 'center', marginBottom: 20 },
  basketsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10 },
  basket: { width: BASKET_SIZE, height: BASKET_SIZE * 1.1, borderRadius: 20, borderWidth: 4, borderColor: '#00796B', backgroundColor: '#fff', elevation: 6 },
  correctBasket: { borderColor: '#4CAF50', backgroundColor: '#C8E6C9' },
  basketContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  basketIcon: { fontSize: 56, marginBottom: 10 },
  basketName: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#333' },
});