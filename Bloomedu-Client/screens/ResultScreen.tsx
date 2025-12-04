import React, { useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_ENDPOINTS } from '../config/api';

const ResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { answers, child } = route.params;

  // 🚫 Default Header'ı kaldırıyoruz
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const score = answers.reduce(
    (total: number, a: string | null) => total + (a === 'yes' ? 1 : 0),
    0
  );
  const level = Math.ceil(score / 4);

  return (
    <View style={styles.container}>

      {/* ===================== ÜST OVAL PANEL ===================== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Result</Text>
      </View>

      {/* ===================== KART ===================== */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Survey Completed!</Text>
          <Text style={styles.score}>Your Score: {score} / 20</Text>
          <Text style={styles.level}>Your Child's Level: {level}</Text>

          <TouchableOpacity
            style={styles.eduBtn}
            onPress={() => navigation.navigate('Education', { child })}
          >
            <Text style={styles.eduText}>START EDUCATION →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardBtn}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.dashboardText}>GO TO DASHBOARD</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f5f5',
  },

  /* ----- CUSTOM HEADER ----- */
  header: {
    backgroundColor: '#d9d9d9',
    paddingTop: 55,
    paddingBottom: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 55,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#555',
  },
  headerTitle: {
    color: '#444',
    fontSize: 22,
    fontWeight: '700',
  },

  /* ----- CARD ----- */
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B9A',
    marginBottom: 12,
  },
  score: {
    fontSize: 18,
    color: '#444',
    marginBottom: 6,
  },
  level: {
    fontSize: 18,
    color: '#666',
    marginBottom: 22,
  },

  eduBtn: {
    backgroundColor: '#FF6B9A',
    paddingVertical: 14,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
    marginBottom: 10,
  },
  eduText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  dashboardBtn: {
    backgroundColor: '#e7e7e7',
    paddingVertical: 14,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
  },
  dashboardText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '700',
  },
});
