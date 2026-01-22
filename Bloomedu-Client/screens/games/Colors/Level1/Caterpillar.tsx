import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from "@react-navigation/native";
import { sendGameResult } from "../../../../config/api";
import { createGameCompletionHandler } from "../../../../utils/gameNavigation";

const { width, height } = Dimensions.get('window');

const ALL_COLORS = [
  { id: 'red', name: 'RED', code: '#FF0000' },
  { id: 'blue', name: 'BLUE', code: '#0000FF' },
  { id: 'yellow', name: 'YELLOW', code: '#FFD700' },
  { id: 'green', name: 'GREEN', code: '#008000' },
  { id: 'black', name: 'BLACK', code: '#000000ff' }
];

const CaterpillarColoringGame = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [caterpillarParts, setCaterpillarParts] = useState<any[]>([]);
  
  // Metrikler
  const scoreRef = useRef(0);
  const wrongCountRef = useRef(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Animasyon Değerleri
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.35);
    setupCaterpillar();
    return () => {
      Tts.stop();
    };
  }, []);

  const setupCaterpillar = () => {
    const parts = Array.from({ length: 5 }).map((_, index) => {
      const randomIndex = Math.floor(Math.random() * ALL_COLORS.length);
      const randomColor = ALL_COLORS[randomIndex];
      
      return {
        id: index,
        targetColor: randomColor,
        currentColor: '#FFFFFF',
        isPainted: false,
        scale: new Animated.Value(1)
      };
    });
    setCaterpillarParts(parts);
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

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalCorrect = scoreRef.current;
    const totalWrong = wrongCountRef.current;

    // Arkadaşının Başarı Oranı Mantığı: (Doğru / Toplam Deneme)
    const totalAttempts = totalCorrect + totalWrong;
    const successRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    try {
      await sendGameResult({
        child_id: child.id,
        game_type: "caterpillar_coloring",
        level: 1,
        score: totalCorrect,
        max_score: 5,
        duration_seconds: duration,
        wrong_count: totalWrong,
        success_rate: successRate,
        completed: true,
        details: {
            totalAttempts,
            successRate
        }
      });
    } catch (err) {
      console.log("DB Error:", err);
    }

    Tts.stop();
    Tts.speak("Excellent! The caterpillar is so colorful now.");

    const gameNav = createGameCompletionHandler({
      navigation,
      child,
      gameSequence,
      currentGameIndex,
      categoryTitle,
      resetGame: () => {
        scoreRef.current = 0;
        wrongCountRef.current = 0;
        gameStartTimeRef.current = Date.now();
        setSelectedColor(null);
        setupCaterpillar();
      }
    });
    gameNav.showCompletionMessage(totalCorrect, 5, "🎉 You are a Great Artist!");
  };

  const handlePartClick = (partId: number) => {
    if (!selectedColor) {
      Tts.stop();
      Tts.speak("Pick a color first!");
      return;
    }

    const partIndex = caterpillarParts.findIndex(p => p.id === partId);
    const part = caterpillarParts[partIndex];

    if (part.isPainted) return;

    if (selectedColor.id === part.targetColor.id) {
      scoreRef.current += 1;
      Tts.stop();
      Tts.speak("Perfect match!");
      
      // Görsel Feedback Tetikle
      triggerSuccessFeedback();

      const newParts = [...caterpillarParts];
      newParts[partIndex].currentColor = selectedColor.code;
      newParts[partIndex].isPainted = true;
      setCaterpillarParts(newParts);

      Animated.sequence([
        Animated.spring(newParts[partIndex].scale, { toValue: 1.2, useNativeDriver: true }),
        Animated.spring(newParts[partIndex].scale, { toValue: 1, useNativeDriver: true }),
      ]).start();

      if (newParts.every(p => p.isPainted)) {
        setTimeout(finalizeGame, 1200);
      }
    } else {
      wrongCountRef.current += 1;
      Tts.stop();
      Tts.speak(`No, that is not ${part.targetColor.name}. Try again!`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Caterpillar Paint 🐛</Text>
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
          <Text style={styles.successText}>🎉 Perfect Match! 🎉</Text>
        </Animated.View>

        <View style={styles.caterpillarBody}>
          <View style={styles.head}>
             <Text style={styles.headEmoji}>😊</Text>
             <View style={styles.antennaLeft} />
             <View style={styles.antennaRight} />
          </View>
          
          {caterpillarParts.map((part) => (
            <TouchableOpacity 
              key={part.id} 
              onPress={() => handlePartClick(part.id)}
              activeOpacity={0.8}
            >
              <Animated.View style={[
                styles.segment, 
                { backgroundColor: part.currentColor, transform: [{ scale: part.scale }] }
              ]}>
                {!part.isPainted && (
                  <View style={[styles.hintDot, { backgroundColor: part.targetColor.code }]} />
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.palette}>
          <Text style={styles.paletteLabel}>Pick a Color:</Text>
          <View style={styles.colorsRow}>
            {ALL_COLORS.map((color) => (
              <TouchableOpacity
                key={color.id}
                onPress={() => {
                  setSelectedColor(color);
                  Tts.stop();
                  Tts.speak(color.name);
                }}
                style={[
                  styles.swatch, 
                  { backgroundColor: color.code },
                  selectedColor?.id === color.id && styles.activeSwatch
                ]}
              >
                {selectedColor?.id === color.id && <Text style={styles.check}>⭐</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#FFF', elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#388E3C' },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  caterpillarBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 50 },
  head: { 
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#81C784', 
    justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 
  },
  headEmoji: { fontSize: 35 },
  antennaLeft: { position: 'absolute', top: -15, left: 15, width: 4, height: 20, backgroundColor: '#4CAF50', transform: [{ rotate: '-20deg' }] },
  antennaRight: { position: 'absolute', top: -15, right: 15, width: 4, height: 20, backgroundColor: '#4CAF50', transform: [{ rotate: '20deg' }] },
  segment: { 
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#A5D6A7', 
    marginLeft: -15, justifyContent: 'center', alignItems: 'center', elevation: 3 
  },
  hintDot: { width: 15, height: 15, borderRadius: 7.5, opacity: 0.6 },
  
  // Success Message Style
  successMessage: { 
    position: 'absolute', 
    top: 50, 
    backgroundColor: 'rgba(76, 175, 80, 0.9)', 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 30, 
    zIndex: 100,
    elevation: 5
  },
  successText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  palette: { width: width * 0.9, backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 10 },
  paletteLabel: { textAlign: 'center', fontWeight: 'bold', marginBottom: 15, color: '#666' },
  colorsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  swatch: { 
    width: 50, height: 50, borderRadius: 25, margin: 8, elevation: 3, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' 
  },
  activeSwatch: { borderWidth: 4, borderColor: '#4CAF50' },
  check: { fontSize: 20 }
});

export default CaterpillarColoringGame;