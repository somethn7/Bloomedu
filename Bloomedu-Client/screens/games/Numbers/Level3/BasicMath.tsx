import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const FRUITS = [
  { id: 'apple', emoji: '🍎', name: 'Apple', color: '#FF6B6B' },
  { id: 'banana', emoji: '🍌', name: 'Banana', color: '#FFD93D' },
];

const ROUNDS = [
  { id: 1, targetApples: 2, targetBananas: 1, total: 3 },
  { id: 2, targetApples: 1, targetBananas: 2, total: 3 },
  { id: 3, targetApples: 2, targetBananas: 2, total: 4 },
  { id: 4, targetApples: 3, targetBananas: 2, total: 5 },
  { id: 5, targetApples: 4, targetBananas: 1, total: 5 },
];

const MAX_ROUNDS = 5;

const ShoppingMathLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child: childData, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [basketApples, setBasketApples] = useState(0);
  const [basketBananas, setBasketBananas] = useState(0);
  const [gameState, setGameState] = useState<'collecting' | 'calculating'>('collecting');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const currentTask = ROUNDS[currentRound];

  const startNewRound = useCallback((round: number) => {
    setBasketApples(0);
    setBasketBananas(0);
    setGameState('collecting');
    setFeedback(null);
    feedbackAnim.setValue(0);
    Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();

    const task = ROUNDS[round];
    Tts.speak(`Put ${task.targetApples} apples and ${task.targetBananas} bananas in the basket.`);
  }, [bgAnim, feedbackAnim]);

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.4);
    startNewRound(0);
  }, [startNewRound]);

  useEffect(() => {
    if (gameState === 'collecting' && currentTask) {
      if (basketApples === currentTask.targetApples && basketBananas === currentTask.targetBananas) {
        setTimeout(() => {
          setGameState('calculating');
          Tts.speak(`Great! Now, how many fruits are in the basket in total?`);
        }, 800);
      }
    }
  }, [basketApples, basketBananas, currentTask, gameState]);

  const handleFruitDrop = (fruitId: string) => {
    if (gameState !== 'collecting') return;

    if (fruitId === 'apple') {
      if (basketApples < currentTask.targetApples) {
        setBasketApples(prev => prev + 1);
        Tts.speak(`${basketApples + 1}`);
      } else {
        Tts.speak("No more apples!");
      }
    } else {
      if (basketBananas < currentTask.targetBananas) {
        setBasketBananas(prev => prev + 1);
        Tts.speak(`${basketBananas + 1}`);
      } else {
        Tts.speak("No more bananas!");
      }
    }
  };

  const checkFinalAnswer = (selectedNum: number) => {
    const isCorrect = selectedNum === currentTask.total;
    setFeedback(isCorrect ? 'success' : 'error');
    
    Animated.timing(bgAnim, { toValue: isCorrect ? 1 : -1, duration: 500, useNativeDriver: false }).start();
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak(`Correct! It is ${currentTask.total}!`);
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
      Tts.speak("Not quite. Count them one by one!");
      setTimeout(() => {
        setFeedback(null);
        feedbackAnim.setValue(0);
        Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
      }, 1500);
    }
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: childData?.id,
        game_type: 'shopping_math',
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
    } catch (e) { console.log("Save Error:", e); }

    createGameCompletionHandler({ navigation, child: childData, gameSequence, currentGameIndex, categoryTitle })
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Math Master! 🍎🍌');
  };

  const DraggableFruit = ({ fruit }: { fruit: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => gameState === 'collecting',
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.moveY < height * 0.6) {
          handleFruitDrop(fruit.id);
        }
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    });

    return (
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.fruitCircle]}>
        <Text style={styles.fruitEmoji}>{fruit.emoji}</Text>
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
          <Text style={styles.title}>Shopping Math 🛒</Text>
          <Text style={styles.taskText}>
            Get: {currentTask.targetApples}🍎 and {currentTask.targetBananas}🍌
          </Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.basketContainer}>
             <Text style={styles.basketEmoji}>🧺</Text>
             <View style={styles.itemsInBasket}>
                {Array(basketApples).fill(0).map((_, i) => <Text key={`a${i}`} style={styles.inBasketFruit}>🍎</Text>)}
                {Array(basketBananas).fill(0).map((_, i) => <Text key={`b${i}`} style={styles.inBasketFruit}>🍌</Text>)}
             </View>
          </View>

          {feedback && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackIcon}>{feedback === 'success' ? '✅' : '❌'}</Text>
            </Animated.View>
          )}

          {gameState === 'calculating' && !feedback && (
             <View style={styles.numberPad}>
                {[2, 3, 4, 5, 6, 7].map(num => (
                  <TouchableOpacity key={num} style={styles.numBtn} onPress={() => checkFinalAnswer(num)}>
                    <Text style={styles.numBtnText}>{num}</Text>
                  </TouchableOpacity>
                ))}
             </View>
          )}
        </View>

        {gameState === 'collecting' && (
          <View style={styles.palette}>
            {FRUITS.map(f => <DraggableFruit key={f.id} fruit={f} />)}
          </View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  taskText: { fontSize: 18, color: '#FF6B6B', fontWeight: 'bold', marginTop: 5 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  basketContainer: { alignItems: 'center', justifyContent: 'center' },
  basketEmoji: { fontSize: 160 },
  itemsInBasket: { position: 'absolute', flexDirection: 'row', flexWrap: 'wrap', width: 130, justifyContent: 'center', top: 50 },
  inBasketFruit: { fontSize: 32, margin: 2 },
  feedbackOverlay: { position: 'absolute', zIndex: 10 },
  feedbackIcon: { fontSize: 100 },
  numberPad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 20 },
  numBtn: { width: 75, height: 75, backgroundColor: 'white', borderRadius: 38, justifyContent: 'center', alignItems: 'center', margin: 10, elevation: 5, borderWidth: 3, borderColor: '#4ECDC4' },
  numBtnText: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  palette: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 40, backgroundColor: 'white', paddingTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  fruitCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0F8FF', justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 2, borderColor: '#DDD' },
  fruitEmoji: { fontSize: 55 },
});

export default ShoppingMathLevel3;