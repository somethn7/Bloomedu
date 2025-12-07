// -umut: LEVEL 1 MeetMyFamilyLevel1 - YENİDEN DÜZENLEME (07.12.2025)
// Bu oyun, otizmli çocukların aile üyelerini tanıma becerilerini geliştirmek için tasarlanmıştır
// Oyun sonuçları database'e kaydedilir ve öğretmenler bu verileri takip edebilir(wrong_count, success_rate)
// Özellikler: 10 soru, 6 aile üyesi, skorlama, süre takibi, sesli okuma
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';
import { sendGameResult } from '../../../config/api';

const { width, height } = Dimensions.get('window');

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
  name: string;
  emoji: string;
  role: string;
  message: string;
  color: string;
  bgColor: string;
  accentColor: string;
}

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    name: 'Mom',
    emoji: '👩',
    role: 'Mother',
    message: 'This is Mom! She loves you very much!',
    color: '#FFE5F1',
    bgColor: '#FFF5FA',
    accentColor: '#FF6B9A',
  },
  {
    name: 'Dad',
    emoji: '👨',
    role: 'Father',
    message: 'This is Dad! He takes care of you!',
    color: '#E3F2FD',
    bgColor: '#F0F8FF',
    accentColor: '#64B5F6',
  },
  {
    name: 'Sister',
    emoji: '👧',
    role: 'Sister',
    message: 'This is Sister! She plays with you!',
    color: '#F3E5F5',
    bgColor: '#FAF5FC',
    accentColor: '#BA68C8',
  },
  {
    name: 'Brother',
    emoji: '👦',
    role: 'Brother',
    message: 'This is Brother! He shares toys with you!',
    color: '#E8F5E9',
    bgColor: '#F1F8F2',
    accentColor: '#81C784',
  },
  {
    name: 'Baby',
    emoji: '👶',
    role: 'Baby',
    message: 'This is Baby! So cute and small!',
    color: '#FFF9C4',
    bgColor: '#FFFEF0',
    accentColor: '#FFD54F',
  },
  {
    name: 'Grandma',
    emoji: '👵',
    role: 'Grandmother',
    message: 'This is Grandma! She bakes yummy cookies!',
    color: '#FFE0B2',
    bgColor: '#FFF4E6',
    accentColor: '#FFB74D',
  },
  {
    name: 'Grandpa',
    emoji: '👴',
    role: 'Grandfather',
    message: 'This is Grandpa! He tells fun stories!',
    color: '#D7CCC8',
    bgColor: '#EFEBE9',
    accentColor: '#A1887F',
  },
];

