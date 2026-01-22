import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder, TouchableOpacity } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from "@react-navigation/native";
import { sendGameResult } from "../../../../config/api";
import { createGameCompletionHandler } from "../../../../utils/gameNavigation";

const { width, height } = Dimensions.get('window');

const CLOTHING_LAYERS = [
  { type: 'cap', label: 'Cap', emojis: { small: '🧢', medium: '🧢', large: '🧢' } },
  { type: 'shirt', label: 'Shirt', emojis: { small: '👕', medium: '👕', large: '👕' } },
  { type: 'shorts', label: 'Shorts', emojis: { small: '🩳', medium: '🩳', large: '🩳' } },
  { type: 'shoes', label: 'Shoes', emojis: { small: '👟', medium: '👟', large: '👟' } },
];

const CHARACTERS = [
  { id: 'small', label: 'Baby', emoji: '👶', scale: 0.75, color: '#81C784' },
  { id: 'medium', label: 'Mom', emoji: '👩', scale: 1.0, color: '#FFB74D' },
  { id: 'large', label: 'Dad', emoji: '👨', scale: 1.4, color: '#64B5F6' },
];

const SizeFullDressingGame = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [dressedItems, setDressedItems] = useState<string[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  
  // Metrikler
  const scoreRef = useRef(0);
  const wrongCountRef = useRef(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Animasyonlar
  const successAnim = useRef(new Animated.Value(0)).current;
  const comboLayouts = useRef<any>({}); 
  const currentChar = CHARACTERS[activeCharIndex];
  const currentLayer = CLOTHING_LAYERS[activeLayerIndex];

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.35);
    announceTask();
  }, [activeCharIndex, activeLayerIndex]);

  const announceTask = () => {
    Tts.stop();
    Tts.speak(`Find the ${currentChar.id} ${currentLayer.label} for ${currentChar.label}.`);
  };

  const triggerSuccessFeedback = () => {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.spring(successAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMatch = (sizeId: string) => {
    if (sizeId === currentChar.id) {
      scoreRef.current += 1;
      Tts.stop();
      Tts.speak(`Perfect fit!`);
      triggerSuccessFeedback();
      
      setDressedItems(prev => [...prev, `${currentChar.id}_${currentLayer.type}`]);

      if (activeLayerIndex < CLOTHING_LAYERS.length - 1) {
        setTimeout(() => setActiveLayerIndex(prev => prev + 1), 1200);
      } else if (activeCharIndex < CHARACTERS.length - 1) {
        setTimeout(() => {
          setActiveCharIndex(prev => prev + 1);
          setActiveLayerIndex(0);
        }, 1500);
      } else {
        setTimeout(() => {
          setGameFinished(true);
        }, 1500);
      }
    } else {
      wrongCountRef.current += 1;
      Tts.stop();
      Tts.speak(`That is not the right size.`);
    }
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    
    Tts.stop();
    Tts.speak("Great shopping! Everyone is ready.");

    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = scoreRef.current + wrongCountRef.current;
    const successRate = totalAttempts > 0 ? Math.round((scoreRef.current / totalAttempts) * 100) : 0;
    const maxScore = CHARACTERS.length * CLOTHING_LAYERS.length;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: "full_dressing_size",
        level: 1,
        score: scoreRef.current,
        max_score: maxScore,
        duration_seconds: duration,
        wrong_count: wrongCountRef.current,
        success_rate: successRate,
        completed: true,
        details: { totalAttempts, successRate }
      });
    } catch (err) { console.log(err); }

    const gameNav = createGameCompletionHandler({
      navigation, child, gameSequence, currentGameIndex, categoryTitle,
      resetGame: () => {
        scoreRef.current = 0; wrongCountRef.current = 0;
        setActiveCharIndex(0); setActiveLayerIndex(0); setDressedItems([]);
        setGameFinished(false); gameStartTimeRef.current = Date.now();
      }
    });

    setTimeout(() => {
      gameNav.showCompletionMessage(scoreRef.current, maxScore, "🎉 Fashion Star!");
    }, 500);
  };

  useEffect(() => {
    if (gameFinished) finalizeGame();
  }, [gameFinished]);

  const DraggableItem = ({ sizeId }: { sizeId: string }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const isMatched = dressedItems.includes(`${sizeId}_${currentLayer.type}`);
    const scale = sizeId === 'small' ? 0.7 : sizeId === 'medium' ? 1.0 : 1.3;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isMatched,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          const { moveX, moveY } = gesture;
          const target = comboLayouts.current[currentChar.id];

          if (target && moveX > target.x && moveX < target.x + target.width && moveY > target.y && moveY < target.y + target.height) {
            handleMatch(sizeId);
          }
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      })
    ).current;

    return (
      <View style={styles.shelfSlot}>
        <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), { transform: [{ scale }], zIndex: 10 }]}>
          <Text style={styles.itemEmoji}>
            {currentLayer.emojis[sizeId as keyof typeof currentLayer.emojis]}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.storeBackground}>
        <View style={styles.topWall} />
        <View style={styles.woodFloor} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Kid's Boutique 🛍️</Text>
        <Text style={styles.subtitle}>{currentChar.label}'s Combo List</Text>
      </View>

      <View style={styles.gameArea}>
        {/* Success Message */}
        <Animated.View style={[
          styles.successMessage, 
          { 
            opacity: successAnim,
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
          }
        ]}>
          <Text style={styles.successText}>🎉 Perfect Fit! 🎉</Text>
        </Animated.View>

        <View style={styles.customerRow}>
          {CHARACTERS.map((char) => (
            <View key={char.id} style={styles.characterSection}>
              <View style={[styles.characterCard, { transform: [{ scale: char.scale }] }]}>
                <Text style={styles.charEmoji}>{char.emoji}</Text>
              </View>

              <View 
                style={[styles.comboContainer, char.id === currentChar.id && styles.activeCombo]}
                onLayout={(e) => {
                    e.target.measure((x, y, w, h, px, py) => {
                        comboLayouts.current[char.id] = { x: px, y: py, width: w, height: h };
                    });
                }}
              >
                <View style={styles.comboVerticalStack}>
                   <View style={styles.miniItemWrapper}><Text style={[styles.miniCloth, !dressedItems.includes(`${char.id}_cap`) && styles.emptySlot]}>🧢</Text></View>
                   <View style={styles.miniItemWrapper}><Text style={[styles.miniCloth, !dressedItems.includes(`${char.id}_shirt`) && styles.emptySlot]}>👕</Text></View>
                   <View style={styles.miniItemWrapper}><Text style={[styles.miniCloth, !dressedItems.includes(`${char.id}_shorts`) && styles.emptySlot]}>🩳</Text></View>
                   <View style={styles.miniItemWrapper}><Text style={[styles.miniCloth, !dressedItems.includes(`${char.id}_shoes`) && styles.emptySlot]}>👟</Text></View>
                </View>
              </View>
              <Text style={styles.nameLabel}>{char.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.shelfArea}>
          <View style={styles.shelfHeader}>
            <Text style={styles.shelfTitle}>{currentLayer.label.toUpperCase()} SHELF</Text>
          </View>
          <View style={styles.shelfItems}>
            {['medium', 'small', 'large'].map((size) => (
              <DraggableItem key={size} sizeId={size} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9C4' },
  storeBackground: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  topWall: { height: '55%', backgroundColor: '#FFF9C4' },
  woodFloor: { height: '45%', backgroundColor: '#D7CCC8' },
  header: { padding: 15, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 3, borderColor: '#FFD54F', elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#EF6C00' },
  subtitle: { fontSize: 14, color: '#FFA000', marginTop: 2 },
  gameArea: { flex: 1, justifyContent: 'space-between' },
  customerRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', marginTop: 10 },
  characterSection: { alignItems: 'center', width: width * 0.32 },
  characterCard: { width: 80, height: 60, justifyContent: 'center', alignItems: 'center' },
  charEmoji: { fontSize: 50 },
  comboContainer: { width: 80, height: 200, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, marginTop: 5, borderWidth: 2, borderColor: '#BDBDBD', paddingVertical: 5, elevation: 4 },
  activeCombo: { borderColor: '#FF9800', borderStyle: 'dashed', backgroundColor: '#FFFDE7' },
  comboVerticalStack: { flex: 1, justifyContent: 'space-between' },
  miniItemWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  miniCloth: { fontSize: 32 },
  emptySlot: { opacity: 0.1 }, 
  nameLabel: { marginTop: 6, fontWeight: 'bold', color: '#5D4037', fontSize: 13 },
  shelfArea: { margin: 15, height: 140, marginBottom: 30 },
  shelfHeader: { backgroundColor: '#795548', padding: 5, borderTopLeftRadius: 15, borderTopRightRadius: 15, alignItems: 'center' },
  shelfTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  shelfItems: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFF', flex: 1, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, borderWidth: 2, borderColor: '#795548' },
  shelfSlot: { flex: 1, alignItems: 'center' },
  itemEmoji: { fontSize: 55 },
  successMessage: { 
    position: 'absolute', 
    top: height / 2 - 50, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(76, 175, 80, 0.9)', 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 30, 
    zIndex: 999,
    elevation: 5
  },
  successText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
});

export default SizeFullDressingGame;