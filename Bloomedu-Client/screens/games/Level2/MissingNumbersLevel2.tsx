import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';

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

type NumberSequence = {
  numbers: number[];
  missingIndex: number;
  missingValue: number;
  options: number[];
};

const COLORS = [
  { color: '#FF6B9A', emoji: '1️⃣' },
  { color: '#4ECDC4', emoji: '2️⃣' },
  { color: '#45B7D1', emoji: '3️⃣' },
  { color: '#96CEB4', emoji: '4️⃣' },
  { color: '#FFEAA7', emoji: '5️⃣' },
  { color: '#DDA0DD', emoji: '6️⃣' },
  { color: '#98D8C8', emoji: '7️⃣' },
  { color: '#F7DC6F', emoji: '8️⃣' },
  { color: '#BB8FCE', emoji: '9️⃣' },
  { color: '#85C1E9', emoji: '🔟' },
];

const generateSequence = (): NumberSequence => {
  // Generate a sequence of 5 consecutive numbers starting from 1-6
  const startNum = Math.floor(Math.random() * 6) + 1; // 1-6 arası başlangıç
  const sequence = Array.from({ length: 5 }, (_, i) => startNum + i);
  
  // Pick a random position to hide (not first or last)
  const missingIndex = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
  const missingValue = sequence[missingIndex];
  
  // Generate wrong options (2 wrong + 1 correct)
  const wrongOptions: number[] = [];
  const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
  
  while (wrongOptions.length < 2) {
    const randomNum = allNumbers[Math.floor(Math.random() * allNumbers.length)];
    if (randomNum !== missingValue && !sequence.includes(randomNum) && !wrongOptions.includes(randomNum)) {
      wrongOptions.push(randomNum);
    }
  }
  
  const options = [...wrongOptions, missingValue].sort(() => Math.random() - 0.5);
  
  return {
    numbers: sequence,
    missingIndex,
    missingValue,
    options,
  };
};

