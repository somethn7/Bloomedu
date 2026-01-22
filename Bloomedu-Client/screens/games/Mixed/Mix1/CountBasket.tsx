import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const FRUITS_POOL = [
  { id: 'strawberry', emoji: '🍓', name: 'Strawberry' },
  { id: 'banana', emoji: '🍌', name: 'Banana' },
  { id: 'apple', emoji: '🍎', name: 'Apple' },
  { id: 'orange', emoji: '🍊', name: 'Orange' },
  { id: 'grapes', emoji: '🍇', name: 'Grapes' },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon' },
];

const RECIPES = [
  { id: 1, target: 'strawberry', count: 2, question: "Put 2 strawberries in the bowl!" },
  { id: 2, target: 'banana', count: 5, question: "Put 5 bananas in the bowl!" },
  { id: 3, target: 'apple', count: 3, question: "Put 3 apples in the bowl!" },
  { id: 4, target: 'orange', count: 4, question: "Put 4 oranges in the bowl!" },
  { id: 5, target: 'grapes', count: 1, question: "Put 1 grapes in the bowl!" },
  { id: 6, target: 'watermelon', count: 1, question: "Put 1 watermelons in the bowl!" },
];

const MAX_ROUNDS = 6;

const FruitChef = ({ navigation }: any) => {
  const route = useRoute();
  const { child: childData, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const currentRecipe = RECIPES[currentRound];

  const startNewRound = useCallback((round: number) => {
    setCollectedCount(0);
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
    Tts.speak(RECIPES[round].question);
  }, [bgAnim, feedbackAnim]);

useEffect(() => {
    const initGame = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.4);
        startNewRound(0);
      } catch (err) {
        console.log('TTS Init Error:', err);
      }
    };

    initGame();

    return () => {
      Tts.stop();
    };
  }, [startNewRound]);

  const handleFruitDrop = (fruitId: string) => {
    if (isBusy) return;

    if (fruitId === currentRecipe.target) {
      const newCount = collectedCount + 1;
      setCollectedCount(newCount);
      Tts.speak(`${newCount}`);

      if (newCount === currentRecipe.count) {
        setIsBusy(true);
        setFeedback('success');
        setScore(s => s + 1);
        Animated.timing(bgAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();
        Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

        setTimeout(() => {
          if (currentRound < MAX_ROUNDS - 1) {
            setCurrentRound(r => r + 1);
            startNewRound(currentRound + 1);
          } else {
            finalizeGame();
          }
        }, 2500);
      }
    } else {
      setWrongCount(w => w + 1);
      Tts.speak(`No, that is not a ${currentRecipe.target}. Try again!`);
    }
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: childData?.id,
        game_type: 'fruit_chef_logic',
        level: 1,
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
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Master Fruit Chef! 🥗🍎');
  };

  const DraggableFruit = ({ fruit }: { fruit: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !isBusy,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.moveY < height * 0.6) {
          handleFruitDrop(fruit.id);
        }
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    });

    return (
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.fruitCard]}>
        <Text style={styles.fruitEmoji}>{fruit.emoji}</Text>
      </Animated.View>
    );
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#fff5f5', '#FDFBF0', '#e6ffed'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Fruit Chef 🥗</Text>
          <Text style={styles.recipeText}>{currentRecipe.question}</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.bowlContainer}>
            <Text style={styles.bowlEmoji}>🥣</Text>
            <View style={styles.itemsInBowl}>
              {Array(collectedCount).fill(0).map((_, i) => (
                <Text key={i} style={styles.innerFruit}>{FRUITS_POOL.find(f => f.id === currentRecipe.target)?.emoji}</Text>
              ))}
            </View>
          </View>

          {feedback === 'success' && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackEmoji}>✅</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.palette}>
          {FRUITS_POOL.map(f => <DraggableFruit key={f.id} fruit={f} />)}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  recipeText: { fontSize: 20, color: '#FF6B6B', fontWeight: '700', textAlign: 'center', marginTop: 10 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bowlContainer: { alignItems: 'center', justifyContent: 'center' },
  bowlEmoji: { fontSize: 180 },
  itemsInBowl: { position: 'absolute', flexDirection: 'row', flexWrap: 'wrap', width: 120, justifyContent: 'center', top: 50 },
  innerFruit: { fontSize: 40, margin: 2 },
  feedbackOverlay: { position: 'absolute', zIndex: 10 },
  feedbackEmoji: { fontSize: 100 },
  palette: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 40, backgroundColor: 'white', paddingTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  fruitCard: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: '#EEE' },
  fruitEmoji: { fontSize: 50 },
});

export default FruitChef;