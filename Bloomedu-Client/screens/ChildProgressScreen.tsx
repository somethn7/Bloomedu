// -umut: ÇOCUK GELİŞİM DETAY EKRANI - Öğretmen için (28.10.2025)
// Çocuğun oyun skorları, istatistikler ve gelişim grafiği
// Backend /progress/:childId endpoint'ini kullanır
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

interface GameStat {
  game_type: string;
  level: number;
  play_count: number;
  avg_score: number;
  best_score: number;
  total_duration: number;
}

interface RecentGame {
  game_type: string;
  level: number;
  score: number;
  max_score: number;
  completed: boolean;
  played_at: string;
}

const ChildProgressScreen = () => {
  const route = useRoute<any>();
  const { childId, childName, childSurname } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  // -umut: Backend'den çocuğun gelişim verilerini çek (28.10.2025)
  const fetchProgress = async () => {
    if (!childId) {
      Alert.alert('Error', 'Child ID not found.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:3000/progress/${childId}`);
      const data = await response.json();

      if (data.success) {
        setGameStats(data.gameStats || []);
        setRecentGames(data.recentGames || []);
        console.log('✅ Progress data loaded:', data);
      } else {
        Alert.alert('Error', 'Failed to load progress data.');
      }
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
      Alert.alert('Network Error', 'Could not fetch progress data.');
    } finally {
      setLoading(false);
    }
  };

  // -umut: Oyun tipini okunabilir hale getir (28.10.2025)
  const getGameTypeName = (gameType: string) => {
    if (gameType === 'colors_recognition') return '🎨 Color Match';
    if (gameType === 'color_objects') return '🎯 Color Objects';
    if (gameType === 'colors_matching') return '🌈 Color Matching';
    return gameType;
  };

  // -umut: Başarı oranı renk kodu (28.10.2025)
  const getSuccessColor = (avgScore: number, maxScore: number = 10) => {
    const percentage = (avgScore / maxScore) * 100;
    if (percentage >= 80) return '#51CF66'; // Yeşil
    if (percentage >= 60) return '#FFD43B'; // Sarı
    return '#FF8787'; // Kırmızı
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4DABF7" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* -umut: Başlık - çocuk bilgisi (28.10.2025) */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Progress Report</Text>
        <Text style={styles.studentName}>
          {childName} {childSurname}
        </Text>
      </View>

      {/* -umut: Özet İstatistikler (28.10.2025) */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>🎮</Text>
          <Text style={styles.summaryNumber}>{recentGames.length}</Text>
          <Text style={styles.summaryLabel}>Games Played</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>⭐</Text>
          <Text style={styles.summaryNumber}>
            {gameStats.length > 0
              ? Math.round(
                  (gameStats.reduce((sum, stat) => sum + Number(stat.avg_score), 0) /
                    gameStats.length /
                    10) *
                    100
                )
              : 0}%
          </Text>
          <Text style={styles.summaryLabel}>Avg Success</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>🏆</Text>
          <Text style={styles.summaryNumber}>
            {gameStats.length > 0
              ? Math.max(...gameStats.map(stat => Number(stat.best_score)))
              : 0}
          </Text>
          <Text style={styles.summaryLabel}>Best Score</Text>
        </View>
      </View>

      {/* -umut: Oyun İstatistikleri - Detaylı (28.10.2025) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Statistics</Text>

        {gameStats.length > 0 ? (
          gameStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statGameName}>
                  {getGameTypeName(stat.game_type)}
                </Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Level {stat.level}</Text>
                </View>
              </View>

              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Times Played</Text>
                  <Text style={styles.statValue}>{stat.play_count}×</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Avg Score</Text>
                  <Text 
                    style={[
                      styles.statValue,
                      { color: getSuccessColor(Number(stat.avg_score)) }
                    ]}
                  >
                    {Number(stat.avg_score).toFixed(1)}/10
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Score</Text>
                  <Text style={[styles.statValue, { color: '#51CF66' }]}>
                    {stat.best_score}/10
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Time</Text>
                  <Text style={styles.statValue}>
                    {Math.round(Number(stat.total_duration) / 60)}min
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No game statistics yet.</Text>
        )}
      </View>

      {/* -umut: Son Oyunlar (28.10.2025) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Games</Text>

        {recentGames.length > 0 ? (
          recentGames.map((game, index) => {
            const successRate = (game.score / game.max_score) * 100;
            return (
              <View key={index} style={styles.recentGameCard}>
                <View style={styles.recentGameHeader}>
                  <Text style={styles.recentGameName}>
                    {getGameTypeName(game.game_type)}
                  </Text>
                  <Text style={styles.recentGameDate}>
                    {new Date(game.played_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.recentGameScore}>
                  <Text style={styles.scoreText}>
                    Score: <Text style={{ fontWeight: '700' }}>{game.score}/{game.max_score}</Text>
                  </Text>
                  <View 
                    style={[
                      styles.successBadge,
                      { backgroundColor: getSuccessColor(game.score, game.max_score) }
                    ]}
                  >
                    <Text style={styles.successBadgeText}>{Math.round(successRate)}%</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No recent games yet.</Text>
        )}
      </View>

      {/* -umut: Refresh butonu (28.10.2025) */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchProgress}>
        <Text style={styles.refreshButtonText}>🔄 Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// -umut: Stiller (28.10.2025)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#718096',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4DABF7',
    textAlign: 'center',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statGameName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  levelBadge: {
    backgroundColor: '#E7F5FF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4DABF7',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  recentGameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4DABF7',
  },
  recentGameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentGameName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },
  recentGameDate: {
    fontSize: 12,
    color: '#718096',
  },
  recentGameScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: '#4A5568',
  },
  successBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  successBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noDataText: {
    fontSize: 15,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#4DABF7',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4DABF7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ChildProgressScreen;

