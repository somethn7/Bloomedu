import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';

const { width, height } = Dimensions.get('window');

const SIZES = [
  { id: 'small', label: 'Baby Bear', emoji: '🧸', scale: 0.6, bedEmoji: '🛏️', bedScale: 0.7 },
  { id: 'medium', label: 'Mama Bear', emoji: '🧸', scale: 0.9, bedEmoji: '🛏️', bedScale: 1.0 },
  { id: 'large', label: 'Papa Bear', emoji: '🧸', scale: 1.3, bedEmoji: '🛏️', bedScale: 1.4 },
];

const SizeMatchingGame = ({ navigation }: any) => {
  const [activeGoal, setActiveGoal] = useState(0); 
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const bedLayouts = useRef<any>({});
  const currentGoal = SIZES[activeGoal];

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    announceGoal(0);
  }, []);

  const announceGoal = (index: number) => {
    Tts.stop();
    Tts.speak(`Put the ${SIZES[index].id} bear in its bed.`);
  };

  const handleMatch = (sizeId: string) => {
    if (sizeId === currentGoal.id) {
      Tts.stop();
      Tts.speak(`Well done! The ${sizeId} bear is sleeping.`);
      setMatchedIds(prev => [...prev, sizeId]);

      if (activeGoal < SIZES.length - 1) {
        setTimeout(() => {
          setActiveGoal(prev => prev + 1);
          announceGoal(activeGoal + 1);
        }, 1200);
      } else {
        setTimeout(() => {
          Tts.speak("Great job! All bears are in their beds.");
          navigation.goBack();
        }, 2000);
      }
    } else {
      Tts.stop();
      Tts.speak(`No, that is not the ${currentGoal.id} bed. Try again!`);
    }
  };

  const DraggableBear = ({ size }: { size: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isMatched = matchedIds.includes(size.id);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isMatched,
        onStartShouldSetPanResponderCapture: () => !isMatched,
        onMoveShouldSetPanResponder: () => !isMatched,
        onPanResponderGrant: () => {
          Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: false }).start();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          const { moveX, moveY } = gesture;
          const targetBed = bedLayouts.current[size.id];

          if (targetBed && 
              moveX > targetBed.x && moveX < targetBed.x + targetBed.width &&
              moveY > targetBed.y && moveY < targetBed.y + targetBed.height) {
            handleMatch(size.id);
          } 
          
          Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }),
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false })
          ]).start();
        },
      })
    ).current;

    const animatedStyle = {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale: Animated.multiply(size.scale, scaleAnim) }
      ]
    };

    return (
      <View style={styles.flexItem}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.draggableBear, animatedStyle, isMatched && { opacity: 0 }]}
        >
          <Text style={styles.bearEmoji}>{size.emoji}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Size Matching 🧸</Text>
        <Text style={styles.subtitle}>Goal: {currentGoal.id.toUpperCase()} BEAR</Text>
      </View>

      <View style={styles.gameArea}>
        {/* RESPONSIVE YATAKLAR */}
        <View style={styles.row}>
          {SIZES.map((size) => (
            <View key={size.id} style={styles.flexItem}>
              <View 
                onLayout={(event) => {
                  event.target.measure((x, y, w, h, pageX, pageY) => {
                    bedLayouts.current[size.id] = { x: pageX, y: pageY, width: w, height: h };
                  });
                }}
                style={[
                  styles.bedContainer, 
                  { transform: [{ scale: size.bedScale }] },
                  matchedIds.includes(size.id) && styles.matchedBed
                ]}
              >
                <Text style={styles.bedEmoji}>{size.bedEmoji}</Text>
                {matchedIds.includes(size.id) && (
                  <View style={styles.bearInBedOverlay}>
                    <Text style={styles.smallBearEmoji}>{size.emoji}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* RESPONSIVE AYILAR */}
        <View style={styles.row}>
          {SIZES.map((size) => (
            <DraggableBear key={size.id} size={size} />
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.quitButton}>
        <Text style={styles.quitButtonText}>Quit Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#FFF', elevation: 4 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1565C0' },
  subtitle: { fontSize: 18, color: '#1E88E5', marginTop: 5, fontWeight: '600' },
  gameArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    width: '100%', 
    height: height * 0.25 
  },
  flexItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  bedContainer: { 
    width: width * 0.22, // Ekranın %22'si kadar genişlik
    aspectRatio: 1, // Kare formunu korur
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 3, 
    borderColor: '#BBDEFB', 
    borderStyle: 'dashed', 
    borderRadius: 20, 
    backgroundColor: '#FFF' 
  },
  matchedBed: { borderColor: '#4CAF50', borderStyle: 'solid', backgroundColor: '#E8F5E9' },
  bedEmoji: { fontSize: 50 },
  bearInBedOverlay: { position: 'absolute', top: '15%' },
  smallBearEmoji: { fontSize: 30 },
  draggableBear: { padding: 10, alignItems: 'center', zIndex: 100, elevation: 10 },
  bearEmoji: { fontSize: 55 },
  quitButton: { 
    marginBottom: 40, 
    alignSelf: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    backgroundColor: '#EF5350', 
    borderRadius: 30 
  },
  quitButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default SizeMatchingGame;