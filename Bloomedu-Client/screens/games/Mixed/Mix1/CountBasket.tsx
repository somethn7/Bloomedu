import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';

const { width, height } = Dimensions.get('window');

const ALL_FRUITS = [
  { type: 'apple', emoji: '🍎', target: 1, totalVisible: 6 },
  { type: 'banana', emoji: '🍌', target: 2, totalVisible: 6 },
  { type: 'orange', emoji: '🍊', target: 3, totalVisible: 6 },
  { type: 'grapes', emoji: '🍇', target: 4, totalVisible: 8 },
  { type: 'strawberry', emoji: '🍓', target: 5, totalVisible: 8 },
  { type: 'watermelon', emoji: '🍉', target: 6, totalVisible: 10 },
];

const CountBasket = ({ navigation }: any) => {
  const [step, setStep] = useState(0);
  const [basketFruits, setBasketFruits] = useState<number[]>([]); 
  const currentFruit = ALL_FRUITS[step];

  const basketLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const basketScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.speak(`Drag ${currentFruit.target} ${currentFruit.type}${currentFruit.target > 1 ? 's' : ''} to the basket.`);
  }, [step]);

  const handleConfirm = () => {
    if (basketFruits.length === currentFruit.target) {
      Tts.speak("Great! Correct.");
      if (step < ALL_FRUITS.length - 1) {
        setTimeout(() => {
          setStep(step + 1);
          setBasketFruits([]);
        }, 1000);
      } else {
        Tts.speak("You are a champion!");
        setTimeout(() => navigation.goBack(), 2000);
      }
    } else {
      Tts.speak(`Wait! I asked for ${currentFruit.target}. Try again!`);
      setBasketFruits([]); 
    }
  };

  const DraggableFruit = ({ index, emoji }: { index: number, emoji: string }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;
    const [isPlaced, setIsPlaced] = useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          Animated.spring(scale, { toValue: 1.2, useNativeDriver: false }).start();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          const { moveX, moveY } = gesture;
          const { x, y, width: bWidth, height: bHeight } = basketLayout.current;

          if (moveX > x && moveX < x + bWidth && moveY > y && moveY < y + bHeight) {
            setIsPlaced(true);
            setBasketFruits(prev => [...prev, index]);
            Tts.stop();
            Tts.speak(`${basketFruits.length + 1}`);
            
            Animated.sequence([
              Animated.spring(basketScale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
              Animated.spring(basketScale, { toValue: 1, useNativeDriver: true })
            ]).start();
          } else {
            Animated.parallel([
              Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
              Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false })
            ]).start();
          }
        },
      })
    ).current;

    if (isPlaced) return null;

    const animatedStyle = {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale: scale }
      ]
    };

    return (
      <Animated.View {...panResponder.panHandlers} style={[styles.fruitItem, animatedStyle]}>
        <Text style={styles.fruitEmojiText}>{emoji}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MANAV ARKA PLAN DEKORU */}
      <View style={styles.marketBackground}>
        <View style={styles.woodShelf} />
        <View style={styles.woodShelf} />
        <View style={styles.woodShelf} />
      </View>

      <View style={styles.header}>
        <Text style={styles.goalText}>Goal: {currentFruit.target} {currentFruit.emoji}</Text>
      </View>

      <View style={styles.gameArea}>
        {/* SEPET VE TEZGAH */}
        <View style={styles.basketSection}>
          <Animated.View 
            style={[styles.basketArea, { transform: [{ scale: basketScale }] }]}
            onLayout={(e) => { basketLayout.current = e.nativeEvent.layout; }}
          >
            <Text style={styles.basketEmoji}>🧺</Text>
            <View style={styles.basketContent}>
              {basketFruits.map((_, i) => <Text key={i} style={styles.smallFruitInBasket}>{currentFruit.emoji}</Text>)}
            </View>
          </Animated.View>
          <View style={styles.counterTable} />
        </View>

        {/* MEYVE HAVUZU (KASALARIN ÜSTÜ) */}
        <View style={styles.fruitPool}>
          {Array.from({ length: currentFruit.totalVisible }).map((_, index) => (
            <DraggableFruit key={`${step}-${index}`} index={index} emoji={currentFruit.emoji} />
          ))}
        </View>

        <TouchableOpacity onPress={handleConfirm} style={styles.okButton}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8D6E63' }, // Ahşap kahvesi ana zemin
  marketBackground: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-around', opacity: 0.3 },
  woodShelf: { height: 20, backgroundColor: '#5D4037', width: '100%' },
  header: { padding: 15, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', margin: 10, borderRadius: 20 },
  goalText: { fontSize: 26, fontWeight: 'bold', color: '#3E2723' },
  gameArea: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  basketSection: { alignItems: 'center', marginTop: 10 },
  basketArea: { height: 160, width: 200, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  basketEmoji: { fontSize: 130 },
  basketContent: { position: 'absolute', top: 40, flexDirection: 'row', flexWrap: 'wrap', width: 120, justifyContent: 'center' },
  smallFruitInBasket: { fontSize: 30, margin: 1 },
  counterTable: { width: width * 0.8, height: 40, backgroundColor: '#795548', borderRadius: 20, marginTop: -30, elevation: 5 },
  fruitPool: { 
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', 
    width: width * 0.9, backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 30, padding: 10, minHeight: 250 
  },
  fruitItem: { 
    width: 75, height: 75, justifyContent: 'center', alignItems: 'center', 
    margin: 8, backgroundColor: '#FFF', borderRadius: 15, elevation: 5 
  },
  fruitEmojiText: { fontSize: 48 },
  okButton: { backgroundColor: '#4CAF50', width: width * 0.6, paddingVertical: 15, borderRadius: 30, marginBottom: 25, elevation: 10 },
  okButtonText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
});

export default CountBasket;