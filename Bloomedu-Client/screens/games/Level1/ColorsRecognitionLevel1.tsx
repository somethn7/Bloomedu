// -umut: LEVEL 1 RENK EŞLEŞTIRME OYUNU - YENİDEN DÜZENLEME (28.10.2025)
// Bu oyun, otizmli çocukların renk tanıma becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir ve öğretmenler bu verileri takip edebilir
// Özellikler: 10 soru, 6 renk, skorlama, süre takibi, sesli okuma
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
import Tts from 'react-native-tts'; // -umut: Text-to-Speech için eklendi

const { width, height } = Dimensions.get('window');

// -umut: Level 1 için 6 temel renk (28.10.2025)
// Her renk: ID, isim, kod, emoji ve pastel arkaplan rengi içerir
const COLORS = [
  { id: 1, name: 'RED', code: '#FF6B6B', emoji: '🔴', pastelBg: '#FFE5E5' },
  { id: 2, name: 'BLUE', code: '#4DABF7', emoji: '🔵', pastelBg: '#E7F5FF' },
  { id: 3, name: 'YELLOW', code: '#FFD43B', emoji: '🟡', pastelBg: '#FFF9DB' },
  { id: 4, name: 'GREEN', code: '#51CF66', emoji: '🟢', pastelBg: '#EBFBEE' },
  { id: 5, name: 'BLACK', code: '#495057', emoji: '⚫', pastelBg: '#E9ECEF' },
  { id: 6, name: 'WHITE', code: '#F8F9FA', emoji: '⚪', pastelBg: '#FFFFFF', border: true },
];

const TOTAL_QUESTIONS = 10; // -umut: Toplam soru sayısı

// -umut: Child parametresi için tip tanımı (28.10.2025)
interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
}

