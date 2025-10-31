import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
}

// 7 Animals for Level 1
const ANIMALS = [
  { 
    id: 1, 
    name: 'DOG', 
    emoji: '🐶', 
    sound: 'Woof Woof', 
    color: '#E8F5E9',
    bgColor: '#F1F8F2',
    accentColor: '#81C784',
    question: 'What does the dog say?'
  },
  { 
    id: 2, 
    name: 'CAT', 
    emoji: '🐱', 
    sound: 'Meow', 
    color: '#FFF3E0',
    bgColor: '#FFF8EC',
    accentColor: '#FFB74D',
    question: 'What does the cat say?'
  },
  { 
    id: 3, 
    name: 'BIRD', 
    emoji: '🐦', 
    sound: 'Tweet Tweet', 
    color: '#E3F2FD',
    bgColor: '#EDF6FC',
    accentColor: '#64B5F6',
    question: 'What does the bird say?'
  },
  { 
    id: 4, 
    name: 'DUCK', 
    emoji: '🦆', 
    sound: 'Quack Quack', 
    color: '#FFF9C4',
    bgColor: '#FFFDE7',
    accentColor: '#FDD835',
    question: 'What does the duck say?'
  },
  { 
    id: 5, 
    name: 'COW', 
    emoji: '🐮', 
    sound: 'Moo', 
    color: '#FCE4EC',
    bgColor: '#FEF0F5',
    accentColor: '#F06292',
    question: 'What does the cow say?'
  },
  { 
    id: 6, 
    name: 'TURTLE', 
    emoji: '🐢', 
    sound: '...', 
    color: '#E0F2F1',
    bgColor: '#EDF7F6',
    accentColor: '#4DB6AC',
    question: 'The turtle is quiet!',
    silent: true
  },
  { 
    id: 7, 
    name: 'RABBIT', 
    emoji: '🐰', 
    sound: 'Hop Hop', 
    color: '#F3E5F5',
    bgColor: '#F9F0FA',
    accentColor: '#BA68C8',
    question: 'What does the rabbit do?',
    action: true
  },
];