export default function MeetMyFamilyLevel1({ navigation }: any) {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  // Game State
  const [showIntro, setShowIntro] = useState(true);
  const [currentMember, setCurrentMember] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics (Gold Standard)
  const [score, setScore] = useState(0); // Completed members count
  const [wrongCount, setWrongCount] = useState(0); // 0
  const [answeredCount, setAnsweredCount] = useState(0); // Same as score

  // Refs
  const gameStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Animations
  const introAnim = useRef(new Animated.Value(0)).current;
  const memberAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  const houseScale = useRef(new Animated.Value(1)).current;

  const member = hasStarted ? FAMILY_MEMBERS[currentMember] : null;
  const totalMembers = FAMILY_MEMBERS.length;

  // --- INIT & TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    // Intro animation
    Animated.spring(introAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // House pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(houseScale, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(houseScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      Tts.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- MEMBER SEQUENCE LOGIC ---
  useEffect(() => {
    if (hasStarted && member && !gameFinished) {
      // Metrics Update
      setScore(prev => prev + 1);
      setAnsweredCount(prev => prev + 1);

      // Reset animations
      memberAnim.setValue(0);
      heartAnim.setValue(0);

      // Member entrance
      Animated.spring(memberAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Hearts animation
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(heartAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(heartAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
          ])
        ).start();
      }, 1000);

      // TTS
      setTimeout(() => {
        Tts.speak(member.message);
      }, 800);

      // Auto Next
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (currentMember < totalMembers - 1) {
          setCurrentMember(prev => prev + 1);
        } else {
          setGameFinished(true);
        }
      }, 5500);
    }
  }, [hasStarted, currentMember, gameFinished]);

  const startGame = () => {
    setShowIntro(false);
    setTimeout(() => {
      setHasStarted(true);
      gameStartTimeRef.current = Date.now(); // Start timing when actual game starts
      Tts.speak('Let us meet your family!');
    }, 500);
  };

  // --- DATABASE & COMPLETION ---
  const sendToDatabase = async () => {
    if (!child?.id) return;

    const totalTimeMs = Date.now() - gameStartTimeRef.current;
    
    // Observation game: 100% success rate
    const safeAnswered = answeredCount > 0 ? answeredCount : 1;
    const successRate = 100;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'meet_family',
        level: 1,
        score: score,
        max_score: totalMembers,
        duration_seconds: Math.floor(totalTimeMs / 1000),
        wrong_count: 0,
        success_rate: successRate,
        details: {
          totalQuestions: totalMembers,
          answeredCount: safeAnswered,
          wrongCount: 0,
          successRate: 100,
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

  const resetGame = () => {
    setShowIntro(true);
    setCurrentMember(0);
    setHasStarted(false);
    setScore(0);
    setAnsweredCount(0);
    setGameFinished(false);
    memberAnim.setValue(0);
    heartAnim.setValue(0);
  };

  const handleGameCompletion = () => {
    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: resetGame,
    });

    gameNav.showCompletionMessage(
      score,
      totalMembers,
      'Wonderful! You met your whole family! 👨‍👩‍👧‍👦💕'
    );
  };

  // --- RENDER HELPERS ---
  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  if (showIntro) {
    return (
      <View style={styles.introContainer}>
        {/* Header */}
        <View style={styles.introHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          {sequenceInfo ? (
            <Text style={styles.sequenceTextIntro}>{sequenceInfo}</Text>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* House */}
        <Animated.View
          style={[
            styles.houseContainer,
            {
              transform: [
                { scale: houseScale },
                {
                  scale: introAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
              opacity: introAnim,
            },
          ]}
        >
          <View style={styles.familyAnimationContainer}>
            <Text style={styles.familyMemberIcon}>👨</Text>
            <Text style={styles.familyMemberIcon}>👩</Text>
            <Text style={styles.familyMemberIcon}>👧</Text>
            <Text style={styles.familyMemberIcon}>👦</Text>
          </View>
          <Text style={styles.houseEmoji}>🏠</Text>
          <Text style={styles.houseTitle}>My Family</Text>
          <Text style={styles.houseSubtitle}>Meet everyone with love! 💕</Text>
        </Animated.View>

        {/* Start Button */}
        <Animated.View
          style={[
            styles.startButtonContainer,
            {
              opacity: introAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 1],
              }),
              transform: [
                {
                  translateY: introAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.8}>
            <Text style={styles.startButtonEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.startButtonText}>Meet My Family!</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Decorative elements */}
        <Animated.View style={[styles.decorHeart, styles.decorHeart1, { opacity: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) }]}>
          <Text style={styles.decorHeartText}>💕</Text>
        </Animated.View>
        <Animated.View style={[styles.decorHeart, styles.decorHeart2, { opacity: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]}>
          <Text style={styles.decorHeartText}>❤️</Text>
        </Animated.View>
        <Animated.View style={[styles.decorHeart, styles.decorHeart3, { opacity: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }]}>
          <Text style={styles.decorHeartText}>💖</Text>
        </Animated.View>
      </View>
    );
  }

  if (!member) return null;

  const memberScale = memberAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const heartOpacity = heartAnim;
  const heartTranslateY = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  return (
    <View style={[styles.container, { backgroundColor: member.bgColor }]}>
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>👨‍👩‍👧‍👦 My Family</Text>
            {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {currentMember + 1}/{totalMembers}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentMember + 1) / totalMembers) * 100}%`,
                  backgroundColor: member.accentColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Member Display */}
        <View style={styles.memberArea}>
          {/* Role Badge */}
          <Animated.View
            style={[
              styles.roleBadge,
              { 
                backgroundColor: member.color,
                borderColor: member.accentColor,
                opacity: memberAnim,
              },
            ]}
          >
            <Text style={styles.roleText}>{member.role}</Text>
          </Animated.View>

          {/* Member Character */}
          <Animated.View
            style={[
              styles.memberContainer,
              {
                transform: [{ scale: memberScale }],
                opacity: memberAnim,
              },
            ]}
          >
            <View style={[styles.memberCircle, { backgroundColor: member.color, borderColor: member.accentColor }]}>
              <Text style={styles.memberEmoji}>{member.emoji}</Text>
            </View>
          </Animated.View>

          {/* Name */}
          <Animated.View
            style={[
              styles.nameContainer,
              {
                opacity: memberAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0, 1],
                }),
              },
            ]}
          >
            <Text style={[styles.memberName, { color: member.accentColor }]}>{member.name}</Text>
          </Animated.View>

          {/* Message */}
          <Animated.View
            style={[
              styles.messageCard,
              {
                backgroundColor: member.color,
                borderColor: member.accentColor,
                opacity: memberAnim.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [0, 0, 1],
                }),
                transform: [
                  {
                    translateY: memberAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.messageText}>{member.message}</Text>
          </Animated.View>

          {/* Floating Hearts */}
          <Animated.View
            style={[
              styles.floatingHeart,
              styles.heart1,
              {
                opacity: heartOpacity,
                transform: [{ translateY: heartTranslateY }],
              },
            ]}
          >
            <Text style={styles.heartEmoji}>💕</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingHeart,
              styles.heart2,
              {
                opacity: heartOpacity,
                transform: [
                  {
                    translateY: heartTranslateY.interpolate({
                      inputRange: [-60, 0],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.heartEmoji}>❤️</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingHeart,
              styles.heart3,
              {
                opacity: heartOpacity,
                transform: [
                  {
                    translateY: heartTranslateY.interpolate({
                      inputRange: [-60, 0],
                      outputRange: [-55, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.heartEmoji}>💖</Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentMember < 3 && 'Meet your family! 💝'}
            {currentMember >= 3 && currentMember < 5 && 'You have a wonderful family! 🌟'}
            {currentMember >= 5 && 'Almost done! 👨‍👩‍👧‍👦'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  introHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B9A',
    fontWeight: 'bold',
  },
  sequenceTextIntro: {
    fontSize: 12,
    color: '#999',
  },
  houseContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  familyAnimationContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  familyMemberIcon: {
    fontSize: 40,
  },
  houseEmoji: {
    fontSize: 100,
    marginBottom: 15,
  },
  houseTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  houseSubtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  startButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#FF6B9A',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#FF6B9A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonEmoji: {
    fontSize: 32,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  decorHeart: {
    position: 'absolute',
  },
  decorHeart1: {
    top: 120,
    left: 30,
  },
  decorHeart2: {
    top: 180,
    right: 40,
  },
  decorHeart3: {
    bottom: 150,
    left: 50,
  },
  decorHeartText: {
    fontSize: 40,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  memberArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  roleBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 30,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  memberContainer: {
    marginBottom: 25,
  },
  memberCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  memberEmoji: {
    fontSize: width * 0.28,
  },
  nameContainer: {
    marginBottom: 25,
  },
  memberName: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 3,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  floatingHeart: {
    position: 'absolute',
  },
  heart1: {
    left: width * 0.15,
    top: height * 0.4,
  },
  heart2: {
    right: width * 0.15,
    top: height * 0.45,
  },
  heart3: {
    left: width * 0.5 - 15,
    top: height * 0.3,
  },
  heartEmoji: {
    fontSize: 30,
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