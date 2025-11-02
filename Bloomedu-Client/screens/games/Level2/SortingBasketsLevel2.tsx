import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../utils/gameNavigation';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const ITEM_SIZE = width * 0.35;
const BASKET_SIZE = width * 0.32;

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

interface ItemData {
  id: string;
  name: string;
  emoji: string;
  category: 'food' | 'animal';
}

// Kategori Verileri
const CATEGORIES = {
  food: {
    name: 'Foods',
    icon: '🍎',
    color: '#FF6B6B',
    items: [
      { id: 'apple', name: 'Apple', emoji: '🍎' },
      { id: 'banana', name: 'Banana', emoji: '🍌' },
      { id: 'bread', name: 'Bread', emoji: '🍞' },
      { id: 'cheese', name: 'Cheese', emoji: '🧀' },
      { id: 'orange', name: 'Orange', emoji: '🍊' },
    ],
  },
  animal: {
    name: 'Animals',
    icon: '🐶',
    color: '#4ECDC4',
    items: [
      { id: 'cat', name: 'Cat', emoji: '🐱' },
      { id: 'dog', name: 'Dog', emoji: '🐶' },
      { id: 'cow', name: 'Cow', emoji: '🐮' },
      { id: 'bird', name: 'Bird', emoji: '🐦' },
      { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
    ],
  },
};

// Tüm nesneleri karıştır
const createShuffledItems = (): ItemData[] => {
  const allItems: ItemData[] = [
    ...CATEGORIES.food.items.map(item => ({ ...item, category: 'food' as const })),
    ...CATEGORIES.animal.items.map(item => ({ ...item, category: 'animal' as const })),
  ];
  return allItems.sort(() => Math.random() - 0.5);
};

const SortingBasketsLevel2 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle } = (route.params as RouteParams) || {};

  const [items] = useState<ItemData[]>(createShuffledItems());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0); // Doğru cevap sayısı
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [gameStartTime] = useState(Date.now());

  const itemScale = useRef(new Animated.Value(1)).current;
  const itemShake = useRef(new Animated.Value(0)).current;
  const basketPulseFood = useRef(new Animated.Value(1)).current;
  const basketPulseAnimal = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const currentItem = items[currentIndex];
  const totalQuestions = items.length;
  const isGameOver = currentIndex >= totalQuestions;

  useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.3);
    Tts.setDefaultPitch(1.0);
    Tts.setIgnoreSilentSwitch('ignore');

    // Start basket pulse animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(basketPulseFood, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(basketPulseFood, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(basketPulseAnimal, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(basketPulseAnimal, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      speakInstruction();
    }, 500);

    return () => {
      Tts.stop();
    };
  }, []);

  useEffect(() => {
    if (!isGameOver && currentIndex > 0) {
      speakInstruction();
    }
  }, [currentIndex]);

  const speakInstruction = () => {
    if (currentItem) {
      Tts.speak(`Where does the ${currentItem.name} belong?`);
    }
  };

  const handleBasketTap = (tappedCategory: 'food' | 'animal') => {
    if (feedback || isGameOver) return;

    if (tappedCategory === currentItem.category) {
      // DOĞRU CEVAP
      setFeedback('correct');
      setCorrectAnswers(correctAnswers + 1); // Doğru cevap sayısını artır

      // Success animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(itemScale, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(itemScale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      Tts.speak('Great! Correct!');

      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(currentIndex + 1);
          setFeedback('');
          itemScale.setValue(1);
          successOpacity.setValue(0);
        } else {
          completeGame();
        }
      }, 1500);
    } else {
      // YANLIŞ CEVAP - Puan düşer!
      setFeedback('incorrect');
      
      // Puanı düş (negatif olmayacak şekilde)
      if (correctAnswers > 0) {
        setCorrectAnswers(correctAnswers - 1);
      }

      // Shake animation
      Animated.sequence([
        Animated.timing(itemShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(itemShake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(itemShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(itemShake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      Tts.speak('Oops! Try again!');

      setTimeout(() => {
        setFeedback('');
      }, 1000);
    }
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
            game_type: 'sorting_baskets',
            level: 2,
            score: correctAnswers, // Sadece doğru cevaplar
            max_score: totalQuestions,
            duration_seconds: Math.floor(totalTime / 1000),
            completed: true,
          }),
        });

        if (response.ok) {
          console.log('✅ Sorting Baskets game session saved successfully!');
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
        setCurrentIndex(0);
        setCorrectAnswers(0);
        setFeedback('');
        itemScale.setValue(1);
        itemShake.setValue(0);
        successOpacity.setValue(0);
      },
    });

    gameNavigation.showCompletionMessage(
      correctAnswers,
      totalQuestions,
      'Amazing! You sorted everything correctly!'
    );
  };

  const handleHearAgain = () => {
    speakInstruction();
  };

  const sequenceInfo = gameSequence && currentGameIndex !== undefined
    ? `Game ${currentGameIndex + 1}/${gameSequence.length}`
    : '';

  if (isGameOver) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🧺 Sorting Baskets</Text>
          {sequenceInfo ? <Text style={styles.sequenceText}>{sequenceInfo}</Text> : null}
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {correctAnswers}/{totalQuestions}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / totalQuestions) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Item {currentIndex + 1} of {totalQuestions}</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Instruction */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Where does it belong? 🤔</Text>
          <TouchableOpacity style={styles.hearAgainButton} onPress={handleHearAgain}>
            <Text style={styles.hearAgainText}>🔊 Hear again</Text>
          </TouchableOpacity>
        </View>

        {/* Current Item - BÜYÜK VE ÜSTTE */}
        <View style={styles.itemSection}>
          <Animated.View
            style={[
              styles.itemCard,
              {
                transform: [
                  { scale: itemScale },
                  { translateX: itemShake },
                ],
                borderColor: feedback === 'incorrect' ? '#D84315' : '#00796B',
              },
            ]}
          >
            <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
            <Text style={styles.itemName}>{currentItem.name}</Text>
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.successMessage,
              { opacity: successOpacity },
            ]}
          >
            <Text style={styles.successText}>✨ Perfect! ✨</Text>
          </Animated.View>
        </View>

        {/* Baskets - ALTTA SEÇENEKLER */}
        <View style={styles.basketsSection}>
          <Text style={styles.basketsTitle}>Choose the basket:</Text>
          
          <View style={styles.basketsContainer}>
            <TouchableOpacity
              style={[
                styles.basket,
                { 
                  backgroundColor: CATEGORIES.food.color + '15',
                  borderColor: CATEGORIES.food.color 
                },
                feedback === 'correct' && currentItem.category === 'food' && styles.correctBasket,
              ]}
              onPress={() => handleBasketTap('food')}
              activeOpacity={0.7}
            >
              <Animated.View 
                style={[
                  styles.basketContent,
                  { transform: [{ scale: basketPulseFood }] }
                ]}
              >
                <Text style={styles.basketIcon}>{CATEGORIES.food.icon}</Text>
                <Text style={[styles.basketName, { color: CATEGORIES.food.color }]}>
                  {CATEGORIES.food.name}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.basket,
                { 
                  backgroundColor: CATEGORIES.animal.color + '15',
                  borderColor: CATEGORIES.animal.color 
                },
                feedback === 'correct' && currentItem.category === 'animal' && styles.correctBasket,
              ]}
              onPress={() => handleBasketTap('animal')}
              activeOpacity={0.7}
            >
              <Animated.View 
                style={[
                  styles.basketContent,
                  { transform: [{ scale: basketPulseAnimal }] }
                ]}
              >
                <Text style={styles.basketIcon}>{CATEGORIES.animal.icon}</Text>
                <Text style={[styles.basketName, { color: CATEGORIES.animal.color }]}>
                  {CATEGORIES.animal.name}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.encouragementText}>
          {currentIndex < 3 && "You're doing great! 🌟"}
          {currentIndex >= 3 && currentIndex < 7 && "Keep going! ⭐"}
          {currentIndex >= 7 && "Almost done! 🎯"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
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
    color: '#00796B',
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
    backgroundColor: '#00796B',
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
    backgroundColor: '#00796B',
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
  },
  instructionBox: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  hearAgainButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#00796B',
    borderRadius: 20,
  },
  hearAgainText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  itemCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: '#FFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  itemEmoji: {
    fontSize: ITEM_SIZE * 0.45,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  successMessage: {
    position: 'absolute',
    top: -50,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  successText: {
    fontSize: 22,
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
    paddingHorizontal: 10,
  },
  basket: {
    width: BASKET_SIZE,
    height: BASKET_SIZE * 1.1,
    borderRadius: 20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  correctBasket: {
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9',
    transform: [{ scale: 1.05 }],
  },
  basketContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  basketIcon: {
    fontSize: 56,
    marginBottom: 10,
  },
  basketName: {
    fontSize: 18,
    fontWeight: '700',
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

export default SortingBasketsLevel2;