export default function ColorsRecognitionLevel1() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { child } = (route.params || {}) as RouteParams; // -umut: Child bilgisi route'tan alınıyor

  // -umut: Oyun state'leri (28.10.2025)
  const [targetColor, setTargetColor] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState('');
  const [animValue] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));
  
  // -umut: Skorlama state'leri (28.10.2025)
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);
  
  // -umut: Süre takibi (28.10.2025)
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);

  // -umut: Text-to-Speech ayarları (28.10.2025)
  useEffect(() => {
    const initGame = async () => {
      console.log('🎮 Level 1 Colors - Initializing...');
      await configureTts();
      setGameStartTime(Date.now());
      // -umut: TTS hazır olduktan sonra oyunu başlat (28.10.2025)
      setTimeout(() => {
        newQuestion();
      }, 800);
    };

    initGame();

    return () => {
      console.log('🎮 Cleanup - stopping TTS');
      Tts.stop();
    };
  }, []);

  // -umut: TTS yapılandırması - yavaş ve net konuşma (28.10.2025)
  const configureTts = async () => {
    console.log('🔧 Configuring TTS for Level 1 Colors...');
    try {
      const engines = await Tts.engines();
      console.log('📱 Available TTS engines:', engines);
      
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
      await Tts.setDefaultPitch(1.0);
      
      // -umut: Event listeners ekle (28.10.2025)
      Tts.addEventListener('tts-start', (event) => console.log('🔊 TTS started:', event));
      Tts.addEventListener('tts-finish', (event) => console.log('🔊 TTS finished:', event));
      Tts.addEventListener('tts-cancel', (event) => console.log('🔊 TTS cancelled:', event));
      
      console.log('✅ TTS configured - testing...');
      setTimeout(() => {
        Tts.speak('Ready');
      }, 300);
    } catch (error) {
      console.error('❌ TTS configuration error:', error);
    }
  };

  // -umut: Renk adını sesli söyle (28.10.2025)
  const speakColorName = (colorName: string) => {
    const text = `Find this color. ${colorName}`;
    console.log('🔊 Speaking:', text);
    
    try {
      Tts.stop();
      setTimeout(() => {
        console.log('🔊 TTS.speak called with:', text);
        Tts.speak(text);
      }, 500);
    } catch (error) {
      console.error('❌ TTS speak error:', error);
    }
  };

  // -umut: Yeni soru oluştur (28.10.2025)
  const newQuestion = () => {
    console.log('❓ Creating new question...');
    setFeedback('');
    setQuestionStartTime(Date.now());
    
    // Rastgele hedef renk seç
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    console.log('🎯 Target color:', target.name);
    setTargetColor(target);
    
    // Tüm 6 rengi karıştırılmış şekilde göster
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    setOptions(shuffledColors);

    // -umut: Renk adını sesli söyle (28.10.2025)
    setTimeout(() => {
      speakColorName(target.name);
    }, 1000);
  };

  // -umut: Renk seçildiğinde (28.10.2025)
  const selectColor = (selectedColor: any) => {
    const questionTime = Date.now() - questionStartTime;
    const isCorrect = selectedColor.id === targetColor.id;
    
    // -umut: Detaylı sonucu kaydet (28.10.2025)
    const questionResult = {
      questionNo: currentQuestion,
      targetColor: targetColor.name,
      selectedColor: selectedColor.name,
      correct: isCorrect,
      time: questionTime,
      timestamp: new Date().toISOString(),
    };
    
    setDetailedResults([...detailedResults, questionResult]);

    if (isCorrect) {
      // -umut: DOĞRU CEVAP (28.10.2025)
      setFeedback('correct');
      setCorrectCount(correctCount + 1);
      
      // Kutlama animasyonu
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
      // -umut: YANLIŞ CEVAP (28.10.2025)
      setFeedback('wrong');
      setWrongCount(wrongCount + 1);
      
      // Sallama animasyonu
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

  // -umut: Sonraki adıma geç (28.10.2025)
  const nextStep = () => {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      finishGame();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      newQuestion();
    }
  };

  // -umut: Oyunu bitir ve database'e kaydet (28.10.2025)
  const finishGame = () => {
    const totalTime = Date.now() - gameStartTime;
    const successRate = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

    // -umut: Database'e gönderilecek veri (28.10.2025)
    const gameResult = {
      childId: child?.id || 0,
      gameType: 'colors_recognition',
      level: 1,
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
    Tts.stop(); // -umut: Oyun bitince TTS'i durdur
  };

  // -umut: Oyun sonuçlarını backend'e kaydet (28.10.2025)
  // POST /game-session endpoint'ine istek gönderir
  const sendToDatabase = async (data: any) => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }
    
    try {
      // -umut: Android emulator için local backend URL'i (28.10.2025)
      const response = await fetch('http://10.0.2.2:3000/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          game_type: 'colors_recognition',
          level: 1,
          score: data.correctAnswers,
          max_score: data.totalQuestions,
          duration_seconds: Math.floor(data.totalTime / 1000),
          completed: true,
        }),
      });

      // -umut: Yanıtı kontrol et (28.10.2025)
      if (!response.ok) {
        console.error('❌ Backend error. Response status:', response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ Game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // -umut: Oyunu yeniden başlat (28.10.2025)
  const restartGame = () => {
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentQuestion(1);
    setGameFinished(false);
    setDetailedResults([]);
    setGameStartTime(Date.now());
    newQuestion();
  };

  // -umut: Animasyon stilleri (28.10.2025)
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
      {/* -umut: Dekoratif arkaplan çemberleri (28.10.2025) */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* -umut: Başlık ve ilerleme çubuğu (28.10.2025) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎨 Color Match</Text>
            <Text style={styles.subtitle}>Level 1</Text>
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

        {/* -umut: Skor kartları (Doğru, Yanlış, Başarı oranı) (28.10.2025) */}
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

        {/* -umut: Hedef renk (bulunması gereken renk) (28.10.2025) */}
        <View style={styles.targetSection}>
          <Text style={styles.questionText}>Find this color! 👇</Text>
          {targetColor && (
            <Animated.View style={targetAnimStyle}>
              <View style={[
                styles.targetColorBox,
                { backgroundColor: targetColor.pastelBg }
              ]}>
                <View
                  style={[
                    styles.targetColor,
                    { 
                      backgroundColor: targetColor.code,
                      borderWidth: targetColor.border ? 2 : 0,
                      borderColor: '#C0C0C0',
                    },
                  ]}
                >
                  <Text style={styles.colorEmoji}>{targetColor.emoji}</Text>
                </View>
                <Text style={styles.colorName}>{targetColor.name}</Text>
              </View>
            </Animated.View>
          )}

          {/* -umut: Konfeti efekti (doğru cevap için) (28.10.2025) */}
          {feedback === 'correct' && (
            <Animated.View style={[styles.confetti, confettiStyle]}>
              <Text style={styles.confettiText}>✨🎉✨</Text>
            </Animated.View>
          )}
        </View>

        {/* -umut: Geri bildirim mesajı (28.10.2025) */}
        {feedback && (
          <View style={styles.feedbackSection}>
            {feedback === 'correct' ? (
              <View style={styles.correctFeedback}>
                <Text style={styles.feedbackEmoji}>🌟</Text>
                <Text style={styles.feedbackText}>Great Job!</Text>
              </View>
            ) : (
              <View style={styles.wrongFeedback}>
                <Text style={styles.feedbackEmoji}>🤔</Text>
                <Text style={styles.feedbackText}>Try Again!</Text>
              </View>
            )}
          </View>
        )}

        {/* -umut: Renk seçenekleri - 6 renk 2 sütun halinde (28.10.2025) */}
        <View style={styles.optionsSection}>
          <View style={styles.optionsGrid}>
            {options.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={styles.optionContainer}
                onPress={() => selectColor(color)}
                activeOpacity={0.7}
                disabled={feedback !== ''}
              >
                <View style={[
                  styles.optionBox,
                  { backgroundColor: color.pastelBg }
                ]}>
                  <View
                    style={[
                      styles.colorButton,
                      { 
                        backgroundColor: color.code,
                        borderWidth: color.border ? 2 : 0,
                        borderColor: '#C0C0C0',
                      },
                    ]}
                  >
                    <Text style={styles.buttonEmoji}>{color.emoji}</Text>
                  </View>
                  <Text style={styles.optionName}>{color.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* -umut: Oyun bitişi modal'ı (28.10.2025) */}
      <Modal
        visible={gameFinished}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.modalSubtitle}>You completed the game!</Text>
            
            {/* -umut: Sonuç kartları (28.10.2025) */}
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

            {/* -umut: Motivasyon mesajı (28.10.2025) */}
            <Text style={styles.message}>
              {correctCount >= 8 ? "Perfect! 🌟" : 
               correctCount >= 6 ? "Great! 👏" : 
               "Keep Going! 💪"}
            </Text>

            {/* -umut: Butonlar (28.10.2025) */}
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

// -umut: Stil tanımlamaları (28.10.2025)
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
  // Dekoratif arkaplan çemberleri
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
  targetColorBox: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  targetColor: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorEmoji: {
    fontSize: 46,
  },
  colorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A4A4A',
    marginTop: 10,
    letterSpacing: 0.8,
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
    width: (width - 42) / 2, // 2 sütun
    marginBottom: 10,
  },
  optionBox: {
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  colorButton: {
    width: 75,
    height: 75,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 36,
  },
  optionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A4A4A',
    marginTop: 7,
    letterSpacing: 0.5,
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
  // -umut: Modal butonları için yeni stiller (28.10.2025)
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
