import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
}

interface NumberData {
  value: number;
  display: string;
  color: string;
  emoji: string;
}

const LearnNumbers = ({ navigation }: any) => {
  const route = useRoute();
  const child = (route.params as RouteParams)?.child;
  
  const [currentNumber, setCurrentNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  
  // Animation values
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const numbers: NumberData[] = [
    { value: 1, display: '1', color: '#FF6B9A', emoji: '🌟' },
    { value: 2, display: '2', color: '#4ECDC4', emoji: '⭐' },
    { value: 3, display: '3', color: '#45B7D1', emoji: '✨' },
    { value: 4, display: '4', color: '#96CEB4', emoji: '🎯' },
    { value: 5, display: '5', color: '#FFEAA7', emoji: '🎈' },
    { value: 6, display: '6', color: '#DDA0DD', emoji: '🎨' },
    { value: 7, display: '7', color: '#98D8C8', emoji: '🎪' },
    { value: 8, display: '8', color: '#F7DC6F', emoji: '🎭' },
    { value: 9, display: '9', color: '#BB8FCE', emoji: '🎨' },
    { value: 10, display: '10', color: '#85C1E9', emoji: '🎊' },
  ];

  // Start pulse animation for the current number
  useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.8);
    Tts.setDefaultPitch(1.2);
    Tts.setDefaultVoice('en-US');
    Tts.setIgnoreSilentSwitch('ignore');
    
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [currentNumber]);

  const animateCorrectAnswer = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Celebration effect
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1000);

    // Haptic feedback (safe)
    try {
      Vibration.vibrate(100);
    } catch (e) {
      // ignore if vibration not permitted/available
    }
  };

  const handleNumberPress = (selectedNumber: number) => {
    if (!isPlaying) return;

    if (selectedNumber === currentNumber) {
      // Correct answer
      setScore(score + 1);
      setStreak(streak + 1);
      animateCorrectAnswer();

      // Move to next number
      setTimeout(() => {
        if (currentNumber < 10) {
          setCurrentNumber(currentNumber + 1);
        } else {
          // Game completed
          setIsPlaying(false);
          showCompletionMessage();
        }
      }, 1000);
    } else {
      // Wrong answer - gentle feedback
      setStreak(0);
      try {
        Vibration.vibrate([0, 50, 100, 50]);
      } catch (e) {
        // ignore if vibration not permitted/available
      }
      
      // TTS feedback for wrong answer
      Tts.speak('Please try again');
      
      // Shake animation
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
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
          game_type: 'learn_numbers',
          level: 1,
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
        console.log('✅ Learn Numbers game session saved successfully!');
      } else {
        console.warn('⚠️ Failed to save game session:', result.message);
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const showCompletionMessage = () => {
    const totalTime = Date.now() - gameStartTime;
    const gameResult = {
      correctAnswers: score,
      totalQuestions: 10,
      totalTime: totalTime,
    };
    
    // Send to database
    sendToDatabase(gameResult);
    
    Alert.alert(
      '🎉 Amazing! 🎉',
      `You learned all the numbers! Ready for the next challenge?`,
      [
        {
          text: 'Play Again',
          onPress: () => {
            setCurrentNumber(1);
            setScore(0);
            setStreak(0);
            setIsPlaying(true);
            setGameStartTime(Date.now());
          },
        },
        {
          text: 'Next Level',
          onPress: () => {
            // Navigate to the matching game
            navigation.navigate('MissingNumbers', { child });
          },
        },
        {
          text: 'Main Menu',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const currentNumberData = numbers[currentNumber - 1];
  const progress = (currentNumber / 10) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Learn Numbers</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentNumber} / 10
        </Text>
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Current Number Display */}
        <View style={styles.currentNumberContainer}>
          <Animated.View
            style={[
              styles.currentNumberDisplay,
              {
                backgroundColor: currentNumberData.color,
                transform: [
                  { scale: pulseAnim },
                  { rotate: rotateAnim.interpolate({
                    inputRange: [-10, 10],
                    outputRange: ['-10deg', '10deg'],
                  })},
                ],
              },
            ]}
          >
            <Text style={styles.currentNumberEmoji}>
              {currentNumberData.emoji}
            </Text>
            <Animated.Text
              style={[
                styles.currentNumberText,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: bounceAnim },
                  ],
                },
              ]}
            >
              {currentNumberData.display}
            </Animated.Text>
          </Animated.View>
        </View>

        {/* Instruction */}
        <Text style={styles.instruction}>
          Find and touch this number! 👆
        </Text>

        {/* Number Buttons Grid */}
        <View style={styles.numbersGrid}>
          {numbers.map((number, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberButton,
                {
                  backgroundColor: number.color,
                  opacity: isPlaying ? 1 : 0.7,
                },
              ]}
              onPress={() => handleNumberPress(number.value)}
              disabled={!isPlaying}
            >
              <Text style={styles.numberEmoji}>{number.emoji}</Text>
              <Text style={styles.numberText}>{number.display}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Celebration Effect */}
        {showCelebration && (
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationText}>🎉 Correct! 🎉</Text>
          </View>
        )}

        {/* Streak Display */}
        {streak > 0 && (
          <View style={styles.streakContainer} pointerEvents="none">
            <Text style={styles.streakText}>
              🔥 {streak} in a row!
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.encouragementText}>
          {currentNumber <= 3 && "Great start! 🌟"}
          {currentNumber > 3 && currentNumber <= 7 && "You're doing great! ⭐"}
          {currentNumber > 7 && "Almost done! 🎯"}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
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
    paddingVertical: 30,
  },
  currentNumberContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  currentNumberDisplay: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  currentNumberEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  currentNumberText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instruction: {
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    fontWeight: '600',
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  numberButton: {
    width: (width - 80) / 5,
    height: (width - 80) / 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  numberEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  celebrationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9A',
    textAlign: 'center',
  },
  streakContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9A',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
});

export default LearnNumbers;