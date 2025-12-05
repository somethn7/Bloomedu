import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Student {
  id: number;
  name: string;
  surname: string;
  parent_id?: number;
  level?: number;
  dailyPlayMinutes?: number;
  totalPlayMinutes?: number;
  favoriteGames?: string[];
}

const TeacherDashboardScreen = ({ navigation }: any) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // LOAD CHILDREN
  const fetchChildren = async () => {
    const teacherId = await AsyncStorage.getItem('teacher_id');
    if (!teacherId) {
      Alert.alert('Error', 'Teacher ID not found.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://bloomedu-production.up.railway.app/children/${teacherId}`);
      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const data: Student[] = await response.json();

      const studentsWithProgress = data.map(student => ({
        ...student,
        dailyPlayMinutes: Math.floor(Math.random() * 60),
        totalPlayMinutes: Math.floor(Math.random() * 1000),
        favoriteGames: ['Puzzle Game', 'Memory Match', 'Color Blocks'],
      }));

      setStudents(studentsWithProgress);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Fetch Error', error.message);
        console.error('Fetch error:', error);
      } else {
        Alert.alert('Fetch Error', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // LOAD UNREAD COUNT
  const fetchUnread = async () => {
    const teacherId = await AsyncStorage.getItem('teacher_id');
    if (!teacherId) return;

    try {
      const res = await fetch(
        `https://bloomedu-production.up.railway.app/messages/unread-summary-teacher/${teacherId}`
      );

      const json = await res.json();
      if (json.success) setUnreadCount(json.totalUnread || 0);
    } catch (e) {
      console.log("Unread error:", e);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchChildren();
    fetchUnread();
  }, []);

  const renderStudent = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <Text style={styles.studentName}>{item.name} {item.surname}</Text>

      <Text style={{ fontSize: 15, color: '#475569', marginBottom: 6 }}>
        🎯 Level: <Text style={{ fontWeight: '700', color: '#f564dacf' }}>{item.level ?? 'N/A'}</Text>
      </Text>

      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
        🆔 Student ID: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{item.id}</Text>
      </Text>

      <View style={styles.progressDetails}>
        <Text style={styles.progressText}>
          Daily Play Time: <Text style={styles.valueText}>{item.dailyPlayMinutes} minutes</Text>
        </Text>
        <Text style={styles.progressText}>
          Total Play Time: <Text style={styles.valueText}>{item.totalPlayMinutes} minutes</Text>
        </Text>
        <Text style={styles.progressText}>Favorite Games:</Text>
        <View style={styles.gamesList}>
          {item.favoriteGames?.map((game, index) => (
            <Text key={index} style={styles.gameItem}>• {game}</Text>
          ))}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.progressButton}
          onPress={() =>
            navigation.navigate('ChildProgress', {
              childId: item.id,
              childName: item.name,
              childSurname: item.surname,
            })
          }
        >
          <Text style={styles.progressButtonText}>📊 View Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() =>
            navigation.navigate('TeacherFeedback', {
              childId: item.id,
              childName: item.name,
              childSurname: item.surname,
              parentId: item.parent_id,
            })
          }
        >
          <Text style={styles.feedbackButtonText}>💬 Send Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.greeting}>Welcome Teacher! 👋</Text>
          <Text style={styles.title}>My Classroom</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* PARENT MESSAGES */}
      <TouchableOpacity
        style={styles.parentMessagesBanner}
        onPress={() => navigation.navigate('TeacherChatList')}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerIconContainer}>
            <Text style={styles.bannerIcon}>💬</Text>
          </View>

          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Parent Messages</Text>
            <Text style={styles.bannerSubtitle}>Official communication channel</Text>
          </View>

          {/* 🔥 UNREAD BADGE */}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* STAT CARDS */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatIcon}>👥</Text>
          <Text style={styles.quickStatValue}>{students.length}</Text>
          <Text style={styles.quickStatLabel}>Students</Text>
        </View>

        <View style={[styles.quickStatCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.quickStatIcon}>📈</Text>
          <Text style={styles.quickStatValue}>
            {students.filter(s => s.level && s.level >= 2).length}
          </Text>
          <Text style={styles.quickStatLabel}>Advanced</Text>
        </View>

        <View style={[styles.quickStatCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.quickStatIcon}>⭐</Text>
          <Text style={styles.quickStatValue}>
            {students.filter(s => s.level === 1).length}
          </Text>
          <Text style={styles.quickStatLabel}>Beginners</Text>
        </View>
      </View>

      {/* STUDENTS LIST */}
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
};

export default TeacherDashboardScreen;

/* ============================================================
   🔥 ALL STYLES + UNREAD BADGE HERE
=============================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  settingsButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsIcon: { fontSize: 22 },

  parentMessagesBanner: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: '#4A148C',
    borderRadius: 20,
    padding: 16,
  },

  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bannerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  bannerIcon: { fontSize: 26 },

  bannerTextContainer: { flex: 1 },

  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },

  bannerArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* 🔥 UNREAD BADGE HERE 🔥 */
  unreadBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  unreadBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 0,
    gap: 12,
  },

  quickStatCard: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },

  quickStatIcon: { fontSize: 26, marginBottom: 6 },

  quickStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
  },

  quickStatLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#4ECDC4',
  },

  studentName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e293b',
  },

  progressDetails: {
    marginLeft: 10,
    marginBottom: 10,
  },

  progressText: { fontSize: 15, color: '#334155', marginBottom: 4 },

  valueText: { fontWeight: '700', color: '#4ECDC4' },

  gamesList: { marginLeft: 10, marginTop: 2 },

  gameItem: { fontSize: 14, color: '#475569' },

  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },

  progressButton: {
    flex: 1,
    backgroundColor: '#64B5F6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  progressButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  feedbackButton: {
    flex: 1,
    backgroundColor: '#FF6B9A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  feedbackButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});
