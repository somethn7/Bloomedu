import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from "@react-navigation/native";
import { sendGameResult } from "../../../../config/api";

const { width } = Dimensions.get('window');

// Diğer oyundaki 6 temel renk havuzu
const ALL_COLORS = [
  { id: 'red', name: 'RED', code: '#FF6B6B', carEmoji: '🚗', garageEmoji: '🏠' },
  { id: 'blue', name: 'BLUE', code: '#4DABF7', carEmoji: '🚙', garageEmoji: '🏠' },
  { id: 'yellow', name: 'YELLOW', code: '#FFD43B', carEmoji: '🚕', garageEmoji: '🏠' },
  { id: 'green', name: 'GREEN', code: '#51CF66', carEmoji: '🚜', garageEmoji: '🏠' },
  { id: 'black', name: 'BLACK', code: '#495057', carEmoji: '🏴‍☠️', garageEmoji: '🏠' },
  { id: 'white', name: 'WHITE', code: '#FFFFFF', carEmoji: '🚐', garageEmoji: '🏠', border: true },
];

const TOTAL_STAGES = 10;

const ColorParkingGame = ({ navigation }: any) => {
  const route = useRoute();
  const { child }: any = route.params || {};

  // Oyun Durumu
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);
  const [targetColor, setTargetColor] = useState<any>(null);
  const [stageCount, setStageCount] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

  // Arka Plan Metrikleri (Çocuk görmüyor)
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const garageLayouts = useRef<any>({});

  useEffect(() => {
    initTts();
    setupStage();
  }, []);

  const initTts = async () => {
    try {
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.35);
    } catch (err) {}
  };

  // Her turda 6 renkten rastgele 3 tanesini seçer
  const setupStage = () => {
    const shuffled = [...ALL_COLORS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const target = selected[Math.floor(Math.random() * selected.length)];
    
    setCurrentOptions(selected);
    setTargetColor(target);

    setTimeout(() => {
      Tts.stop();
      Tts.speak(`Find the ${target.name} car and park it!`);
    }, 500);
  };

  const finalizeGame = async () => {
    if (!child?.id) return;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const successRate = Math.round((score / TOTAL_STAGES) * 100);

    // try {
    //   await sendGameResult({
    //     child_id: child.id,
    //     game_type: "color_parking",
    //     level: 1,
    //     score: score,
    //     max_score: TOTAL_STAGES,
    //     duration_seconds: duration,
    //     wrong_count: wrongCount,
    //     success_rate: successRate,
    //     completed: true,
    //   });
    // } catch (err) { console.log(err); }

    Tts.speak("Amazing! You are a great driver.");
    setTimeout(() => navigation.goBack(), 2000);
  };

  useEffect(() => {
    if (gameFinished) finalizeGame();
  }, [gameFinished]);

  const DraggableCar = ({ car }: { car: any }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gesture) => {
          const { moveX, moveY } = gesture;
          const target = garageLayouts.current[car.id];

          if (target && moveX > target.x && moveX < target.x + target.width && moveY > target.y && moveY < target.y + target.height) {
            if (car.id === targetColor.id) {
              setScore(s => s + 1);
              Tts.speak("Correct!");
              if (stageCount >= TOTAL_STAGES) setGameFinished(true);
              else {
                setStageCount(s => s + 1);
                setupStage();
              }
            } else {
              setWrongCount(w => w + 1);
              Tts.speak("Try again!");
            }
          }
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      })
    ).current;

    return (
      <View style={styles.carSlot}>
        <Animated.View {...panResponder.panHandlers} style={[pan.getLayout()]}>
          <Text style={styles.carText}>{car.carEmoji}</Text>
          <View style={[styles.carBase, { backgroundColor: car.code, borderWidth: car.border ? 1 : 0, borderColor: '#DDD' }]} />
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Color Parking 🚦</Text>
        <Text style={styles.progressText}>{stageCount} / {TOTAL_STAGES}</Text>
      </View>

      <View style={styles.gameArea}>
        {/* GARAJLAR */}
        <View style={styles.garageRow}>
          {currentOptions.map((item) => (
            <View 
              key={item.id} 
              onLayout={(e) => {
                e.target.measure((x, y, w, h, px, py) => {
                  garageLayouts.current[item.id] = { x: px, y: py, width: w, height: h };
                });
              }}
              style={[styles.garage, { borderColor: item.code }]}
            >
              <Text style={styles.garageEmoji}>{item.garageEmoji}</Text>
              <View style={[styles.garageSign, { backgroundColor: item.code, borderWidth: item.border ? 1 : 0, borderColor: '#DDD' }]} />
            </View>
          ))}
        </View>

        {/* TALİMAT */}
        {targetColor && (
          <View style={styles.instructionBox}>
             <Text style={styles.instructionText}>Park the <Text style={{color: targetColor.code === '#FFFFFF' ? '#888' : targetColor.code}}>{targetColor.name}</Text> car!</Text>
          </View>
        )}

        {/* YOL VE ARABALAR */}
        <View style={styles.road}>
          <View style={styles.roadLine} />
          <View style={styles.carRow}>
            {currentOptions.map((item) => (
              <DraggableCar key={item.id} car={item} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  progressText: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  gameArea: { flex: 1, justifyContent: 'space-between', paddingVertical: 30 },
  garageRow: { flexDirection: 'row', justifyContent: 'space-around' },
  garage: { width: width * 0.28, height: 110, borderWidth: 3, borderStyle: 'dashed', borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  garageEmoji: { fontSize: 50 },
  garageSign: { width: '70%', height: 10, borderRadius: 5, marginTop: 5 },
  instructionBox: { alignSelf: 'center', padding: 15, backgroundColor: '#FFF', borderRadius: 20, elevation: 1 },
  instructionText: { fontSize: 20, fontWeight: 'bold' },
  road: { width: '100%', height: 160, backgroundColor: '#37474F', justifyContent: 'center' },
  roadLine: { position: 'absolute', width: '100%', height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FFF', top: '50%' },
  carRow: { flexDirection: 'row', justifyContent: 'space-around' },
  carSlot: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  carText: { fontSize: 50, zIndex: 2 },
  carBase: { width: 45, height: 15, borderRadius: 4, marginTop: -10 },
});

export default ColorParkingGame;