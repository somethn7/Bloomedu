import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const BALL_SIZE = width * 0.22;
const BASKET_SIZE = width * 0.28;

interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
  gameSequence?: string[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

interface ColorData {
  name: string;
  color: string;
  emoji: string;
}

const COLORS: ColorData[] = [
  { name: 'red', color: '#FF6B6B', emoji: '🔴' },
  { name: 'blue', color: '#4ECDC4', emoji: '🔵' },
  { name: 'green', color: '#95E1D3', emoji: '🟢' },
  { name: 'yellow', color: '#F9CA24', emoji: '🟡' },
  { name: 'purple', color: '#A29BFE', emoji: '🟣' },
];

const ColorMatchPathLevel2 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [gameStartTime] = useState(Date.now());

  const ballShake = useRef(new Animated.Value(0)).current;
  const basketPulse1 = useRef(new Animated.Value(1)).current;
  const basketPulse2 = useRef(new Animated.Value(1)).current;
  const basketPulse3 = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const currentColor = COLORS[currentColorIndex];
  const totalColors = COLORS.length;

  // Her soru için 3 rastgele renk seç (biri doğru cevap)
  const [basketColors, setBasketColors] = useState<ColorData[]>([]);

  useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    // Basket pulse animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(basketPulse1, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(basketPulse1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(basketPulse2, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(basketPulse2, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(basketPulse3, {
          toValue: 1.1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(basketPulse3, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      Tts.stop();
    };
  }, []);

  useEffect(() => {
    // Her yeni renk için sepetleri oluştur
    generateBaskets();
    setTimeout(() => {
      speakInstruction();
    }, 500);
  }, [currentColorIndex]);

  const generateBaskets = () => {
    // Doğru rengi al
    const correctColor = COLORS[currentColorIndex];
    
    // Diğer renklerden 2 tane rastgele seç
    const otherColors = COLORS.filter((_, idx) => idx !== currentColorIndex);
    const shuffled = otherColors.sort(() => Math.random() - 0.5);
    const wrongColors = shuffled.slice(0, 2);
    
    // 3 rengi karıştır
    const allBaskets = [correctColor, ...wrongColors].sort(() => Math.random() - 0.5);
    setBasketColors(allBaskets);
  };

  const speakInstruction = () => {
    Tts.speak(`Find the ${currentColor.name} basket!`);
  };

  const handleBasketTap = (selectedColor: ColorData) => {
    if (feedback) return;

    if (selectedColor.name === currentColor.name) {
      // DOĞRU CEVAP
      setFeedback('correct');
      setCorrectAnswers(correctAnswers + 1);

      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Tts.speak(`Perfect! ${currentColor.name} matches ${currentColor.name}!`);

      setTimeout(() => {
        if (currentColorIndex < totalColors - 1) {
          nextColor();
        } else {
          completeGame();
        }
      }, 1500);
    } else {
      // YANLIŞ CEVAP
      setFeedback('incorrect');

      // Shake animation
      Animated.sequence([
        Animated.timing(ballShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(ballShake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(ballShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(ballShake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      Tts.speak('Try again!');

      setTimeout(() => {
        setFeedback('');
      }, 1000);
    }
  };

  const nextColor = () => {
    setFeedback('');
    setCurrentColorIndex(currentColorIndex + 1);
    successOpacity.setValue(0);
    ballShake.setValue(0);
  };

  const completeGame = async () => {
    const totalTime = Date.now() - gameStartTime;

    if (child?.id) {
      try {
        const response = await fetch('http://10.0.2.2:3000/game-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            child_id: child.id,
            game_type: 'color_match_path',
            level: 2,
            score: correctAnswers,
            max_score: totalColors,
            duration_seconds: Math.floor(totalTime / 1000),
            completed: true,
          }),
        });

        if (response.ok) {
          console.log('✅ Color Match Path game session saved successfully!');
        }
      } catch (error) {
        console.error('❌ Error sending data:', error);
      }
    }

    const gameNavigation = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setCurrentColorIndex(0);
        setCorrectAnswers(0);
        setFeedback('');
        successOpacity.setValue(0);
        ballShake.setValue(0);
      },
    });

    gameNavigation.showCompletionMessage(
      correctAnswers,
      totalColors,
      'Amazing! You matched all the colors perfectly! 🎨'
    );
  };

  const handleHearAgain = () => {
    speakInstruction();
  };

  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  const getPulseAnim = (index: number) => {
    if (index === 0) return basketPulse1;
    if (index === 1) return basketPulse2;
    return basketPulse3;
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColor.color + '10' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🎨 Color Match</Text>
          {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {correctAnswers}/{totalColors}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${((currentColorIndex + 1) / totalColors) * 100}%`,
                backgroundColor: currentColor.color 
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Color {currentColorIndex + 1} of {totalColors}</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Instruction */}
        <View style={[styles.instructionCard, { borderColor: currentColor.color }]}>
          <Text style={styles.instructionEmoji}>🎯</Text>
          <Text style={styles.instructionText}>
            Find the {currentColor.name} basket!
          </Text>
          <TouchableOpacity 
            style={[styles.hearButton, { backgroundColor: currentColor.color }]} 
            onPress={handleHearAgain}
          >
            <Text style={styles.hearButtonText}>🔊 Hear again</Text>
          </TouchableOpacity>
        </View>

        {/* Ball - ÜSTTE BÜYÜK */}
        <View style={styles.ballSection}>
          <Animated.View
            style={[
              styles.ballContainer,
              {
                transform: [{ translateX: ballShake }],
              },
            ]}
          >
            <View style={[styles.ballCircle, { backgroundColor: currentColor.color }]}>
              <Text style={styles.ballEmoji}>{currentColor.emoji}</Text>
            </View>
            <Text style={[styles.colorLabel, { color: currentColor.color }]}>
              {currentColor.name.toUpperCase()}
            </Text>
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.successMessage,
              { opacity: successOpacity },
            ]}
          >
            <Text style={styles.successText}>🎉 Perfect Match! 🎉</Text>
          </Animated.View>
        </View>

        {/* Baskets - ALTTA SEÇENEKLER */}
        <View style={styles.basketsSection}>
          <Text style={styles.basketsTitle}>Choose the matching basket:</Text>
          
          <View style={styles.basketsContainer}>
            {basketColors.map((basketColor, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.basket,
                  { 
                    backgroundColor: basketColor.color + '20',
                    borderColor: basketColor.color 
                  },
                  feedback === 'correct' && basketColor.name === currentColor.name && styles.correctBasket,
                ]}
                onPress={() => handleBasketTap(basketColor)}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.basketContent,
                    { transform: [{ scale: getPulseAnim(index) }] }
                  ]}
                >
                  <View style={[styles.basketCircle, { borderColor: basketColor.color }]}>
                    <Text style={styles.basketEmoji}>🧺</Text>
                  </View>
                  <Text style={[styles.basketLabel, { color: basketColor.color }]}>
                    {basketColor.name.toUpperCase()}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.encouragementText}>
          {currentColorIndex < 2 && "Great focus! 🌟"}
          {currentColorIndex >= 2 && currentColorIndex < 4 && "You're doing amazing! ⭐"}
          {currentColorIndex >= 4 && "Almost done! 🎯"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#4ECDC4',
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
    backgroundColor: '#4ECDC4',
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
    marginBottom: 30,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 15,
  },
  hearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ballSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ballContainer: {
    alignItems: 'center',
  },
  ballCircle: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  ballEmoji: {
    fontSize: BALL_SIZE * 0.5,
  },
  colorLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  successMessage: {
    position: 'absolute',
    top: -40,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  basketsSection: {
    flex: 1,
  },
  basketsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  basketsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  basket: {
    width: BASKET_SIZE,
    height: BASKET_SIZE * 1.1,
    borderRadius: 20,
    borderWidth: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  correctBasket: {
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9',
    transform: [{ scale: 1.1 }],
  },
  basketContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  basketCircle: {
    width: BASKET_SIZE * 0.6,
    height: BASKET_SIZE * 0.6,
    borderRadius: (BASKET_SIZE * 0.6) / 2,
    backgroundColor: '#FFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  basketEmoji: {
    fontSize: BASKET_SIZE * 0.3,
  },
  basketLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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

export default ColorMatchPathLevel2;
