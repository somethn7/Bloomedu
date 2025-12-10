// -umut: LEVEL 1 StarTrackingLevel1 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların hareketli nesneleri gözle takip etme becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir (wrong_count=0, success_rate=100)
// Özellikler: 6 Senaryo, Otomatik hareket, Sesli anlatım, Görsel efektler, Tam Kod

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const ITEM_SIZE = Math.min(width, height) * 0.12;
const TARGET_SIZE = Math.min(width, height) * 0.16;
const MARGIN = width * 0.12;

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
  gameSequence?: any[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

const TRACKING_SCENARIOS = [
  {
    emoji: '🐝', name: 'bee', target: '🌸', targetName: 'flower',
    message: 'Watch the bee fly to the flower!', color: '#FFF9C4', accentColor: '#FFD54F',
  },
  {
    emoji: '🐶', name: 'puppy', target: '🦴', targetName: 'bone',
    message: 'Watch the puppy go to the bone!', color: '#FFE5B4', accentColor: '#FFB74D',
  },
  {
    emoji: '🚗', name: 'car', target: '🏠', targetName: 'home',
    message: 'Watch the car drive home!', color: '#E3F2FD', accentColor: '#64B5F6',
  },
  {
    emoji: '🐱', name: 'cat', target: '🥛', targetName: 'milk',
    message: 'Watch the cat go to the milk!', color: '#F3E5F5', accentColor: '#BA68C8',
  },
  {
    emoji: '⚽', name: 'ball', target: '⛳', targetName: 'goal',
    message: 'Watch the ball roll to the goal!', color: '#E8F5E9', accentColor: '#81C784',
  },
  {
    emoji: '🐠', name: 'fish', target: '🪸', targetName: 'coral',
    message: 'Watch the fish swim to the coral!', color: '#E0F2F1', accentColor: '#4DB6AC',
  },
];

const DIRECTIONS = [
  { name: 'left-to-right', startX: MARGIN, startY: height * 0.4, endX: width - MARGIN - ITEM_SIZE, endY: height * 0.4 },
  { name: 'top-to-bottom', startX: width * 0.4, startY: height * 0.25, endX: width * 0.4, endY: height * 0.6 },
  { name: 'diagonal-down', startX: MARGIN, startY: height * 0.25, endX: width - MARGIN - ITEM_SIZE, endY: height * 0.55 },
  { name: 'right-to-left', startX: width - MARGIN - ITEM_SIZE, startY: height * 0.4, endX: MARGIN, endY: height * 0.4 },
];

export default function StarTrackingLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [currentScenario, setCurrentScenario] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0); // Always 0 for tracking
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Animations
  const itemPosition = useRef(new Animated.ValueXY()).current;
  const itemScale = useRef(new Animated.Value(1)).current;
  const targetScale = useRef(new Animated.Value(1)).current;
  const pathOpacity = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  
  // Decor Animations
  const cloud1Anim = useRef(new Animated.Value(0)).current;
  const cloud2Anim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const scenario = TRACKING_SCENARIOS[currentScenario];
  const direction = DIRECTIONS[currentScenario % DIRECTIONS.length];
  const totalScenarios = TRACKING_SCENARIOS.length;

  // --- INIT & TTS ---
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.3);
        await Tts.setDefaultPitch(1.0);
        await Tts.setIgnoreSilentSwitch('ignore');
      } catch {}
    };
    initTts();

    setTimeout(() => {
      Tts.speak('Watch and follow with your eyes!');
    }, 500);

    // Background Animations Loop
    const runDecorAnims = () => {
      Animated.loop(Animated.sequence([
        Animated.timing(cloud1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(cloud1Anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])).start();
      
      Animated.loop(Animated.sequence([
        Animated.timing(cloud2Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(cloud2Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])).start();
      
      Animated.loop(Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])).start();
    };
    runDecorAnims();

    return () => {
      Tts.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- SCENARIO LOGIC ---
  useEffect(() => {
    if (!gameFinished) {
      // Reset for new scenario
      itemPosition.setValue({ x: direction.startX, y: direction.startY });
      itemScale.setValue(1);
      pathOpacity.setValue(0);
      setShowSuccess(false);

      // Target Pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(targetScale, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      timerRef.current = setTimeout(() => {
        startTracking();
      }, 1200);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [currentScenario, gameFinished]);

  const startTracking = () => {
    Tts.speak(scenario.message);

    // Show path
    Animated.timing(pathOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Move Item
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(itemPosition, {
          toValue: { x: direction.endX, y: direction.endY },
          duration: 4000, // Slow movement for easy tracking
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(itemScale, { toValue: 1.2, duration: 2000, useNativeDriver: true }),
          Animated.timing(itemScale, { toValue: 0.9, duration: 2000, useNativeDriver: true }),
        ]),
      ]).start(() => {
        handleScenarioComplete();
      });
    }, 600);
  };

  const handleScenarioComplete = () => {
    // 1. Calculate updated score immediately
    const newScore = score + 1;
    setScore(newScore);
    setAnsweredCount(prev => prev + 1);

    setShowSuccess(true);

    Animated.spring(successAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Tts.speak(`Perfect! The ${scenario.name} reached the ${scenario.targetName}!`);

    // Hide path
    Animated.timing(pathOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();

    setTimeout(() => {
      successAnim.setValue(0);
      setShowSuccess(false);
      
      if (currentScenario < totalScenarios - 1) {
        setCurrentScenario(prev => prev + 1);
      } else {
        // 2. Pass updated score to completion handler
        setGameFinished(true);
        completeGame(newScore);
      }
    }, 2500);
  };

  // --- DATABASE & COMPLETION ---
  const completeGame = async (finalScore?: number) => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Use passed score or fallback to state
    const scoreToUse = finalScore !== undefined ? finalScore : score;
    const safeAnswered = answeredCount > 0 ? answeredCount : 1;
    
    // For observation games, success rate is 100% if finished
    const successRate = 100;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'bedtime_journey', // Using same ID as before
        level: 1,
        score: scoreToUse,
        max_score: totalScenarios,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: 0,
        success_rate: successRate,
        details: {
          totalScenarios,
          answeredCount: safeAnswered,
          successRate: 100,
        },
        completed: true,
      });
    } catch (err) {
      console.log('❌ Error sending game result:', err);
    }

    // Dynamic Message Logic
    let completionMessage = 'Amazing tracking skills! You followed every journey! 🌟';
    if (scoreToUse < totalScenarios) {
        completionMessage = 'Good job following along!';
    }

    const gameNav = createGameCompletionHandler({
        navigation,
        child,
        gameSequence,
        currentGameIndex,
        categoryTitle,
        resetGame: () => {
          setCurrentScenario(0);
          setScore(0);
          setAnsweredCount(0);
          setGameFinished(false);
          gameStartTimeRef.current = Date.now();
        },
      });
  
      gameNav.showCompletionMessage(
        scoreToUse,
        totalScenarios,
        completionMessage
      );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  return (
    <View style={[styles.container, { backgroundColor: scenario.color }]}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>👀 Bedtime Journey</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {score}/{totalScenarios}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentScenario + 1) / totalScenarios) * 100}%`,
                  backgroundColor: scenario.accentColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Journey {currentScenario + 1} of {totalScenarios}
          </Text>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          
          {/* Decor Clouds - Fixed Animations */}
          <Animated.View style={[
            styles.decorCloud, 
            styles.decorCloud1, 
            { 
              opacity: cloud1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }), 
              transform: [{ translateX: cloud1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] 
            }
          ]}>
            <Text style={styles.decorCloudText}>☁️</Text>
          </Animated.View>
          
          <Animated.View style={[
            styles.decorCloud, 
            styles.decorCloud2, 
            { 
              opacity: cloud2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }), 
              transform: [{ translateX: cloud2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }] 
            }
          ]}>
            <Text style={styles.decorCloudText}>☁️</Text>
          </Animated.View>

          {/* Sparkles */}
          <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleAnim }]}>
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleAnim }]}>
            <Text style={styles.sparkleText}>⭐</Text>
          </Animated.View>

          {/* Instruction */}
          <View style={[styles.instructionCard, { borderColor: scenario.accentColor }]}>
            <Text style={styles.instructionEmoji}>👁️</Text>
            <Text style={styles.instructionText}>{scenario.message}</Text>
          </View>

          {/* Path Line - Logic for different directions */}
          {direction.name === 'left-to-right' || direction.name === 'right-to-left' ? (
            <Animated.View 
              style={[
                styles.pathLineHorizontal, 
                { 
                  opacity: pathOpacity, 
                  left: Math.min(direction.startX, direction.endX) + ITEM_SIZE / 2, 
                  top: direction.startY + ITEM_SIZE / 2 - 2, 
                  width: Math.abs(direction.endX - direction.startX) 
                }
              ]}
            >
              <View style={[styles.dottedLineHorizontal, { borderColor: scenario.accentColor }]} />
            </Animated.View>
          ) : direction.name === 'top-to-bottom' ? (
            <Animated.View 
              style={[
                styles.pathLineVertical, 
                { 
                  opacity: pathOpacity, 
                  left: direction.startX + ITEM_SIZE / 2 - 2, 
                  top: direction.startY + ITEM_SIZE, 
                  height: direction.endY - direction.startY - ITEM_SIZE 
                }
              ]}
            >
              <View style={[styles.dottedLineVertical, { borderColor: scenario.accentColor }]} />
            </Animated.View>
          ) : (
            <Animated.View 
              style={[
                styles.pathLineDiagonal, 
                { 
                  opacity: pathOpacity, 
                  left: direction.startX + ITEM_SIZE / 2, 
                  top: direction.startY + ITEM_SIZE / 2, 
                  width: Math.sqrt(Math.pow(direction.endX - direction.startX, 2) + Math.pow(direction.endY - direction.startY, 2)), 
                  transform: [{ rotate: Math.atan2(direction.endY - direction.startY, direction.endX - direction.startX) + 'rad' }] 
                }
              ]}
            >
              <View style={[styles.dottedLineHorizontal, { borderColor: scenario.accentColor }]} />
            </Animated.View>
          )}

          {/* Moving Item */}
          <Animated.View 
            style={[
              styles.itemContainer, 
              { 
                transform: [
                  { translateX: itemPosition.x }, 
                  { translateY: itemPosition.y }, 
                  { scale: itemScale }
                ] 
              }
            ]}
          >
            <View style={[styles.itemCircle, { backgroundColor: scenario.accentColor + '30' }]}>
              <Text style={styles.itemEmoji}>{scenario.emoji}</Text>
            </View>
          </Animated.View>

          {/* Target */}
          <Animated.View 
            style={[
              styles.targetContainer, 
              { 
                left: direction.endX, 
                top: direction.endY, 
                transform: [{ scale: targetScale }] 
              }
            ]}
          >
            <View style={[styles.targetCircle, { borderColor: scenario.accentColor }]}>
              <Text style={styles.targetEmoji}>{scenario.target}</Text>
            </View>
          </Animated.View>

          {/* Success Message */}
          {showSuccess && (
            <Animated.View 
              style={[
                styles.successMessage, 
                { 
                  transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }], 
                  opacity: successAnim 
                }
              ]}
            >
              <Text style={styles.successText}>🌟 Perfect! 🌟</Text>
            </Animated.View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.encouragementText}>
            {currentScenario < 2 && 'Great focus! Keep watching! 👀'}
            {currentScenario >= 2 && currentScenario < 4 && 'Amazing tracking! 🎯'}
            {currentScenario >= 4 && 'Almost there! You are doing great! ⭐'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#64B5F6',
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sequenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: '#64B5F6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 50,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  pathLineHorizontal: {
    position: 'absolute',
    height: 4,
    zIndex: 1,
  },
  pathLineVertical: {
    position: 'absolute',
    width: 4,
    zIndex: 1,
  },
  pathLineDiagonal: {
    position: 'absolute',
    height: 4,
    zIndex: 1,
  },
  dottedLineHorizontal: {
    width: '100%',
    height: 4,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 1,
  },
  dottedLineVertical: {
    height: '100%',
    width: 4,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 1,
  },
  itemContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  itemCircle: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  itemEmoji: {
    fontSize: ITEM_SIZE * 0.55,
  },
  targetContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  targetCircle: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#FFF',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  targetEmoji: {
    fontSize: TARGET_SIZE * 0.5,
  },
  successMessage: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  decorCloud: {
    position: 'absolute',
    zIndex: 0,
  },
  decorCloud1: {
    top: height * 0.15,
    left: width * 0.1,
  },
  decorCloud2: {
    top: height * 0.2,
    right: width * 0.15,
  },
  decorCloudText: {
    fontSize: 50,
    opacity: 0.5,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 0,
  },
  sparkle1: {
    top: height * 0.3,
    left: width * 0.2,
  },
  sparkle2: {
    top: height * 0.35,
    right: width * 0.25,
  },
  sparkleText: {
    fontSize: 24,
  },
});