export default function AnimalSoundsLevel1({ navigation }: any) {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;

  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [showSound, setShowSound] = useState(false);
  const [bounceAnim] = useState(new Animated.Value(0));
  const [soundAnim] = useState(new Animated.Value(0));
  const [mouthAnim] = useState(new Animated.Value(0));
  const [hopAnim] = useState(new Animated.Value(0));
  const [autoPlay, setAutoPlay] = useState(false);
  const [completedAnimals, setCompletedAnimals] = useState<number[]>([]);
  const [gameStartTime] = useState(Date.now());

  const animal = ANIMALS[currentAnimal];

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
        await Tts.setDefaultPitch(1.0);
      } catch {}
    };
    initTts();
  }, []);

  useEffect(() => {
    bounceAnim.setValue(0);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentAnimal]);

  useEffect(() => {
    if (autoPlay && !showSound) {
      const timer = setTimeout(() => {
        playSound();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, currentAnimal, showSound]);

  const playSound = () => {
    setShowSound(true);
    
    // TTS
    try {
      if (animal.silent) {
        Tts.speak('The turtle is quiet. Shhh.');
      } else if (animal.action) {
        Tts.speak(`The rabbit hops. ${animal.sound}`);
      } else {
        Tts.speak(`${animal.name} says ${animal.sound}`);
      }
    } catch {}
    
    // Mark as completed
    if (!completedAnimals.includes(currentAnimal)) {
      setCompletedAnimals([...completedAnimals, currentAnimal]);
    }

    if (animal.action) {
      // Rabbit hopping
      Animated.sequence([
        Animated.timing(hopAnim, {
          toValue: -40,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(hopAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(hopAnim, {
          toValue: -40,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(hopAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (animal.silent) {
      // Turtle slow
      Animated.timing(soundAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        soundAnim.setValue(0);
      });
    } else {
      // Normal sound
      Animated.parallel([
        Animated.sequence([
          Animated.timing(soundAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(soundAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(mouthAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(mouthAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
      ]).start();
    }

    if (autoPlay) {
      setTimeout(() => {
        nextAnimal();
      }, 2500);
    }
  };

  const sendToDatabase = async () => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }
    
    try {
      const totalTime = Date.now() - gameStartTime;
      const response = await fetch('http://10.0.2.2:3000/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          game_type: 'animals-sounds',
          level: 1,
          score: completedAnimals.length,
          max_score: ANIMALS.length,
          duration_seconds: Math.floor(totalTime / 1000),
          completed: true,
        }),
      });

      if (!response.ok) {
        console.error('❌ Backend error. Response status:', response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ Animal Sounds game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const finishGame = () => {
    sendToDatabase();
    Alert.alert(
      '🎉 Amazing! 🎉',
      `You learned about ${completedAnimals.length} animals!`,
      [
        { text: 'Play Again', onPress: () => { setCurrentAnimal(0); setCompletedAnimals([]); } },
        { text: 'Main Menu', onPress: () => navigation.goBack() },
      ]
    );
  };

  const nextAnimal = () => {
    setShowSound(false);
    soundAnim.setValue(0);
    mouthAnim.setValue(0);
    hopAnim.setValue(0);
    
    if (currentAnimal === ANIMALS.length - 1) {
      // Completed all animals
      if (completedAnimals.length >= ANIMALS.length - 1) {
        finishGame();
      } else {
        setCurrentAnimal(0);
      }
    } else {
      setCurrentAnimal(currentAnimal + 1);
    }
  };

  const prevAnimal = () => {
    setShowSound(false);
    soundAnim.setValue(0);
    mouthAnim.setValue(0);
    hopAnim.setValue(0);
    setCurrentAnimal(currentAnimal === 0 ? ANIMALS.length - 1 : currentAnimal - 1);
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    setShowSound(false);
  };

  const animalScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
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

  return (
    <View style={[styles.container, { backgroundColor: animal.bgColor }]}>
      {/* Animated background circles */}
      <Animated.View 
        style={[
          styles.bgCircle1, 
          { 
            backgroundColor: animal.color,
            opacity: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            })
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bgCircle2, 
          { 
            backgroundColor: animal.color,
            opacity: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            })
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bgCircle3, 
          { 
            backgroundColor: animal.color,
            opacity: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.25],
            })
          }
        ]} 
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🎵 Animal Sounds</Text>
          <Text style={styles.levelText}>Level 1</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.autoPlayButton, autoPlay && styles.autoPlayActive]}
            onPress={toggleAutoPlay}
          >
            <Text style={[styles.autoPlayText, autoPlay && styles.autoPlayTextActive]}>
              {autoPlay ? '⏸ Pause' : '▶ Auto'}
            </Text>
          </TouchableOpacity>
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
              index === currentAnimal && styles.progressDotActive,
              index === currentAnimal && { backgroundColor: animal.accentColor },
              completedAnimals.includes(index) && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Question */}
        <Animated.View 
          style={[
            styles.questionBox,
            { 
              opacity: animalOpacity,
              backgroundColor: animal.color,
              borderColor: animal.accentColor,
            }
          ]}
        >
          <Text style={styles.questionText}>{animal.question}</Text>
        </Animated.View>

        {/* Animal */}
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
                backgroundColor: animal.color,
                borderColor: animal.accentColor,
              },
              showSound && !animal.silent && !animal.action && { transform: [{ scale: mouthScale }] }
            ]}
          >
            <Text style={styles.animalEmoji}>{animal.emoji}</Text>
          </Animated.View>
          <View style={[styles.nameBadge, { backgroundColor: animal.accentColor }]}>
            <Text style={styles.animalName}>{animal.name}</Text>
          </View>
        </Animated.View>

        {/* Sound Display */}
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
            <View style={[styles.soundBubble, { borderColor: animal.accentColor }]}>
              {animal.silent ? (
                <Text style={styles.soundText}>🤫 Shhh...</Text>
              ) : (
                <Text style={styles.soundText}>{animal.sound}!</Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Play Sound Button */}
        {!autoPlay && (
          <TouchableOpacity
            style={[styles.playSoundButton, { backgroundColor: animal.accentColor }]}
            onPress={playSound}
            activeOpacity={0.8}
          >
            <Text style={styles.playSoundEmoji}>
              {animal.silent ? '👀' : animal.action ? '🐾' : '🔊'}
            </Text>
            <Text style={styles.playSoundText}>
              {showSound ? 'Play Again' : animal.silent ? 'Watch' : animal.action ? 'Hop!' : 'Play Sound'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={prevAnimal}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentAnimal + 1} / {ANIMALS.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={nextAnimal}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Finish Button */}
      {completedAnimals.length >= 5 && (
        <TouchableOpacity style={styles.finishButton} onPress={finishGame}>
          <Text style={styles.finishButtonText}>✅ Finish Game</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  bgCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -80,
    right: -60,
  },
  bgCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 120,
    left: -50,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 150,
    left: -30,
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
  autoPlayButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  autoPlayActive: {
    backgroundColor: '#74C0FC',
  },
  autoPlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  autoPlayTextActive: {
    color: '#FFFFFF',
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
  playSoundButton: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  playSoundEmoji: {
    fontSize: 22,
  },
  playSoundText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  navButton: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A4A4A',
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
  finishButton: {
    backgroundColor: '#81C784',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
