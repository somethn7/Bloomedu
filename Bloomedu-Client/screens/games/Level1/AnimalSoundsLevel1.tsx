// -umut: LEVEL 1 AnimalSoundsLevel1 - YENİDEN DÜZENLEME (08.12.2025)
// Bu oyun, otizmli çocukların hayvan seslerini öğrenmesi için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir (wrong_count=0, success_rate=100)
// Özellikler: Tam Otomatik Geçiş, Sıralı Animasyonlar, Sesli Anlatım

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';
import { sendGameResult } from '../../../config/api';

const { width } = Dimensions.get('window');

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

// 7 Animals for Level 1
const ANIMALS = [
  { 
    id: 1, name: 'DOG', emoji: '🐶', sound: 'Woof Woof', 
    color: '#E8F5E9', bgColor: '#F1F8F2', accentColor: '#81C784', 
    question: 'What does the dog say?'
  },
  { 
    id: 2, name: 'CAT', emoji: '🐱', sound: 'Meow', 
    color: '#FFF3E0', bgColor: '#FFF8EC', accentColor: '#FFB74D', 
    question: 'What does the cat say?'
  },
  { 
    id: 3, name: 'BIRD', emoji: '🐦', sound: 'Tweet Tweet', 
    color: '#E3F2FD', bgColor: '#EDF6FC', accentColor: '#64B5F6', 
    question: 'What does the bird say?'
  },
  { 
    id: 4, name: 'DUCK', emoji: '🦆', sound: 'Quack Quack', 
    color: '#FFF9C4', bgColor: '#FFFDE7', accentColor: '#FDD835', 
    question: 'What does the duck say?'
  },
  { 
    id: 5, name: 'COW', emoji: '🐮', sound: 'Moo', 
    color: '#FCE4EC', bgColor: '#FEF0F5', accentColor: '#F06292', 
    question: 'What does the cow say?'
  },
  { 
    id: 6, name: 'TURTLE', emoji: '🐢', sound: '...', 
    color: '#E0F2F1', bgColor: '#EDF7F6', accentColor: '#4DB6AC', 
    question: 'The turtle is quiet!', silent: true
  },
  { 
    id: 7, name: 'RABBIT', emoji: '🐰', sound: 'Hop Hop', 
    color: '#F3E5F5', bgColor: '#F9F0FA', accentColor: '#BA68C8', 
    question: 'What does the rabbit do?', action: true
  },
];

