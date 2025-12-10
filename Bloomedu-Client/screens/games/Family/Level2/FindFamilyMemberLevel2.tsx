// -umut: LEVEL 2 FindFamilyMemberLevel2 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların aile üyelerini tanıma ve bulma becerilerini geliştirir
// Oyun sonuçları database'e kaydedilir (wrong_count, success_rate)
// Özellikler: 2 Seçenekli sorular, Sesli yönergeler, 12 Soru

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

interface FamilyMember {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'mom', name: 'Mom', emoji: '👩', color: '#FFE5F1', bgColor: '#FF6B9A', description: 'She loves you!' },
  { id: 'dad', name: 'Dad', emoji: '👨', color: '#E3F2FD', bgColor: '#64B5F6', description: 'He protects you!' },
  { id: 'sister', name: 'Sister', emoji: '👧', color: '#F3E5F5', bgColor: '#BA68C8', description: 'She plays with you!' },
  { id: 'brother', name: 'Brother', emoji: '👦', color: '#E8F5E9', bgColor: '#81C784', description: 'He shares with you!' },
  { id: 'baby', name: 'Baby', emoji: '👶', color: '#FFF9C4', bgColor: '#FFD54F', description: 'So cute!' },
  { id: 'grandma', name: 'Grandma', emoji: '👵', color: '#FFE0B2', bgColor: '#FFB74D', description: 'She bakes cookies!' },
  { id: 'grandpa', name: 'Grandpa', emoji: '👴', color: '#D7CCC8', bgColor: '#A1887F', description: 'He tells stories!' },
];

interface Question {
  correctAnswer: FamilyMember;
  options: FamilyMember[];
}

const TOTAL_QUESTIONS = 12;

const generateSmartQuestions = (): Question[] => {
  const allQuestions: Question[] = [];
  
  for (let i = 0; i < FAMILY_MEMBERS.length; i++) {
    for (let j = i + 1; j < FAMILY_MEMBERS.length; j++) {
      const member1 = FAMILY_MEMBERS[i];
      const member2 = FAMILY_MEMBERS[j];
      allQuestions.push({ correctAnswer: member1, options: [member1, member2] });
      allQuestions.push({ correctAnswer: member2, options: [member1, member2] });
    }
  }

  const shuffled: Question[] = [];
  let available = [...allQuestions];

  const firstIndex = Math.floor(Math.random() * available.length);
  shuffled.push(available.splice(firstIndex, 1)[0]);

  while (available.length > 0) {
    const lastAnswerId = shuffled[shuffled.length - 1].correctAnswer.id;
    let candidates = available.filter(q => q.correctAnswer.id !== lastAnswerId);
    let next: Question;
    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      next = candidates[idx];
      available = available.filter(q => q !== next);
    } else {
      const idx = Math.floor(Math.random() * available.length);
      next = available.splice(idx, 1)[0];
    }
    shuffled.push(next);
  }

  return shuffled.slice(0, TOTAL_QUESTIONS);
};

