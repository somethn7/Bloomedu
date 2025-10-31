// -umut: LEVEL 2 RENK + NESNE EŞLEŞTIRME OYUNU - EMOJİ İLE (28.10.2025)
// Bu oyun, otizmli çocukların iki özelliği birden tanıma becerilerini geliştirir
// Renkli kutular + emoji kullanılır - Basit, garantili ve evrensel çözüm
// RENK = Kutu rengi, NESNE = Emoji
// Oyun sonuçları database'e kaydedilir
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Tts from 'react-native-tts';

const { width } = Dimensions.get('window');

// -umut: Temel günlük nesneler - Emoji ile (28.10.2025)
const OBJECTS = [
  { id: 1, name: 'CAR', emoji: '🚗', label: 'Araba' },
  { id: 2, name: 'BALL', emoji: '⚽', label: 'Top' },
  { id: 3, name: 'BALLOON', emoji: '🎈', label: 'Balon' },
  { id: 4, name: 'APPLE', emoji: '🍎', label: 'Elma' },
  { id: 5, name: 'BOOK', emoji: '📚', label: 'Kitap' },
  { id: 6, name: 'CUP', emoji: '🥤', label: 'Bardak' },
];

// -umut: Temel renkler (28.10.2025)
const COLORS = [
  { id: 1, name: 'RED', code: '#FF6B6B', pastelBg: '#FFE5E5' },
  { id: 2, name: 'BLUE', code: '#4DABF7', pastelBg: '#E7F5FF' },
  { id: 3, name: 'YELLOW', code: '#FFD43B', pastelBg: '#FFF9DB' },
  { id: 4, name: 'GREEN', code: '#51CF66', pastelBg: '#EBFBEE' },
];

const TOTAL_QUESTIONS = 10;

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
}