export default function AnimalSoundsLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game Logic States
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [showSound, setShowSound] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // Intro kontrolü
  const [gameFinished, setGameFinished] = useState(false);
  
  // Metrics for DB (Gold Standard)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0); 
  const [answeredCount, setAnsweredCount] = useState(0);
  
  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Animations
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const soundAnim = useRef(new Animated.Value(0)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;
  const hopAnim = useRef(new Animated.Value(0)).current;
  const introAnim = useRef(new Animated.Value(0)).current;

  const currentAnimal = ANIMALS[currentAnimalIndex];
  const totalAnimals = ANIMALS.length;

  // --- INIT & INTRO ---
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.35); // Biraz daha doğal hız
        await Tts.setDefaultPitch(1.0);
      } catch {}
    };
    initTts();

    // Intro Animation
    Animated.spring(introAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Tts.speak('Welcome! Let\'s learn animal sounds together!');

    // Start Game Loop after Intro
    const introTimer = setTimeout(() => {
      setHasStarted(true);
    }, 3500);

    return () => {
      clearTimeout(introTimer);
      Tts.stop();
    };
  }, []);

  // --- MAIN GAME LOOP (MeetMyFamily Logic) ---
  useEffect(() => {
    if (hasStarted && !gameFinished && currentAnimal) {
      
      // 1. Reset States & Anims
      setShowSound(false);
      bounceAnim.setValue(0);
      soundAnim.setValue(0);
      mouthAnim.setValue(0);
      hopAnim.setValue(0);

      // 2. Entrance Animation
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // 3. Speak Question (Delay: 500ms)
      const qTimer = setTimeout(() => {
        Tts.speak(currentAnimal.question);
      }, 500);

      // 4. Reveal Sound/Answer & Animate (Delay: 2500ms)
      const aTimer = setTimeout(() => {
        setShowSound(true);
        playAnswerAnimation();
        
        // Speak Answer
        if (currentAnimal.silent) {
          Tts.speak('The turtle is quiet. Shhh.');
        } else if (currentAnimal.action) {
          Tts.speak(`The rabbit hops. ${currentAnimal.sound}`);
        } else {
          Tts.speak(`${currentAnimal.name} says ${currentAnimal.sound}`);
        }
        
        // Update Score (Passive learning, always correct)
        setScore(prev => prev + 1);
        setAnsweredCount(prev => prev + 1);

      }, 2500);

      // 5. Next Animal (Delay: 6000ms - Total Duration per animal)
      timerRef.current = setTimeout(() => {
        if (currentAnimalIndex < totalAnimals - 1) {
          setCurrentAnimalIndex(prev => prev + 1);
        } else {
          setGameFinished(true);
        }
      }, 6000);

      return () => {
        clearTimeout(qTimer);
        clearTimeout(aTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [hasStarted, currentAnimalIndex, gameFinished]);

  // Specific Animations based on animal type
  const playAnswerAnimation = () => {
    if (currentAnimal.action) {
      // Rabbit Hop
      Animated.sequence([
        Animated.timing(hopAnim, { toValue: -40, duration: 200, useNativeDriver: true }),
        Animated.timing(hopAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(hopAnim, { toValue: -40, duration: 200, useNativeDriver: true }),
        Animated.timing(hopAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (currentAnimal.silent) {
      // Turtle Slow Fade
      Animated.timing(soundAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    } else {
      // Standard Sound Pulse + Mouth
      Animated.parallel([
        Animated.sequence([
          Animated.timing(soundAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(soundAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(mouthAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(mouthAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
          ]),
          { iterations: 2 }
        ),
      ]).start();
    }
  };

  // --- DATABASE & COMPLETION ---
  useEffect(() => {
    if (gameFinished) {
      completeGame();
    }
  }, [gameFinished]);

  const completeGame = async () => {
    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Learning game: 100% success rate
    const successRate = 100;
    // Score should be total animals since user watched all
    const finalScore = totalAnimals; 

    if (child?.id) {
        await sendGameResult({
            child_id: child.id,
            game_type: 'animals-sounds',
            level: 1,
            score: finalScore,
            max_score: totalAnimals,
            duration_seconds: Math.floor(totalTimeMs / 1000),
            wrong_count: 0, // 0 errors
            success_rate: successRate,
            details: {
              totalQuestions: totalAnimals,
              answeredCount: totalAnimals,
              successRate: 100,
            },
            completed: true,
        });
    }
    
    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setCurrentAnimalIndex(0);
        setScore(0);
        setAnsweredCount(0);
        setShowSound(false);
        setHasStarted(false); // Restart intro
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
      },
    });

    gameNav.showCompletionMessage(
      finalScore,
      totalAnimals,
      'Amazing! You learned all the animals! 🎵🦁'
    );
  };

  // --- INTERPOLATIONS ---
  const animalScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const animalOpacity = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const soundScale = soundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const mouthScale = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  // Intro UI
  if (!hasStarted) {
    return (
      <View style={[styles.container, { backgroundColor: '#F1F8F2' }]}>
         <Animated.View style={[styles.introOverlay, { opacity: introAnim }]}>
           <View style={styles.introContent}>
             <Text style={styles.introTitle}>🎵 Animal Sounds 🎵</Text>
             <View style={styles.introAnimalsRow}>
                <Text style={styles.introAnimalEmoji}>🐶</Text>
                <Text style={styles.introAnimalEmoji}>🐱</Text>
                <Text style={styles.introAnimalEmoji}>🐮</Text>
             </View>
             <Text style={styles.introSubtitle}>Let's learn together! 🌟</Text>
           </View>
         </Animated.View>
      </View>
    );
  }

  if (!currentAnimal) return null;

  return (
    <View style={[styles.container, { backgroundColor: currentAnimal.bgColor }]}>
      
      {/* Background Circles */}
      <View style={[styles.bgCircle1, { backgroundColor: currentAnimal.color }]} />
      <View style={[styles.bgCircle2, { backgroundColor: currentAnimal.color }]} />
      <View style={[styles.bgCircle3, { backgroundColor: currentAnimal.color }]} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🎵 Animal Sounds</Text>
          <Text style={styles.levelText}>Level 1</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {ANIMALS.map((item, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentAnimalIndex && styles.progressDotActive,
              index === currentAnimalIndex && { backgroundColor: currentAnimal.accentColor },
              index < currentAnimalIndex && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        
        {/* Question Box */}
        <Animated.View 
          style={[
            styles.questionBox,
            { 
              opacity: animalOpacity,
              backgroundColor: currentAnimal.color,
              borderColor: currentAnimal.accentColor,
            }
          ]}
        >
          <Text style={styles.questionText}>{currentAnimal.question}</Text>
        </Animated.View>

        {/* Animal Character */}
        <Animated.View
          style={[
            styles.animalContainer,
            { 
              transform: [
                { scale: animalScale },
                { translateY: hopAnim }
              ],
              opacity: animalOpacity,
            },
          ]}
        >
          <Animated.View 
            style={[
              styles.animalCircle,
              { 
                backgroundColor: currentAnimal.color,
                borderColor: currentAnimal.accentColor,
              },
              showSound && !currentAnimal.silent && !currentAnimal.action && { transform: [{ scale: mouthScale }] }
            ]}
          >
            <Text style={styles.animalEmoji}>{currentAnimal.emoji}</Text>
          </Animated.View>
          <View style={[styles.nameBadge, { backgroundColor: currentAnimal.accentColor }]}>
            <Text style={styles.animalName}>{currentAnimal.name}</Text>
          </View>
        </Animated.View>

        {/* Answer / Sound Bubble */}
        {showSound && (
          <Animated.View
            style={[
              styles.soundContainer,
              { 
                transform: [{ scale: soundScale }],
                opacity: soundAnim,
              },
            ]}
          >
            <View style={[styles.soundBubble, { borderColor: currentAnimal.accentColor }]}>
              {currentAnimal.silent ? (
                <Text style={styles.soundText}>🤫 Shhh...</Text>
              ) : (
                <Text style={styles.soundText}>{currentAnimal.sound}!</Text>
              )}
            </View>
          </Animated.View>
        )}

      </View>

      {/* Navigation Controls */}
      <View style={styles.navigation}>
         <View style={styles.counter}>
            <Text style={styles.counterText}>
              {currentAnimalIndex + 1} / {ANIMALS.length}
            </Text>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  introOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContent: {
    alignItems: 'center',
    padding: 30,
  },
  introTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 40,
    textAlign: 'center',
  },
  introAnimalsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  introAnimalEmoji: {
    fontSize: 60,
  },
  introSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#81C784',
    marginTop: 20,
    textAlign: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -80,
    right: -60,
    opacity: 0.4,
  },
  bgCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 120,
    left: -50,
    opacity: 0.3,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 150,
    left: -30,
    opacity: 0.25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  levelText: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 25,
    zIndex: 1,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressDotActive: {
    width: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  progressDotCompleted: {
    backgroundColor: '#81C784',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  questionBox: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 35,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  animalContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  animalCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  animalEmoji: {
    fontSize: 90,
  },
  nameBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  animalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  soundContainer: {
    marginBottom: 25,
  },
  soundBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 28,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  soundText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  counter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A4A',
  },
});