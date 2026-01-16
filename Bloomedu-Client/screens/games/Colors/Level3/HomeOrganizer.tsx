import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// Renkler ve nesneler
const COLOR_BOXES = [
  { id: 'red', name: 'RED', code: '#FF6B6B', emoji: '📦' },
  { id: 'blue', name: 'BLUE', code: '#4DABF7', emoji: '📦' },
  { id: 'green', name: 'GREEN', code: '#51CF66', emoji: '📦' },
];

const COLOR_ITEMS: Record<string, any[]> = {
  red: [
    { id: 'shirt', emoji: '👕', name: 'T-Shirt' },
    { id: 'car', emoji: '🚗', name: 'Car' },
    { id: 'apple', emoji: '🍎', name: 'Apple' },
    { id: 'ball', emoji: '⚽', name: 'Ball' },
    { id: 'hat', emoji: '🎩', name: 'Hat' },
  ],
  blue: [
    { id: 'book', emoji: '📘', name: 'Book' },
    { id: 'jeans', emoji: '👖', name: 'Jeans' },
    { id: 'bird', emoji: '🐦', name: 'Bird' },
    { id: 'bag', emoji: '🎒', name: 'Bag' },
    { id: 'cup', emoji: '☕', name: 'Cup' },
  ],
  green: [
    { id: 'apple', emoji: '🍏', name: 'Apple' },
    { id: 'tree', emoji: '🌳', name: 'Tree' },
    { id: 'grass', emoji: '🌿', name: 'Grass' },
    { id: 'bottle', emoji: '🍾', name: 'Bottle' },
    { id: 'toy', emoji: '🧸', name: 'Toy' },
  ],
};

// Rastgele seçilmiş eşyalar (her oyunda farklı)
const getRandomItems = () => {
  const allItems: any[] = [];
  COLOR_BOXES.forEach((box) => {
    const items = COLOR_ITEMS[box.id];
    const selected = items.sort(() => 0.5 - Math.random()).slice(0, 4); // Her renkten 4 tane
    selected.forEach((item) => {
      allItems.push({ ...item, correctColor: box.id, colorCode: box.code });
    });
  });
  return allItems.sort(() => 0.5 - Math.random()); // Karıştır
};

const MAX_ROUNDS = 3;

const HomeOrganizer = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [organizedItems, setOrganizedItems] = useState<Record<string, any[]>>({
    red: [],
    blue: [],
    green: [],
  });
  const [gameFinished, setGameFinished] = useState(false);

  // Metrics
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Box layouts
  const boxLayouts = useRef<Record<string, any>>({});

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.35);
    startNewRound();
    return () => Tts.stop();
  }, []);

  const startNewRound = () => {
    if (currentRound >= MAX_ROUNDS) {
      setGameFinished(true);
      return;
    }

    const newItems = getRandomItems();
    setItems(newItems);
    setOrganizedItems({ red: [], blue: [], green: [] });

    setTimeout(() => {
      Tts.speak('Organize the items by color! Put each item in the matching color box.');
    }, 500);
  };

  const handleItemDrop = (item: any, boxId: string) => {
    if (item.correctColor === boxId) {
      // ✅ Correct
      setScore(prev => prev + 1);
      Tts.speak(`Great! ${item.name} is ${COLOR_BOXES.find(b => b.id === boxId)?.name}!`);

      setItems(prev => prev.filter(i => i.id !== item.id || i.correctColor !== item.correctColor));
      setOrganizedItems(prev => ({
        ...prev,
        [boxId]: [...prev[boxId], item],
      }));

      // Check if all items organized
      setTimeout(() => {
        if (items.filter(i => !organizedItems[i.correctColor]?.includes(i)).length === 1) {
          // Last item
          if (currentRound + 1 >= MAX_ROUNDS) {
            setGameFinished(true);
          } else {
            setCurrentRound(prev => prev + 1);
            setTimeout(() => startNewRound(), 1500);
          }
        }
      }, 500);
    } else {
      // ❌ Wrong
      setWrongCount(prev => prev + 1);
      Tts.speak(`Hmm, that doesn't match! Try again.`);
    }
  };

  const DraggableItem = ({ item }: { item: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          const { moveX, moveY } = gesture;

          // Check which box was hit
          Object.keys(boxLayouts.current).forEach((boxId) => {
            const layout = boxLayouts.current[boxId];
            if (
              moveX > layout.x &&
              moveX < layout.x + layout.width &&
              moveY > layout.y &&
              moveY < layout.y + layout.height
            ) {
              handleItemDrop(item, boxId);
            }
          });

          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      })
    ).current;

    return (
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout()]}>
        <View style={[styles.item, { borderColor: item.colorCode }]}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
      </Animated.View>
    );
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalItems = MAX_ROUNDS * 12; // Her round 12 item (3 renk x 4 item)
    const successRate = Math.round((score / totalItems) * 100);

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: 'colors-home-organizer',
        level: 3,
        score,
        max_score: totalItems,
        duration_seconds: duration,
        wrong_count: wrongCount,
        success_rate: successRate,
        completed: true,
      });
    } catch (err) {
      console.log('DB Error:', err);
    }

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        setScore(0);
        setWrongCount(0);
        setCurrentRound(0);
        setGameFinished(false);
        gameStartTimeRef.current = Date.now();
        startNewRound();
      },
    });
    gameNav.showCompletionMessage(score, totalItems, '🏠 Amazing Organizer!');
  };

  useEffect(() => {
    if (gameFinished) finalizeGame();
  }, [gameFinished]);

  const remainingItems = items.filter(
    (item) => !organizedItems[item.correctColor]?.some((o) => o.id === item.id && o.correctColor === item.correctColor)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Organizer 🏠</Text>
        <Text style={styles.progressText}>Round {currentRound + 1} / {MAX_ROUNDS}</Text>
      </View>

      <View style={styles.gameArea}>
        {/* Instruction */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Put items in matching color boxes!</Text>
        </View>

        {/* Color Boxes */}
        <View style={styles.boxesRow}>
          {COLOR_BOXES.map((box) => (
            <View
              key={box.id}
              onLayout={(e) => {
                e.target.measure((x, y, w, h, px, py) => {
                  boxLayouts.current[box.id] = { x: px, y: py, width: w, height: h };
                });
              }}
              style={[styles.colorBox, { backgroundColor: box.code }]}
            >
              <Text style={styles.boxEmoji}>{box.emoji}</Text>
              <Text style={styles.boxLabel}>{box.name}</Text>
              <Text style={styles.boxCount}>{organizedItems[box.id]?.length || 0}</Text>
            </View>
          ))}
        </View>

        {/* Items to Organize */}
        <View style={styles.itemsArea}>
          {remainingItems.map((item, index) => (
            <DraggableItem key={`${item.id}-${index}`} item={item} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  progressText: { fontSize: 16, fontWeight: '600', color: '#666' },
  gameArea: { flex: 1, padding: 20 },
  instructionBox: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  colorBox: {
    width: width * 0.28,
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  boxEmoji: { fontSize: 40, marginBottom: 5 },
  boxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
  },
  boxCount: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingTop: 20,
  },
  item: {
    width: 80,
    height: 90,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 4,
  },
  itemEmoji: { fontSize: 35, marginBottom: 5 },
  itemName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default HomeOrganizer;
