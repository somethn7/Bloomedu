import React, { useLayoutEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const ParentDashboardScreen = ({ navigation }: any) => {
  const [showChildrenProgress, setShowChildrenProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [childrenList, setChildrenList] = useState<any[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Dashboard',
      headerStyle: { backgroundColor: '#ffffff', shadowColor: 'transparent', elevation: 0 },
      headerTintColor: '#7a8a91',
      headerTitleStyle: { color: '#7a8a91', fontWeight: '600', fontSize: 20 },
    });
  }, [navigation]);

  const fetchChildrenForParent = async () => {
    setLoading(true);
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) {
        Alert.alert('Error', 'Parent ID not found.');
        setLoading(false);
        return [];
      }
      const response = await fetch(`http://10.0.2.2:3000/children/by-parent/${parentId}`);
      const json = await response.json();
      if (!json.success) {
        Alert.alert('Error', 'Failed to load children.');
        setLoading(false);
        return [];
      } else {
        const mapped = json.children.map((child: any) => ({
          ...child,
          dailyPlayMinutes: Math.floor(Math.random() * 60),
          totalPlayMinutes: Math.floor(Math.random() * 1000),
          favoriteGames: ['Puzzle Game', 'Memory Match', 'Color Blocks'],
        }));
        setLoading(false);
        return mapped;
      }
    } catch (error: any) {
      Alert.alert('Fetch Error', error.message || 'An unknown error occurred');
      console.error('Fetch error:', error);
      setLoading(false);
      return [];
    }
  };

  const toggleChildrenProgress = async () => {
    if (!showChildrenProgress) {
      const children = await fetchChildrenForParent();
      setChildrenList(children);
      setShowChildrenProgress(true);
    } else {
      setShowChildrenProgress(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (showChildrenProgress) {
          const children = await fetchChildrenForParent();
          setChildrenList(children);
        }
      })();
    }, [showChildrenProgress])
  );

  // ✅ Çocuk kartı renderı
  const renderChild = (item: any) => (
    <View style={styles.childCard}>
      <Text style={styles.childName}>
        {item.name} {item.surname}
      </Text>

      {/* 🆔 Student ID */}
      <Text style={styles.studentIdText}>
        🆔 Student ID: <Text style={styles.studentIdValue}>{item.id}</Text>

      </Text>

      {/* 🎯 Level */}
      <Text style={{ fontSize: 15, color: '#475569', marginBottom: 5 }}>
        🎯 Level:{' '}
        <Text style={{ fontWeight: '700', color: '#f564dacf' }}>
          {item.level ?? 'Not determined'}
        </Text>
      </Text>

      {item.survey_completed ? (
        <>
          <Text style={styles.completedText}>✅ Survey Completed</Text>

          {/* 🎮 Go to Education butonu */}
          <TouchableOpacity
            style={styles.educationButton}
            onPress={() => navigation.navigate('Education', { child: item })}
          >
            <Text style={styles.educationButtonText}>Go to Education →</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.fillSurveyButton}
          onPress={() => navigation.navigate('Survey', { child: item })}
        >
          <Text style={styles.fillSurveyText}>Fill Survey</Text>
        </TouchableOpacity>
      )}

      <View style={styles.progressDetails}>
        <Text style={styles.progressText}>
          Daily Play Time: <Text style={styles.valueText}>{item.dailyPlayMinutes} minutes</Text>
        </Text>
        <Text style={styles.progressText}>
          Total Play Time: <Text style={styles.valueText}>{item.totalPlayMinutes} minutes</Text>
        </Text>
        <Text style={styles.progressText}>Favorite Games:</Text>
        <View style={styles.gamesList}>
          {item.favoriteGames.map((game: string, index: number) => (
            <Text key={index} style={styles.gameItem}>
              • {game}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
        <Text style={styles.welcome}>MY PROFILE</Text>
        <Text style={styles.subWelcome}>It's a great day to make progress together.</Text>

        <View style={styles.buttonsColumn}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addChildButton]}
            onPress={() => navigation.navigate('AddChild')}
          >
            <Text style={styles.actionButtonText}>Add a Child</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.viewProgressButton]}
            onPress={toggleChildrenProgress}
          >
            <Text style={styles.actionButtonText}>
              {showChildrenProgress ? 'Hide Children Progress' : 'View Children Progress'}
            </Text>
          </TouchableOpacity>

          {showChildrenProgress && (
            <View style={{ marginTop: 10 }}>
              {loading ? (
                <ActivityIndicator size="large" color="#64bef5" />
              ) : childrenList.length > 0 ? (
                childrenList.map((child) => (
                  <View key={child.id}>{renderChild(child)}</View>
                ))
              ) : (
                <Text style={styles.noFeedbackText}>No children added yet.</Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#fb7ea8' }]}
            onPress={() => navigation.navigate('ParentFeedbacks')}
          >
            <Text style={styles.actionButtonText}>View Feedbacks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ParentDashboardScreen;

const styles = StyleSheet.create({
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#fb3896c0',
    textAlign: 'center',
  },
  subWelcome: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 30,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonsColumn: { flexDirection: 'column', justifyContent: 'center', marginBottom: 30 },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 15,
  },
  addChildButton: { backgroundColor: '#64bef5ff' },
  viewProgressButton: { backgroundColor: '#fbb6ce' },
  actionButtonText: { fontSize: 18, fontWeight: '700', color: 'white' },
  noFeedbackText: { fontSize: 16, color: '#718096', textAlign: 'center', marginTop: 10 },
  childCard: {
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#e8f0fe',
    marginVertical: 8,
  },
  childName: { fontSize: 18, fontWeight: '600', color: '#2d3748' },

  // 🆔 Student ID stili
  studentIdText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  studentIdValue: {
    fontWeight: '700',
    color: '#2563eb', // canlı mavi ID rengi
  },

  progressDetails: { marginTop: 8, marginLeft: 10 },
  progressText: { fontSize: 15, color: '#334155', marginBottom: 4 },
  valueText: { fontWeight: '700', color: '#64bef5ff' },
  gamesList: { marginLeft: 10, marginTop: 2 },
  gameItem: { fontSize: 14, color: '#475569' },
  fillSurveyButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#9fc3fa',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  fillSurveyText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  completedText: {
    marginTop: 8,
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '600',
  },
  // 🎮 Education butonu (yeşil)
  educationButton: {
    marginTop: 10,
    backgroundColor: '#4ade80', // açık yeşil
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  educationButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