const MissingNumbersLevel2 = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  const gameSequence = (route.params as RouteParams)?.gameSequence;
  const currentGameIndex = (route.params as RouteParams)?.currentGameIndex ?? -1;
  const categoryTitle = (route.params as RouteParams)?.categoryTitle;
  
  const [sequence, setSequence] = useState<NumberSequence>(() => generateSequence());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const maxRounds = 5;

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
        await Tts.setDefaultPitch(1.0);
        
        setTimeout(() => {
          Tts.speak('Which number is missing?');
        }, 800);
      } catch {}
    };
    initTts();
    
    // Start pulse animation for missing spot
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, [sequence]);

  useEffect(() => {
    if (selectedOption !== null) {
      const correct = selectedOption === sequence.missingValue;
      setIsCorrect(correct);
      
      if (correct) {
        setScore(score + 1);
        try {
          Tts.speak(`Yes, ${selectedOption} was missing!`);
        } catch {}
        
        setTimeout(() => {
          if (currentRound < maxRounds) {
            nextRound();
          } else {
            showCompletion();
          }
        }, 2000);
      } else {
        // Wrong answer
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
        
        try {
          Tts.speak('Please try again');
        } catch {}
        
        setTimeout(() => {
          setSelectedOption(null);
          setIsCorrect(null);
        }, 1500);
      }
    }
  }, [selectedOption]);

  const nextRound = () => {
    setSequence(generateSequence());
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentRound(currentRound + 1);
  };

  const sendToDatabase = async (data: any) => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }
    
    try {
      const response = await fetch('http://10.0.2.2:3000/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          game_type: 'numbers-missing',
          level: 2,
          score: data.correctAnswers,
          max_score: data.totalQuestions,
          duration_seconds: Math.floor(data.totalTime / 1000),
          completed: true,
        }),
      });

      if (!response.ok) {
        console.error('❌ Backend error. Response status:', response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ Missing Numbers game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const showCompletion = () => {
    const totalTime = Date.now() - gameStartTime;
    const gameResult = {
      correctAnswers: score,
      totalQuestions: maxRounds,
      totalTime: totalTime,
    };
    
    sendToDatabase(gameResult);
    
    const gameNav = createGameCompletionHandler(
      navigation,
      { child, gameSequence, currentGameIndex, categoryTitle },
      resetGame
    );
    
    Alert.alert(
      '🎉 Amazing! 🎉',
      gameNav.getCompletionMessage(),
      gameNav.createCompletionButtons()
    );
  };

  const resetGame = () => {
    setSequence(generateSequence());
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setCurrentRound(1);
    setGameStartTime(Date.now());
  };

  const handleOptionPress = (option: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
  };

  const handleHearAgain = () => {
    try {
      Tts.stop();
      setTimeout(() => {
        Tts.speak('Which number is missing?');
      }, 200);
    } catch {}
  };

  const renderNumber = (num: number, index: number) => {
    const isMissing = index === sequence.missingIndex;
    const isSelected = selectedOption === num && isMissing;
    const showCorrect = isCorrect === true && isMissing;
    const showWrong = isCorrect === false && isSelected;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.numberContainer,
          {
            transform: [
              { scale: isMissing ? pulseAnim : 1 },
              { translateX: isMissing ? shakeAnim : 0 },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.numberBox,
            {
              backgroundColor: isMissing ? '#E8F4F8' : COLORS[(num - 1) % COLORS.length].color,
              borderColor: isMissing ? '#85C1E9' : 'transparent',
              borderWidth: isMissing ? 3 : 0,
              borderStyle: isMissing ? 'dashed' : 'solid',
            },
            showCorrect && styles.correctBox,
            showWrong && styles.wrongBox,
          ]}
        >
          {isMissing ? (
            <Text style={styles.missingText}>❓</Text>
          ) : (
            <>
              <Text style={styles.numberEmoji}>{COLORS[(num - 1) % COLORS.length].emoji}</Text>
              <Text style={styles.numberText}>{num}</Text>
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔢 Find Missing Number</Text>
        <TouchableOpacity style={styles.reset} onPress={resetGame}>
          <Text style={styles.resetText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}/{maxRounds}</Text>
        <Text style={styles.roundText}>Round: {currentRound}/{maxRounds}</Text>
      </View>

      <Text style={styles.subtitle}>Which number is missing? 👇</Text>

      <TouchableOpacity style={styles.replayButton} onPress={handleHearAgain}>
        <Text style={styles.replayButtonText}>🔊 Hear again</Text>
      </TouchableOpacity>

      {/* Number Sequence */}
      <View style={styles.sequenceContainer}>
        {sequence.numbers.map((num, index) => renderNumber(num, index))}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {sequence.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              {
                backgroundColor: COLORS[(option - 1) % COLORS.length].color,
                opacity: selectedOption !== null ? 0.7 : 1,
              },
              selectedOption === option && isCorrect === true && styles.correctOption,
              selectedOption === option && isCorrect === false && styles.wrongOption,
            ]}
            onPress={() => handleOptionPress(option)}
            disabled={selectedOption !== null}
          >
            <Text style={styles.optionEmoji}>{COLORS[(option - 1) % COLORS.length].emoji}</Text>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {selectedOption === null
            ? 'Select the missing number!'
            : isCorrect === true
            ? 'Correct! 🎉'
            : 'Wrong, try again! ❌'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  back: { padding: 8 },
  backText: { color: '#FF6B9A', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: '700', color: '#333' },
  reset: { padding: 8 },
  resetText: { color: '#4ECDC4', fontWeight: 'bold' },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#FF6B9A' },
  roundText: { fontSize: 16, fontWeight: 'bold', color: '#4ECDC4' },
  subtitle: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  replayButton: {
    alignSelf: 'center',
    backgroundColor: '#EAF7F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B8EAE2',
  },
  replayButtonText: { color: '#2E7D74', fontWeight: '700' },
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 30,
    gap: 10,
  },
  numberContainer: {
    alignItems: 'center',
  },
  numberBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  correctBox: {
    backgroundColor: '#96CEB4',
    borderColor: '#4ECDC4',
    borderWidth: 3,
    borderStyle: 'solid',
  },
  wrongBox: {
    backgroundColor: '#FFB3BA',
    borderColor: '#FF6B9A',
    borderWidth: 3,
    borderStyle: 'solid',
  },
  missingText: {
    fontSize: 32,
    color: '#85C1E9',
  },
  numberEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
    marginVertical: 20,
  },
  optionButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  correctOption: {
    backgroundColor: '#96CEB4',
    transform: [{ scale: 1.1 }],
  },
  wrongOption: {
    backgroundColor: '#FFB3BA',
    transform: [{ scale: 0.95 }],
  },
  optionEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  optionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  hint: {
    color: '#777',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MissingNumbersLevel2;

