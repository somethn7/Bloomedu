// -umut: LEVEL 1 UYKU ZAMANI OYUNU - Göz Takibi (28.10.2025)
// Otizmli çocukların göz takibi ve dikkat becerilerini geliştiren oyun
// Uyuyan emoji yatağa gider, çocuk gözüyle takip eder
// Gece teması: Yıldızlı gökyüzü, sakin renkler, uyku müziği
// Otizmli çocuklar için özel renk paleti ve sakinleştirici atmosfer
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Text, 
  Animated, 
  Dimensions,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Tts from 'react-native-tts';

const { width, height } = Dimensions.get('window');

// -umut: Oyun sabitleri - Responsive boyutlandırma (31.10.2025)
const STAR_SIZE = Math.min(width, height) * 0.12; // Ekran boyutunun %12'si
const CLOUD_SIZE = Math.min(width, height) * 0.15; // Ekran boyutunun %15'i
const STAR_OFFSET = (CLOUD_SIZE - STAR_SIZE) / 2;
const PATH_THICKNESS = Math.min(width, height) * 0.025; // Ekran boyutunun %2.5'i
const MARGIN_H = width * 0.08; // Yatay margin: ekran genişliğinin %8'i
const MARGIN_V = height * 0.15; // Dikey margin: ekran yüksekliğinin %15'i
const TOTAL_ROUNDS = 8; // -umut: Toplam tur sayısı (her yön 2 kez)

// -umut: Gece teması için renk paleti - otizmli çocuklar için sakinleştirici (28.10.2025)
const COLORS = {
  background: '#1a1f3a', // Gece gökyüzü - koyu mavi
  starsBg: '#2C3E50', // Daha koyu mavi (yıldızlar için)
  path: 'rgba(255, 223, 186, 0.3)', // Yumuşak turuncu yol - gece ışığı
  startBed: '#FFE5B4', // Yumuşak krem - yatak
  endBed: '#D4E6F1', // Yumuşak açık mavi - hedef yatak
  text: '#ECF0F1', // Açık gri - okunabilir
  successText: '#F39C12', // Altın sarısı
  stars: '#FFD700', // Yıldız rengi - altın
};

// -umut: Yön konfigürasyonları (28.10.2025)
const DIRECTIONS_CONFIG = [
  {
    name: 'LEFT_TO_RIGHT',
    startCloudStyle: { top: height / 2 - CLOUD_SIZE / 2, left: MARGIN_H },
    endCloudStyle: { top: height / 2 - CLOUD_SIZE / 2, left: width - MARGIN_H - CLOUD_SIZE },
    pathStyle: { 
      top: height / 2 - PATH_THICKNESS / 2, 
      left: MARGIN_H + CLOUD_SIZE, 
      width: width - (MARGIN_H * 2) - CLOUD_SIZE, 
      height: PATH_THICKNESS,
      borderRadius: 10,
    },
    starStartPos: { x: MARGIN_H + STAR_OFFSET, y: height / 2 - STAR_SIZE / 2 },
    starEndPos: { x: width - MARGIN_H - CLOUD_SIZE + STAR_OFFSET, y: height / 2 - STAR_SIZE / 2 },
  },
  {
    name: 'TOP_TO_BOTTOM',
    startCloudStyle: { top: MARGIN_V, left: width / 2 - CLOUD_SIZE / 2 },
    endCloudStyle: { top: height - MARGIN_V - CLOUD_SIZE, left: width / 2 - CLOUD_SIZE / 2 },
    pathStyle: { 
      top: MARGIN_V + CLOUD_SIZE, 
      left: width / 2 - PATH_THICKNESS / 2, 
      width: PATH_THICKNESS, 
      height: height - (MARGIN_V * 2) - CLOUD_SIZE,
      borderRadius: 10,
    },
    starStartPos: { x: width / 2 - STAR_SIZE / 2, y: MARGIN_V + STAR_OFFSET },
    starEndPos: { x: width / 2 - STAR_SIZE / 2, y: height - MARGIN_V - CLOUD_SIZE + STAR_OFFSET },
  },
  {
    name: 'RIGHT_TO_LEFT',
    startCloudStyle: { top: height / 2 - CLOUD_SIZE / 2, left: width - MARGIN_H - CLOUD_SIZE },
    endCloudStyle: { top: height / 2 - CLOUD_SIZE / 2, left: MARGIN_H },
    pathStyle: { 
      top: height / 2 - PATH_THICKNESS / 2, 
      left: MARGIN_H + CLOUD_SIZE, 
      width: width - (MARGIN_H * 2) - CLOUD_SIZE, 
      height: PATH_THICKNESS,
      borderRadius: 10,
    },
    starStartPos: { x: width - MARGIN_H - CLOUD_SIZE + STAR_OFFSET, y: height / 2 - STAR_SIZE / 2 },
    starEndPos: { x: MARGIN_H + STAR_OFFSET, y: height / 2 - STAR_SIZE / 2 },
  },
  {
    name: 'BOTTOM_TO_TOP',
    startCloudStyle: { top: height - MARGIN_V - CLOUD_SIZE, left: width / 2 - CLOUD_SIZE / 2 },
    endCloudStyle: { top: MARGIN_V, left: width / 2 - CLOUD_SIZE / 2 },
    pathStyle: { 
      top: MARGIN_V + CLOUD_SIZE, 
      left: width / 2 - PATH_THICKNESS / 2, 
      width: PATH_THICKNESS, 
      height: height - (MARGIN_V * 2) - CLOUD_SIZE,
      borderRadius: 10,
    },
    starStartPos: { x: width / 2 - STAR_SIZE / 2, y: height - MARGIN_V - CLOUD_SIZE + STAR_OFFSET },
    starEndPos: { x: width / 2 - STAR_SIZE / 2, y: MARGIN_V + STAR_OFFSET },
  },
];