export default function FindFamilyMemberLevel2({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [questions] = useState<Question[]>(() => generateSmartQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());

  // Animations
  const questionAnim = useRef(new Animated.Value(0)).current;
  const optionScale1 = useRef(new Animated.Value(1)).current;
  const optionScale2 = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentQuestionIndex];

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    return () => {
      Tts.stop();
    };
  }, []);

  // --- QUESTION ANIMATION & TTS ---
  useEffect(() => {
    if (!gameFinished && currentQuestion) {
      // Question Anim
      questionAnim.setValue(0);
      Animated.spring(questionAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();

      // Options Pulse
      const pulse = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1.05, duration: 1000, delay, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          ])
        ).start();
      };
      pulse(optionScale1, 0);
      pulse(optionScale2, 500);

      // TTS
      setTimeout(() => {
        Tts.speak(`Where is ${currentQuestion.correctAnswer.name}?`);
      }, 600);
    }
  }, [currentQuestionIndex, gameFinished]);

  // --- INTERACTION ---
  const handleOptionPress = (selectedMember: FamilyMember) => {
    if (selectedOption !== null) return;

    setSelectedOption(selectedMember.id);
    const correct = selectedMember.id === currentQuestion.correctAnswer.id;
    setIsCorrect(correct);

    if (correct) {
      // ✅ Correct
      Tts.speak('Correct! Well done!');
      setScore(prev => prev + 1);
      setAnsweredCount(prev => prev + 1);

      Animated.spring(successAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();

      setTimeout(() => {
        successAnim.setValue(0);
        setSelectedOption(null);
        setIsCorrect(null);
        
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setGameFinished(true);
        }
      }, 2000);
    } else {
      // ❌ Incorrect
      Tts.speak('Try again!');
      setScore(prev => Math.max(0, prev - 1));
      setWrongCount(prev => prev + 1);

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const handleHearAgain = () => {
    if (currentQuestion) {
      Tts.speak(`Where is ${currentQuestion.correctAnswer.name}?`);
    }
  };

  // --- DATABASE & COMPLETION ---
  const sendToDatabase = async () => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    const safeAnswered = answeredCount > 0 ? answeredCount : 1;
    const safeScore = score < 0 ? 0 : score;
    const successRate = Math.round((safeScore / safeAnswered) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'find_family_member',
        level: 2,
        score: safeScore,
        max_score: TOTAL_QUESTIONS,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: wrongCount,
        success_rate: successRate,
        details: {
          totalQuestions: TOTAL_QUESTIONS,
          answeredCount: safeAnswered,
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
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setScore(0);
        setWrongCount(0);
        setAnsweredCount(0);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
      },
    });

    gameNav.showCompletionMessage(
      score,
      TOTAL_QUESTIONS,
      'Wonderful! You know your family very well! 👨‍👩‍👧‍👦💕'
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  if (!currentQuestion) return null;

  const questionScale = questionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>👨‍👩‍👧‍👦 Find Family</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%`,
                  backgroundColor: currentQuestion.correctAnswer.bgColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
          </Text>
        </View>

        {/* Question Card */}
        <Animated.View
          style={[
            styles.questionCard,
            {
              borderColor: currentQuestion.correctAnswer.bgColor,
              opacity: questionAnim,
              transform: [{ scale: questionScale }, { translateX: shakeAnim }],
            },
          ]}
        >
          <Text style={styles.questionEmoji}>🤔</Text>
          <Text style={styles.questionText}>Where is {currentQuestion.correctAnswer.name}?</Text>
          <Text style={styles.questionSubtext}>{currentQuestion.correctAnswer.description}</Text>
          <TouchableOpacity style={styles.hearAgainButton} onPress={handleHearAgain}>
            <Text style={styles.hearAgainText}>🔊 Hear Again</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((member, index) => {
            const isSelected = selectedOption === member.id;
            const showCorrect = isCorrect === true && isSelected;
            const showWrong = isCorrect === false && isSelected;
            const scaleAnim = index === 0 ? optionScale1 : optionScale2;

            return (
              <Animated.View
                key={member.id}
                style={[
                  {
                    transform: [{ scale: selectedOption === null ? scaleAnim : 1 }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    { backgroundColor: member.color, borderColor: member.bgColor },
                    showCorrect && styles.correctCard,
                    showWrong && styles.wrongCard,
                  ]}
                  onPress={() => handleOptionPress(member)}
                  disabled={selectedOption !== null}
                  activeOpacity={0.8}
                >
                  <View style={[styles.memberCircle, { backgroundColor: member.bgColor }]}>
                    <Text style={styles.memberEmoji}>{member.emoji}</Text>
                  </View>
                  <Text style={[styles.memberName, { color: member.bgColor }]}>{member.name}</Text>
                  {isSelected && (
                    <View style={styles.feedbackBadge}>
                      <Text style={styles.feedbackEmoji}>
                        {showCorrect ? '✅' : showWrong ? '❌' : ''}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Success Message */}
        {isCorrect === true && (
          <Animated.View
            style={[
              styles.successMessage,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.successText}>🎉 Perfect! 🎉</Text>
          </Animated.View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentQuestionIndex < 3 && 'You are doing great! 🌟'}
            {currentQuestionIndex >= 3 && currentQuestionIndex < 7 && 'Keep going! 💪'}
            {currentQuestionIndex >= 7 && 'Almost done! 🎯'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
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
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 25,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  hearAgainButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hearAgainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  optionCard: {
    width: width * 0.4,
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  correctCard: {
    borderColor: '#4ECDC4',
    backgroundColor: '#E8F9F5',
    shadowColor: '#4ECDC4',
  },
  wrongCard: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFE5E5',
    shadowColor: '#FF6B6B',
  },
  memberCircle: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  memberEmoji: {
    fontSize: width * 0.15,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackBadge: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  feedbackEmoji: {
    fontSize: 28,
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
  footerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});