export default function ColorObjectsLevel2() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { child } = (route.params || {}) as RouteParams;

  const [targetColorObject, setTargetColorObject] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState('');
  const [animValue] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));
  
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);
  
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);

  useEffect(() => {
    const initGame = async () => {
      console.log('🎮 Level 2 Game initializing...');
      await configureTts();
      setGameStartTime(Date.now());
      setTimeout(() => {
        newQuestion();
      }, 500);
    };

    initGame();

    return () => {
      console.log('🎮 Game cleanup - stopping TTS');
      Tts.stop();
    };
  }, []);

  const configureTts = async () => {
    console.log('🔧 Configuring TTS for Level 2...');
    try {
      // -umut: Android TTS engine'ini kontrol et (28.10.2025)
      const engines = await Tts.engines();
      console.log('📱 Available TTS engines:', engines);
      
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
      await Tts.setDefaultPitch(1.0);
      
      // -umut: Event listeners (28.10.2025)
      Tts.addEventListener('tts-start', (event) => console.log('🔊 TTS started:', event));
      Tts.addEventListener('tts-finish', (event) => console.log('🔊 TTS finished:', event));
      Tts.addEventListener('tts-cancel', (event) => console.log('🔊 TTS cancelled:', event));
      
      // -umut: İlk test konuşması (28.10.2025)
      console.log('✅ TTS configured - testing...');
      setTimeout(() => {
        Tts.speak('Ready');
      }, 300);
    } catch (error) {
      console.error('❌ TTS configuration error:', error);
    }
  };

  const speakColorObject = (colorName: string, objectName: string) => {
    const text = `Find ${colorName} ${objectName}`;
    console.log('🔊 Speaking:', text);
    
    try {
      Tts.stop();
      setTimeout(() => {
        console.log('🔊 TTS.speak called with:', text);
        Tts.speak(text);
      }, 700);
    } catch (error) {
      console.error('❌ TTS speak error:', error);
    }
  };

  const newQuestion = () => {
    console.log('❓ Creating new question...');
    setFeedback('');
    setQuestionStartTime(Date.now());
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    
    console.log('🎯 Target:', randomColor.name, randomObject.name);
    
    const target = {
      color: randomColor,
      object: randomObject,
      id: `${randomColor.id}-${randomObject.id}`,
    };
    
    setTargetColorObject(target);
    
    const optionsList = [target];
    
    while (optionsList.length < 4) {
      const wrongColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const wrongObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
      const wrongOption = {
        color: wrongColor,
        object: wrongObject,
        id: `${wrongColor.id}-${wrongObject.id}`,
      };
      
      if (!optionsList.find(opt => opt.id === wrongOption.id)) {
        optionsList.push(wrongOption);
      }
    }
    
    const shuffled = optionsList.sort(() => Math.random() - 0.5);
    setOptions(shuffled);

    setTimeout(() => {
      speakColorObject(randomColor.name, randomObject.name);
    }, 1000);
  };

  const selectOption = (selectedOption: any) => {
    const questionTime = Date.now() - questionStartTime;
    const isCorrect = selectedOption.id === targetColorObject.id;
    
    const questionResult = {
      questionNo: currentQuestion,
      targetColor: targetColorObject.color.name,
      targetObject: targetColorObject.object.name,
      selectedColor: selectedOption.color.name,
      selectedObject: selectedOption.object.name,
      correct: isCorrect,
      time: questionTime,
      timestamp: new Date().toISOString(),
    };
    
    setDetailedResults([...detailedResults, questionResult]);

    if (isCorrect) {
      setFeedback('correct');
      setCorrectCount(correctCount + 1);
      
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      setTimeout(() => {
        nextStep();
      }, 1500);
    } else {
      setFeedback('wrong');
      setWrongCount(wrongCount + 1);
      
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        nextStep();
      }, 1500);
    }
  };

  const nextStep = () => {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      finishGame();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      newQuestion();
    }
  };

  const finishGame = () => {
    const totalTime = Date.now() - gameStartTime;
    const successRate = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

    const gameResult = {
      childId: child?.id || 0,
      gameType: 'color_objects',
      level: 2,
      totalQuestions: TOTAL_QUESTIONS,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      successRate: successRate,
      totalTime: totalTime,
      averageTimePerQuestion: Math.round(totalTime / TOTAL_QUESTIONS),
      completedAt: new Date().toISOString(),
      detailedResults: detailedResults,
    };
    
    sendToDatabase(gameResult);
    setGameFinished(true);
    Tts.stop();
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
          game_type: 'color_objects',
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
        console.log('✅ Level 2 game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const restartGame = () => {
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentQuestion(1);
    setGameFinished(false);
    setDetailedResults([]);
    setGameStartTime(Date.now());
    newQuestion();
  };

  const targetAnimStyle = {
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: feedback === 'correct' ? [1, 1.15] : [1, 0.95],
        }),
      },
      {
        rotate: animValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-5deg', '0deg', '5deg'],
        }),
      },
    ],
  };

  const confettiStyle = {
    opacity: confettiAnim,
    transform: [
      {
        translateY: confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        }),
      },
      {
        scale: confettiAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1.2, 0],
        }),
      },
    ],
  };

  const successRate = currentQuestion > 1 
    ? Math.round((correctCount / (currentQuestion - 1)) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎨 Color Objects</Text>
            <Text style={styles.subtitle}>Level 2</Text>
          </View>
          <View style={styles.progressBox}>
            <Text style={styles.questionCounter}>
              {currentQuestion} / {TOTAL_QUESTIONS}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentQuestion / TOTAL_QUESTIONS) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, styles.correctCard]}>
            <View style={styles.scoreIconCircle}>
              <Text style={styles.scoreEmoji}>✓</Text>
            </View>
            <Text style={styles.scoreNumber}>{correctCount}</Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          
          <View style={[styles.scoreCard, styles.wrongCard]}>
            <View style={styles.scoreIconCircle}>
              <Text style={styles.scoreEmoji}>✗</Text>
            </View>
            <Text style={styles.scoreNumber}>{wrongCount}</Text>
            <Text style={styles.scoreLabel}>Wrong</Text>
          </View>
          
          <View style={[styles.scoreCard, styles.rateCard]}>
            <View style={styles.scoreIconCircle}>
              <Text style={styles.scoreEmoji}>⭐</Text>
            </View>
            <Text style={styles.scoreNumber}>{successRate}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* -umut: Hedef - RENKLİ KUTU + BÜYÜK EMOJİ (28.10.2025) */}
        <View style={styles.targetSection}>
          <Text style={styles.questionText}>Find this! 👇</Text>
          {targetColorObject && (
            <Animated.View style={targetAnimStyle}>
              <View style={[
                styles.targetBox,
                { backgroundColor: targetColorObject.color.code }
              ]}>
                <Text style={styles.targetEmoji}>{targetColorObject.object.emoji}</Text>
                <Text style={styles.targetName}>
                  {targetColorObject.color.name} {targetColorObject.object.name}
                </Text>
              </View>
            </Animated.View>
          )}

          {feedback === 'correct' && (
            <Animated.View style={[styles.confetti, confettiStyle]}>
              <Text style={styles.confettiText}>✨🎉✨</Text>
            </Animated.View>
          )}
        </View>

        {feedback && (
          <View style={styles.feedbackSection}>
            {feedback === 'correct' ? (
              <View style={styles.correctFeedback}>
                <Text style={styles.feedbackEmoji}>🌟</Text>
                <Text style={styles.feedbackText}>Perfect!</Text>
              </View>
            ) : (
              <View style={styles.wrongFeedback}>
                <Text style={styles.feedbackEmoji}>🤔</Text>
                <Text style={styles.feedbackText}>Try Again!</Text>
              </View>
            )}
          </View>
        )}

        {/* -umut: Seçenekler - RENKLİ KUTULAR + EMOJİ (28.10.2025) */}
        <View style={styles.optionsSection}>
          <View style={styles.optionsGrid}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionContainer}
                onPress={() => selectOption(option)}
                activeOpacity={0.7}
                disabled={feedback !== ''}
              >
                <View style={[
                  styles.optionBox,
                  { backgroundColor: option.color.code }
                ]}>
                  <Text style={styles.optionEmoji}>{option.object.emoji}</Text>
                  <Text style={styles.optionLabelWhite}>
                    {option.color.name}
                  </Text>
                  <Text style={styles.optionLabelWhite}>
                    {option.object.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={gameFinished}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Great Job! 🎉</Text>
            <Text style={styles.modalSubtitle}>Level 2 Complete!</Text>
            
            <View style={styles.resultCards}>
              <View style={styles.resultCard}>
                <Text style={styles.resultEmoji}>✓</Text>
                <Text style={styles.resultNumber}>{correctCount}</Text>
                <Text style={styles.resultLabel}>Correct</Text>
              </View>
              
              <View style={styles.resultCard}>
                <Text style={styles.resultEmoji}>✗</Text>
                <Text style={styles.resultNumber}>{wrongCount}</Text>
                <Text style={styles.resultLabel}>Wrong</Text>
              </View>
              
              <View style={styles.resultCard}>
                <Text style={styles.resultEmoji}>⭐</Text>
                <Text style={styles.resultNumber}>
                  {Math.round((correctCount / TOTAL_QUESTIONS) * 100)}%
                </Text>
                <Text style={styles.resultLabel}>Success</Text>
              </View>
            </View>

            <Text style={styles.message}>
              {correctCount >= 8 ? "Amazing! 🌟" : 
               correctCount >= 6 ? "Well Done! 👏" : 
               "Keep Practicing! 💪"}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={restartGame}
              >
                <Text style={styles.restartButtonText}>🔄 Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Education', { child })}
              >
                <Text style={styles.backButtonText}>← Back to Categories</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  bgCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFE5E5',
    opacity: 0.25,
    top: -40,
    left: -40,
  },
  bgCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E7F5FF',
    opacity: 0.25,
    top: 80,
    right: -30,
  },
  bgCircle3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF9DB',
    opacity: 0.25,
    bottom: 100,
    left: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A4A4A',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  progressBox: {
    alignItems: 'flex-end',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6B6B',
    marginBottom: 5,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#74C0FC',
    borderRadius: 10,
  },
  scoreCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
    zIndex: 1,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  correctCard: {
    borderTopWidth: 2,
    borderTopColor: '#51CF66',
  },
  wrongCard: {
    borderTopWidth: 2,
    borderTopColor: '#FF8787',
  },
  rateCard: {
    borderTopWidth: 2,
    borderTopColor: '#FFD43B',
  },
  scoreIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreEmoji: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 1,
    fontWeight: '500',
  },
  targetSection: {
    alignItems: 'center',
    marginVertical: 16,
    zIndex: 1,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 14,
  },
  targetBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
    minHeight: 200,
    justifyContent: 'center',
  },
  targetEmoji: {
    fontSize: 100,
    marginBottom: 15,
    textAlign: 'center',
  },
  targetName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  confetti: {
    position: 'absolute',
    top: 30,
  },
  confettiText: {
    fontSize: 36,
  },
  feedbackSection: {
    alignItems: 'center',
    marginVertical: 12,
    minHeight: 55,
    zIndex: 1,
  },
  correctFeedback: {
    alignItems: 'center',
    backgroundColor: '#E7F5E7',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#B2F2BB',
  },
  wrongFeedback: {
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFC9C9',
  },
  feedbackEmoji: {
    fontSize: 24,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A4A',
    marginTop: 3,
  },
  optionsSection: {
    zIndex: 1,
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionContainer: {
    width: (width - 42) / 2,
    marginBottom: 10,
  },
  optionBox: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    minHeight: 150,
    justifyContent: 'center',
  },
  optionEmoji: {
    fontSize: 56,
    marginBottom: 10,
    textAlign: 'center',
  },
  optionLabelWhite: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#999',
    marginBottom: 22,
  },
  resultCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  resultCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  resultLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
    fontWeight: '500',
  },
  message: {
    fontSize: 19,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    backgroundColor: '#74C0FC',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#74C0FC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  backButton: {
    backgroundColor: '#51CF66',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#51CF66',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
