import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Tts from 'react-native-tts';
import { useRoute } from '@react-navigation/native';
import { createGameCompletionHandler } from '../../../../utils/gameNavigation';
import { sendGameResult } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

// EKRAN ORANLARI
const ZONE_HEIGHT = height * 0.24; 
const FOOTER_HEIGHT = height * 0.22; 

const MISSIONS = [
  {
    id: 1, vehicle: { id: 'v1', emoji: '✈️', name: 'Plane' }, targetPath: 'sky',
    story: "The plane needs to fly. Where is the sky?",
    startPos: { x: width * 0.38, y: height - FOOTER_HEIGHT + 10 } // y değeri 35'ten 10'a çekildi (yukarı taşındı)
  },
  {
    id: 2, vehicle: { id: 'v2', emoji: '🚢', name: 'Ship' }, targetPath: 'sea',
    story: "The ship is carrying toys. Where is the sea?",
    startPos: { x: width * 0.38, y: height - FOOTER_HEIGHT + 10 }
  },
  {
    id: 3, vehicle: { id: 'v3', emoji: '🚑', name: 'Ambulance' }, targetPath: 'road',
    story: "The ambulance is rushing. Which road is it?",
    startPos: { x: width * 0.38, y: height - FOOTER_HEIGHT + 10 }
  },
  {
    id: 4, vehicle: { id: 'v4', emoji: '🚁', name: 'Helicopter' }, targetPath: 'sky',
    story: "The helicopter is on a mission. Where does it fly?",
    startPos: { x: width * 0.38, y: height - FOOTER_HEIGHT + 10 }
  },
  {
    id: 5, vehicle: { id: 'v5', emoji: '🚤', name: 'Speedboat' }, targetPath: 'sea',
    story: "The speedboat is very fast! Where is the sea?",
    startPos: { x: width * 0.38, y: height - FOOTER_HEIGHT + 10 }
  }
];

const PATHS = [
  { id: 'sky', label: 'SKY', color: '#87CEEB', icon: '☁️' },
  { id: 'road', label: 'ROAD', color: '#95A5A6', icon: '🛣️' },
  { id: 'sea', label: 'SEA', color: '#3498DB', icon: '🌊' }
];

const RouteMasterLevel3 = ({ navigation }: any) => {
  const route = useRoute();
  const { child, gameSequence, currentGameIndex, categoryTitle }: any = route.params || {};

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const currentMission = MISSIONS[currentRound];

  const startNewRound = useCallback((round: number) => {
    setFeedback(null);
    setIsBusy(false);
    feedbackAnim.setValue(0);
    Tts.speak(MISSIONS[round].story);
  }, [feedbackAnim]);

useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.4);
        startNewRound(0);
      } catch (error) {
        console.log("TTS Error:", error);
      }
    };

    initTts();

    return () => {
      Tts.stop();
    };
  }, [startNewRound]);
  const handleDrop = useCallback((moveY: number) => {
    if (isBusy) return;

    let droppedPath = '';
    if (moveY < ZONE_HEIGHT) droppedPath = 'sky';
    else if (moveY < ZONE_HEIGHT * 2) droppedPath = 'road';
    else if (moveY < ZONE_HEIGHT * 3) droppedPath = 'sea';

    const isCorrect = droppedPath === currentMission.targetPath;

    setIsBusy(true);
    setFeedback(isCorrect ? 'success' : 'error');
    Animated.spring(feedbackAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    if (isCorrect) {
      setScore(s => s + 1);
      Tts.speak("Great job!");
      setTimeout(() => {
        if (currentRound < MISSIONS.length - 1) {
          setCurrentRound(prev => prev + 1);
          startNewRound(currentRound + 1);
        } else {
          finalizeGame();
        }
      }, 2500);
    } else {
      setWrongCount(w => w + 1);
      Tts.speak("Try again!");
      setTimeout(() => {
        setFeedback(null);
        setIsBusy(false);
        feedbackAnim.setValue(0);
      }, 1500);
    }
  }, [currentRound, isBusy, startNewRound]);

  const finalizeGame = async () => {
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const totalAttempts = score + wrongCount;
    const successRate = totalAttempts > 0 ? Math.round(((score + 1) / (totalAttempts + 1)) * 100) : 0;
    
    try {
      await sendGameResult({
        child_id: child?.id,
        game_type: 'vehicles_route_logic',
        level: 3,
        score: score + 1,
        max_score: MISSIONS.length,
        duration_seconds: duration,
        wrong_count: wrongCount,
        completed: true,
        success_rate: successRate,
        details: {
          rounds_completed: currentRound + 1,
          total_attempts: totalAttempts + 1,
          wrong_count: wrongCount,
          success_rate: successRate,
        },
      } as any);
    } catch (e) { console.log(e); }
    createGameCompletionHandler({ navigation, child, gameSequence, currentGameIndex, categoryTitle })
      .showCompletionMessage(score + 1, MISSIONS.length, 'Route Master! ✈️🛣️🌊');
  };

  const DraggableVehicle = ({ vehicle, onDrop, disabled, startPos }: any) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        onDrop(gesture.moveY);
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    }), [disabled, onDrop]);

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          { transform: pan.getTranslateTransform() },
          styles.vehicleCard,
          { position: 'absolute', left: startPos.x, top: startPos.y, zIndex: 1000 }
        ]}
      >
        <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pathsContainer}>
        {PATHS.map(path => (
          <View key={path.id} style={[styles.pathZone, { backgroundColor: path.color }]}>
            <Text style={styles.pathLabel}>{path.icon} {path.label}</Text>
          </View>
        ))}
      </View>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <Text style={styles.roundText}>Round {currentRound + 1} / {MISSIONS.length}</Text>
          <View style={styles.storyBox}>
            <Text style={styles.storyText}>{currentMission.story}</Text>
          </View>
        </View>

        {feedback && (
          <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackAnim }] }]}>
            <Text style={styles.feedbackEmoji}>{feedback === 'success' ? '✅' : '❌'}</Text>
          </Animated.View>
        )}

        <View style={styles.paletteBackground} />

        <DraggableVehicle 
          key={currentMission.id}
          vehicle={currentMission.vehicle} 
          onDrop={handleDrop} 
          disabled={isBusy} 
          startPos={currentMission.startPos}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  pathsContainer: { height: ZONE_HEIGHT * 3 },
  pathZone: { height: ZONE_HEIGHT, width: '100%', justifyContent: 'center', paddingLeft: 20 },
  pathLabel: { fontSize: 28, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  overlay: { ...StyleSheet.absoluteFillObject },
  header: { alignItems: 'center', marginTop: 5, paddingHorizontal: 30 },
  roundText: { fontSize: 14, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 3 },
  storyBox: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 10, borderRadius: 15, marginTop: 5, elevation: 3, width: '100%', borderWidth: 1, borderColor: '#EEE' },
  storyText: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'center' },
  feedbackOverlay: { position: 'absolute', top: height * 0.35, alignSelf: 'center', zIndex: 2000 },
  feedbackEmoji: { fontSize: 100 },
  paletteBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: FOOTER_HEIGHT,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 15,
    zIndex: 1,
  },
  vehicleCard: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  vehicleEmoji: { fontSize: 55 },
});

export default RouteMasterLevel3;