import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types'; 

const screenWidth = Dimensions.get('window').width;

const droppableAreas = [
  { color: 'red', x: screenWidth * 0.1 },
  { color: 'green', x: screenWidth * 0.4 },
  { color: 'blue', x: screenWidth * 0.7 },
];

const items = [
  { key: 'redcar', image: require('./assets/redcar.png'), color: 'red' },
  { key: 'greenapple', image: require('./assets/greenapple.png'), color: 'green' },
  { key: 'blueballoon', image: require('./assets/blueballoon.png'), color: 'blue' },
];

// 💡 Navigation tipi burada tanımlandı
// -umut: Child parametresi ve skor kaydetme sistemi eklendi (28.10.2025)
const ColorsMatchingGameScreen = ({ route }: any) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ColorsMatchingGame'>>();
  const { child } = route.params || {}; // -umut: Child bilgisi route'tan alınıyor
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStartTime] = useState(Date.now()); // -umut: Oyun süresini hesaplamak için başlangıç zamanı
  const positions = useRef(items.map(() => new Animated.ValueXY())).current;

  // -umut: Oyun sonuçlarını backend'e kaydeden fonksiyon (28.10.2025)
  // Çocuğun oyun skorunu, süresini ve tamamlanma durumunu database'e kaydeder
  const saveGameSession = async (finalScore: number) => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }

    const durationSeconds = Math.floor((Date.now() - gameStartTime) / 1000);

    try {
      const response = await fetch('https://bloomedu-production.up.railway.app/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          game_type: 'colors_matching',
          level: child.level || 1,
          score: finalScore,
          max_score: items.length,
          duration_seconds: durationSeconds,
          completed: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Colors matching game session saved!');
      } else {
        console.warn('⚠️ Failed to save game session:', data.message);
      }
    } catch (err) {
      console.error('❌ Error saving game session:', err);
    }
  };

  const createPanResponder = (index: number, itemColor: string) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: positions[index].x, dy: positions[index].y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        const dropX = gesture.moveX;
        const matchedArea = droppableAreas.find(
          area => dropX > area.x && dropX < area.x + 100
        );

        if (matchedArea?.color === itemColor) {
          setFeedback('✅ True!');
          setCorrectCount(prev => {
            const newCount = prev + 1;
            if (newCount === items.length) {
              // -umut: Oyun tamamlandığında skoru kaydet (28.10.2025)
              setTimeout(() => {
                setGameCompleted(true);
                saveGameSession(newCount);
              }, 1000);
            }
            return newCount;
          });
        } else {
          setFeedback('❌ Wrong!');
        }

        Animated.spring(positions[index], {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();

        setTimeout(() => setFeedback(null), 1500);
      },
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match the Colors</Text>

      <View style={styles.dragArea}>
        {items.map((item, index) => {
          const pan = positions[index];
          const responder = createPanResponder(index, item.color);

          return (
            <Animated.View
              key={item.key}
              style={[styles.iconContainer, pan.getLayout()]}
              {...responder.panHandlers}
            >
              <Image source={item.image} style={styles.icon} />
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.targetArea}>
        {droppableAreas.map(area => (
          <View
            key={area.color}
            style={[styles.colorCircle, { backgroundColor: area.color, left: area.x }]}
          />
        ))}
      </View>

      {feedback && (
        <View style={styles.feedbackFullScreen}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {gameCompleted && (
        <View style={styles.congratulationsBox}>
          <Text style={styles.congratulationsText}>🎉 Congratulations!</Text>
          {/* -umut: Child parametresi ile Education'a geri dön (28.10.2025) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Education', { child })}
            style={styles.congratulationsButton}
          >
            <Text style={styles.congratulationsButtonText}>Back to Categories</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#f0f8ff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  dragArea: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  iconContainer: { position: 'relative' },
  icon: { width: 120, height: 120, borderRadius: 60 },
  targetArea: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
    bottom: 0,
  },
  feedbackFullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  congratulationsBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240,255,240,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  congratulationsText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#4BB543',
  },
  congratulationsButton: {
    backgroundColor: '#4BB543',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  congratulationsButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ColorsMatchingGameScreen;