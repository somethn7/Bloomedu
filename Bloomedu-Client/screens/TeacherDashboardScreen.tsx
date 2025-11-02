import React, { useState } from 'react';
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
  const [showProgress, setShowProgress] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 Arama state

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

  const handleToggleProgress = () => {
    setShowProgress(!showProgress);
    if (!showProgress) fetchChildren();
  };

  // 🔎 Arama filtresi
  const filteredStudents = students.filter(student =>
    `${student.name} ${student.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* -umut: Butonlar - Progress ve Feedback (28.10.2025) */}
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
      {/* Header */}
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

      {/* Quick Stats */}
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

      {/* Action Cards */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.primaryAction]}
          onPress={() => navigation.navigate('TeacherAddChild')}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Add Student</Text>
            <Text style={styles.actionSubtitle}>Register a new learner</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.secondaryAction]}
          onPress={handleToggleProgress}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>
              {showProgress ? '👁️' : '📊'}
            </Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {showProgress ? 'Hide Progress' : 'View Progress'}
            </Text>
            <Text style={styles.actionSubtitle}>Track student learning</Text>
          </View>
          <Text style={styles.actionArrow}>
            {showProgress ? '▼' : '→'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Students List */}
      {showProgress && (
        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>📚 Students Overview</Text>
          
          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search student..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text style={styles.loadingText}>Loading students...</Text>
            </View>
          ) : filteredStudents.length > 0 ? (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStudent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎓</Text>
              <Text style={styles.emptyTitle}>No Students Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search term' : 'Add a student to get started!'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default TeacherDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  settingsIcon: {
    fontSize: 22,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryAction: {
    backgroundColor: '#FFB74D',
  },
  secondaryAction: {
    backgroundColor: '#64B5F6',
  },
  actionIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionIcon: {
    fontSize: 26,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  actionArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  studentsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 15,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#718096',
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#4ECDC4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  progressText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 4,
  },
  valueText: {
    fontWeight: '700',
    color: '#4ECDC4',
  },
  gamesList: {
    marginLeft: 10,
    marginTop: 2,
  },
  gameItem: {
    fontSize: 14,
    color: '#475569',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  progressButton: {
    flex: 1,
    backgroundColor: '#64B5F6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#64B5F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
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
    shadowColor: '#FF6B9A',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
  },
});
