import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const FAMILY_MEMBERS = [
  { id: 'mom', name: 'Mom', emoji: '👩', code: '#FF6B9A' },
  { id: 'dad', name: 'Dad', emoji: '👨', code: '#64B5F6' },
  { id: 'child', name: 'Child', emoji: '🧒', code: '#4ECDC4' },
];

const TASKS = [
  { id: 1, question: "Who is cooking dinner?", targetId: "mom", icon: "🍳", hint: "Mom" },
  { id: 2, question: "Who is fixing things with a hammer?", targetId: "dad", icon: "🔨", hint: "Dad" },
  { id: 3, question: "Who is playing with toys?", targetId: "child", icon: "🧸", hint: "Child" },
  { id: 4, question: "Who is shaving their face?", targetId: "dad", icon: "🪒", hint: "Dad" },
  { id: 5, question: "Who is watering the flowers?", targetId: "mom", icon: "🌻", hint: "Mom" },
  { id: 6, question: "Who is going to school with a bag?", targetId: "child", icon: "🎒", hint: "Child" },
];

const MAX_ROUNDS = 6;

const FamilyRolesLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child: childData, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
    Tts.speak(TASKS[round].question);
  }, [bgAnim, feedbackAnim]);

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.4);
    startNewRound(0);
  }, [startNewRound]);

  const handleDrop = (memberId: string) => {
    if (isBusy) return;
    const isCorrect = memberId === TASKS[currentRound].targetId;
    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');

    Animated.timing(bgAnim, { toValue: isCorrect ? 1 : -1, duration: 500, useNativeDriver: false }).start();
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak(`Great! ${TASKS[currentRound].hint} is right!`);
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
      Tts.speak("Try again!");
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setFeedback(null);
        setIsBusy(false);
        feedbackAnim.setValue(0);
        Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
      }, 2000);
    }
  };

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: childData?.id,
        game_type: 'family_roles_logic',
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
      .showCompletionMessage(score + 1, MAX_ROUNDS, 'Family Master! 🏠✨');
  };

  const DraggableMember = ({ member }: { member: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !isBusy,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        // Ekranın üst yarısındaki Target Box alanına bırakıldığında algıla
        if (gesture.moveY < height * 0.7) handleDrop(member.id);
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    });

    return (
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.memberCard, { backgroundColor: member.code }]}>
        <Text style={styles.memberEmoji}>{member.emoji}</Text>
        <Text style={styles.memberName}>{member.name}</Text>
      </Animated.View>
    );
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#fff5f5', '#F0F8FF', '#e6ffed'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Roles 🏠</Text>
          <Text style={styles.roundText}>Question {currentRound + 1} / {MAX_ROUNDS}</Text>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.targetContainer}>
            <Text style={styles.questionText}>{TASKS[currentRound].question}</Text>
            <View style={styles.actionBox}>
              <Text style={styles.actionIcon}>{TASKS[currentRound].icon}</Text>
            </View>
          </View>

          {feedback && (
            <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
              <Text style={styles.feedbackEmoji}>{feedback === 'success' ? '✅' : '❌'}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.palette}>
          {FAMILY_MEMBERS.map(m => (
            <DraggableMember key={m.id} member={m} />
          ))}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  roundText: { fontSize: 16, color: '#666', marginTop: 5 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  targetContainer: { alignItems: 'center', width: '85%' },
  questionText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#444', marginBottom: 20 },
  actionBox: { width: 160, height: 160, borderRadius: 30, backgroundColor: 'white', borderStyle: 'dashed', borderWidth: 3, borderColor: '#AAA', justifyContent: 'center', alignItems: 'center' },
  actionIcon: { fontSize: 80 },
  feedbackOverlay: { position: 'absolute', zIndex: 10 },
  feedbackEmoji: { fontSize: 100 },
  palette: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 40, backgroundColor: 'white', paddingTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  memberCard: { width: 100, height: 120, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 2, borderColor: 'white' },
  memberEmoji: { fontSize: 50 },
  memberName: { color: 'white', fontWeight: 'bold', marginTop: 5, fontSize: 16 },
});

export default FamilyRolesLevel3;