// -umut: Child parametresi için tip tanımı (28.10.2025)
interface RouteParams {
  child?: {
    id: number;
    level: number;
    name?: string;
  };
}

export default function StarTrackingLevel1() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { child } = (route.params || {}) as RouteParams;

  // -umut: Oyun state'leri (28.10.2025)
  const [round, setRound] = useState(0);
  const [sleepyEmoji, setSleepyEmoji] = useState('😴'); // Uyuyan karakter
  const [completedRounds, setCompletedRounds] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  
  // -umut: Arkaplan yıldızları için (28.10.2025)
  const [backgroundStars] = useState(() => 
    Array.from({ length: 20 }, () => ({
      left: Math.random() * width,
      top: Math.random() * height,
      size: Math.random() * 3 + 2,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  );
  
  const pan = useRef(new Animated.ValueXY()).current;

  // -umut: Oyun başlatma ve TTS yapılandırma (28.10.2025)
  useEffect(() => {
    const initGame = async () => {
      console.log('🌟 Star Tracking Game initializing...');
      await configureTts();
      setGameStartTime(Date.now());
      
      setTimeout(() => {
        speakInstruction('Watch the sleepy baby go to bed!');
      }, 500);
    };

    initGame();

    return () => {
      Tts.stop();
    };
  }, []);

  // -umut: Her tur için animasyon (28.10.2025)
  useEffect(() => {
    if (round >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }

    const config = DIRECTIONS_CONFIG[round % DIRECTIONS_CONFIG.length];
    
    pan.setValue(config.starStartPos);
    setSleepyEmoji('😴'); // Uyuyan bebek

    // -umut: Yön talimatı sesli söyle (28.10.2025)
    const speakTimer = setTimeout(() => {
      speakDirection(config.name);
    }, 300);

    // -umut: Uyuyan karakter animasyonu (28.10.2025)
    const animation = Animated.timing(pan, {
      toValue: config.starEndPos,
      duration: 3500, // Yavaş hareket - takip etmesi kolay
      useNativeDriver: false,
    });
    
    animation.start(() => {
      setSleepyEmoji('😴💤'); // Yatakta uyuyor
      setCompletedRounds(prev => prev + 1);
      
      const roundTimer = setTimeout(() => {
        setRound(prev => prev + 1);
      }, 1500);
    });

    return () => {
      clearTimeout(speakTimer);
      animation.stop();
    };
  }, [round]);

  // -umut: TTS yapılandırması (28.10.2025)
  const configureTts = async () => {
    console.log('🔧 Configuring TTS for Bedtime Journey...');
    try {
      const engines = await Tts.engines();
      console.log('📱 Available TTS engines:', engines);
      
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.3); // Otizmli çocuklar için oldukça yavaş
      await Tts.setDefaultPitch(1.0);
      
      Tts.addEventListener('tts-start', (event) => console.log('🔊 TTS started:', event));
      Tts.addEventListener('tts-finish', (event) => console.log('🔊 TTS finished:', event));
      
      console.log('✅ TTS configured - testing...');
      setTimeout(() => {
        Tts.speak('Ready');
      }, 300);
    } catch (error) {
      console.error('❌ TTS error:', error);
    }
  };

  // -umut: Yön talimatı sesli söyle (28.10.2025)
  const speakDirection = (direction: string) => {
    const instructions: any = {
      'LEFT_TO_RIGHT': 'Watch baby going to bed',
      'TOP_TO_BOTTOM': 'Watch baby going to bed',
      'RIGHT_TO_LEFT': 'Watch baby going to bed',
      'BOTTOM_TO_TOP': 'Watch baby going to bed',
    };
    
    const text = instructions[direction] || 'Watch baby';
    console.log('🔊 Speaking:', text);
    
    try {
      Tts.stop();
      setTimeout(() => {
        console.log('🔊 TTS.speak called with:', text);
        Tts.speak(text);
      }, 600);
    } catch (error) {
      console.error('❌ TTS speak error:', error);
    }
  };

  // -umut: Genel talimat sesli söyle (28.10.2025)
  const speakInstruction = (text: string) => {
    console.log('🔊 Speaking instruction:', text);
    try {
      setTimeout(() => {
        Tts.speak(text);
      }, 300);
    } catch (error) {
      console.error('❌ TTS error:', error);
    }
  };

  // -umut: Oyunu bitir ve database'e kaydet (28.10.2025)
  const finishGame = () => {
    const totalTime = Date.now() - gameStartTime;
    
    const gameResult = {
      childId: child?.id || 0,
      gameType: 'star_tracking',
      level: 1,
      totalQuestions: TOTAL_ROUNDS,
      correctAnswers: completedRounds, // Tamamlanan turlar
      successRate: Math.round((completedRounds / TOTAL_ROUNDS) * 100),
      totalTime: totalTime,
      completedAt: new Date().toISOString(),
    };
    
    sendToDatabase(gameResult);
    setGameFinished(true);
    Tts.stop();
    
    setTimeout(() => {
      speakInstruction('Great job! Baby is sleeping now!');
    }, 500);
  };

  // -umut: Oyun sonuçlarını backend'e kaydet (28.10.2025)
  const sendToDatabase = async (data: any) => {
    if (!child?.id) {
      console.warn('⚠️ Child ID not found, skipping score save.');
      return;
    }
    
    try {
      const response = await fetch('http://10.0.2.2:3000/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          game_type: 'star_tracking',
          level: 1,
          score: data.correctAnswers,
          max_score: data.totalQuestions,
          duration_seconds: Math.floor(data.totalTime / 1000),
          completed: true,
        }),
      });

      if (!response.ok) {
        console.error('❌ Backend error. Response status:', response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ Star tracking game session saved!');
      }
    } catch (error) {
      console.error('❌ Error sending data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // -umut: Oyunu yeniden başlat (28.10.2025)
  const restartGame = () => {
    setRound(0);
    setCompletedRounds(0);
    setGameFinished(false);
    setGameStartTime(Date.now());
    speakInstruction('Watch the sleepy baby go to bed!');
  };

  const currentConfig = DIRECTIONS_CONFIG[round % DIRECTIONS_CONFIG.length];

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* -umut: Başlık ve ilerleme (28.10.2025) */}
        <View style={styles.header}>
          <Text style={styles.title}>🌙 Bedtime Journey</Text>
          <Text style={styles.subtitle}>Help baby get to bed!</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Round {round + 1} / {TOTAL_ROUNDS}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((round + 1) / TOTAL_ROUNDS) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* -umut: Oyun alanı - Gece gökyüzü (28.10.2025) */}
        <View style={styles.gameArea}>
          {/* -umut: Arkaplan yıldızları - dekoratif (28.10.2025) */}
          {backgroundStars.map((star, index) => (
            <View
              key={index}
              style={[
                styles.backgroundStar,
                {
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}

          {/* Yol - yumuşak ışık */}
          <View style={[styles.path, currentConfig.pathStyle]} />
          
          {/* -umut: Başlangıç noktası (boş) (28.10.2025) */}
          <View style={[styles.bed, styles.startBed, currentConfig.startCloudStyle]}>
            <Text style={styles.bedEmoji}>🌟</Text>
            <Text style={styles.bedLabel}>Start</Text>
          </View>
          
          {/* -umut: Hedef yatak (28.10.2025) */}
          <View style={[styles.bed, styles.targetBed, currentConfig.endCloudStyle]}>
            <Text style={styles.bedEmoji}>🛏️</Text>
            <Text style={styles.bedLabel}>Bed</Text>
          </View>
          
          {/* -umut: Hareketli uyuyan karakter (28.10.2025) */}
          <Animated.View style={pan.getLayout()}>
            <View style={styles.character}>
              <Text style={styles.characterText}>{sleepyEmoji}</Text>
            </View>
          </Animated.View>
        </View>

        {/* -umut: Motivasyon mesajı (28.10.2025) */}
        <View style={styles.footer}>
          <Text style={styles.motivationText}>
            {completedRounds > 0 && `Amazing! ${completedRounds} bedtimes! 🌙`}
          </Text>
        </View>
      </SafeAreaView>

      {/* -umut: Oyun sonu modal (28.10.2025) */}
      <Modal
        visible={gameFinished}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌙 Sweet Dreams! 🌙</Text>
            <Text style={styles.modalSubtitle}>Baby is sleeping now!</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>😴</Text>
              <Text style={styles.resultNumber}>{completedRounds}</Text>
              <Text style={styles.resultLabel}>Bedtimes Complete</Text>
            </View>

            <Text style={styles.message}>
              Perfect! You have amazing focus! 👀💫
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={restartGame}
              >
                <Text style={styles.restartButtonText}>🔄 Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Education', { child })}
              >
                <Text style={styles.backButtonText}>← Back to Categories</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -umut: Gece teması - otizmli çocuklar için sakinleştirici (28.10.2025)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  // -umut: Arkaplan yıldızları (28.10.2025)
  backgroundStar: {
    position: 'absolute',
    backgroundColor: COLORS.stars,
    borderRadius: 10,
  },
  header: { 
    alignItems: 'center', 
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: width * 0.055, // Responsive font size
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: width * 0.04, // Responsive font size
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 15,
    opacity: 0.9,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.successText,
    borderRadius: 10,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  path: { 
    position: 'absolute', 
    backgroundColor: COLORS.path,
  },
  // -umut: Yatak stilleri (28.10.2025)
  bed: { 
    position: 'absolute', 
    width: CLOUD_SIZE, 
    height: CLOUD_SIZE, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  startBed: {
    backgroundColor: COLORS.startBed,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  targetBed: { 
    backgroundColor: COLORS.endBed,
    borderWidth: 2,
    borderColor: '#85C1E2',
  },
  bedEmoji: {
    fontSize: CLOUD_SIZE * 0.35, // Yatak büyüklüğüne göre responsive
    marginBottom: 2,
  },
  bedLabel: {
    fontSize: width * 0.028, // Responsive font size
    fontWeight: '700',
    color: '#2C3E50',
  },
  // -umut: Hareketli karakter (uyuyan bebek) (28.10.2025)
  character: { 
    width: STAR_SIZE, 
    height: STAR_SIZE, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 50,
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 6,
  },
  characterText: { 
    fontSize: STAR_SIZE * 0.6, // Karakter boyutuna göre responsive
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
    minHeight: 50,
  },
  motivationText: {
    fontSize: width * 0.042, // Responsive font size
    fontWeight: '600',
    color: COLORS.successText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 28,
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5DADE2',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 25,
  },
  resultCard: {
    backgroundColor: '#E8F4F8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    width: '70%',
    borderWidth: 2,
    borderColor: '#85C1E2',
  },
  resultEmoji: {
    fontSize: width * 0.12, // Responsive font size
    marginBottom: 10,
  },
  resultNumber: {
    fontSize: width * 0.1, // Responsive font size
    fontWeight: '700',
    color: '#5DADE2',
  },
  resultLabel: {
    fontSize: width * 0.035, // Responsive font size
    color: '#718096',
    marginTop: 5,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    backgroundColor: '#5DADE2',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#5DADE2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#51CF66',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#51CF66',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

