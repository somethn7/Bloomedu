import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

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

const MAX_ROUNDS = 5;

export default function MissingNumbersLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [sequence, setSequence] = useState<NumberSequence | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0); // Correct answers
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    startNewRound();

    // Pulse Loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      Tts.stop();
      pulseLoop.stop();
    };
  }, []);

  const generateSequence = (): NumberSequence => {
    const startNum = Math.floor(Math.random() * 6) + 1; // 1-6 start
    const seq = Array.from({ length: 5 }, (_, i) => startNum + i);
    
    // Hide random position (1, 2, or 3 - avoid first/last for clarity if desired, but 0-4 is fine too)
    const missingIndex = Math.floor(Math.random() * 3) + 1; 
    const missingValue = seq[missingIndex];
    
    // Options: Correct + 2 Wrong
    const wrongOptions: number[] = [];
    const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
    
    while (wrongOptions.length < 2) {
      const randomNum = allNumbers[Math.floor(Math.random() * allNumbers.length)];
      if (randomNum !== missingValue && !seq.includes(randomNum) && !wrongOptions.includes(randomNum)) {
        wrongOptions.push(randomNum);
      }
    }
    
    const options = [...wrongOptions, missingValue].sort(() => Math.random() - 0.5);
    
    return { numbers: seq, missingIndex, missingValue, options };
  };

  const startNewRound = () => {
    const newSeq = generateSequence();
    setSequence(newSeq);
    setSelectedOption(null);
    setIsCorrect(null);
    
    setTimeout(() => {
      Tts.speak('Which number is missing?');
    }, 600);
  };

  // --- INTERACTION ---
  const handleOptionPress = (option: number) => {
    if (selectedOption !== null || !sequence) return;

    setSelectedOption(option);
    const correct = option === sequence.missingValue;
    setIsCorrect(correct);

    if (correct) {
      // ✅ Correct
      setScore(prev => prev + 1);
      setAnsweredCount(prev => prev + 1);
      Tts.speak(`Yes, ${option} was missing!`);

      setTimeout(() => {
        if (currentRound < MAX_ROUNDS) {
          setCurrentRound(prev => prev + 1);
          startNewRound();
        } else {
          setGameFinished(true);
        }
      }, 2000);
    } else {
      // ❌ Incorrect
      setWrongCount(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 1));
      
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      Tts.speak('Please try again');

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const handleHearAgain = () => {
    Tts.speak('Which number is missing?');
  };

  // --- DATABASE & COMPLETION ---
  const sendToDatabase = async () => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Başarı Oranı: (Doğru Cevaplar / (Doğru + Yanlış)) * 100
    // Burada doğru cevap sayısı max 5 olabilir (5 tur).
    const safeCorrect = score; // score is incremented only on correct first try or eventual correct? 
    // Logic adjustment: We increment score on correct. If they fail, we decrement. So score represents net score.
    // Better logic for success rate: Total Rounds vs Wrong Attempts.
    // Total required correct moves: 5. 
    const totalAttempts = 5 + wrongCount;
    const successRate = Math.round((5 / totalAttempts) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'numbers-missing',
        level: 2,
        score: score, // Max 5
        max_score: MAX_ROUNDS,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalRounds: MAX_ROUNDS,
          wrongCount,
          successRate,
        },
        completed: true,
      });
    } catch (err) {
      console.log('❌ Error sending game result:', err);
    }
  };

  useEffect(() => {
    if (gameFinished) {
      (async () => {
        await sendToDatabase();
        handleGameCompletion();
      })();
    }
  }, [gameFinished]);

  const handleGameCompletion = () => {
    Tts.stop();
    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setScore(0);
        setWrongCount(0);
        setAnsweredCount(0);
        setCurrentRound(1);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
        startNewRound();
      },
    });

    gameNav.showCompletionMessage(
      score,
      MAX_ROUNDS,
      '🎉 Amazing! You found all missing numbers!'
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  const renderNumber = (num: number, index: number) => {
    if (!sequence) return null;
    const isMissing = index === sequence.missingIndex;
    const isSelected = selectedOption === num && isMissing; // Logic check: num is actual val, but we display '?'
    // Logic fix: render loop uses sequence.numbers which contains the ACTUAL numbers.
    
    // We need to check if this specific visual block corresponds to the missing index
    const showCorrect = isCorrect === true && isMissing;
    const showWrong = isCorrect === false && isMissing && selectedOption !== null; 
    // Actually, wrong animation usually shakes the option, but here we can shake the missing box too if we want.

    return (
      <Animated.View
        key={index}
        style={[
          styles.numberContainer,
          {
            transform: [
              { scale: isMissing ? pulseAnim : 1 },
              // Shake missing box if wrong answer given? Or just shake options. Let's keep simple.
            ],
          },
        ]}
      >
        <View
          style={[
            styles.numberBox,
            {
              backgroundColor: isMissing && !showCorrect ? '#E8F4F8' : COLORS[(num - 1) % COLORS.length].color,
              borderColor: isMissing ? '#85C1E9' : 'transparent',
              borderWidth: isMissing ? 3 : 0,
              borderStyle: isMissing ? 'dashed' : 'solid',
            },
            showCorrect && styles.correctBox,
          ]}
        >
          {isMissing && !showCorrect ? (
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

  if (!sequence) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🔢 Missing Number</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* PROGRESS */}
          <View style={styles.progressBox}>
            <Text style={styles.progressText}>Round {currentRound} / {MAX_ROUNDS}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentRound / MAX_ROUNDS) * 100}%` }]} />
            </View>
          </View>

          {/* INSTRUCTION */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Which number is missing?</Text>
            <TouchableOpacity style={styles.replayButton} onPress={handleHearAgain}>
              <Text style={styles.replayButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* SEQUENCE */}
          <View style={styles.sequenceContainer}>
            {sequence.numbers.map((num, index) => renderNumber(num, index))}
          </View>

          {/* OPTIONS */}
          <View style={styles.optionsContainer}>
            {sequence.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const optionCorrect = isCorrect === true && isSelected;
              const optionWrong = isCorrect === false && isSelected;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: COLORS[(option - 1) % COLORS.length].color,
                      opacity: selectedOption !== null && !isSelected ? 0.5 : 1,
                    },
                    optionCorrect && styles.correctOption,
                    optionWrong && styles.wrongOption,
                  ]}
                  onPress={() => handleOptionPress(option)}
                  disabled={selectedOption !== null}
                >
                  <Animated.View style={{ transform: [{ translateX: optionWrong ? shakeAnim : 0 }] }}>
                    <Text style={styles.optionEmoji}>{COLORS[(option - 1) % COLORS.length].emoji}</Text>
                    <Text style={styles.optionText}>{option}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FEEDBACK TEXT */}
          <View style={styles.footer}>
            <Text style={styles.hint}>
              {selectedOption === null
                ? 'Select the missing number!'
                : isCorrect === true
                ? 'Correct! 🎉'
                : 'Wrong, try again! ❌'}
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B9A',
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
    backgroundColor: '#FF6B9A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
  },
  progressText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B9A',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 10,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  replayButton: {
    backgroundColor: '#EAF7F5',
    padding: 8,
    borderRadius: 20,
  },
  replayButtonText: { fontSize: 18 },
  
  // Sequence
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  numberContainer: {
    alignItems: 'center',
  },
  numberBox: {
    width: 60,
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
  missingText: {
    fontSize: 32,
    color: '#85C1E9',
  },
  numberEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Options
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  optionButton: {
    width: 90,
    height: 90,
    borderRadius: 15,
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
  },
  optionEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  optionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
  },
  hint: {
    color: '#777',
    fontWeight: '600',
    fontSize: 16,
  },
});