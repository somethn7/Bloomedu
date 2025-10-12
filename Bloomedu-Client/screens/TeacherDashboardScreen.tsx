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
      const response = await fetch(`https://bloomedu-backend.onrender.com/children/${teacherId}`);
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
        <Text style={styles.feedbackButtonText}>Send Feedback</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Classroom Overview</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TeacherAddChild')}
      >
        <Text style={styles.buttonText}>Add New Student</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleToggleProgress}>
        <Text style={styles.buttonText}>
          {showProgress ? 'Hide Children Progress' : 'View Children Progress'}
        </Text>
      </TouchableOpacity>

      {showProgress && (
        <>
          {/* 🔍 Search input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search student..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#64bef5" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStudent}
              contentContainerStyle={{ paddingTop: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
};

export default TeacherDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 15, textAlign: 'center', color: '#2a4365' },
  button: {
    backgroundColor: '#64bef5ff',
    paddingVertical: 14,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#64bef5ff',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentCard: {
    backgroundColor: '#e8f0fe',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#f564dacf',
  },
  studentName: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#1e293b' },
  progressDetails: { marginLeft: 10 },
  progressText: { fontSize: 15, color: '#334155', marginBottom: 4 },
  valueText: { fontWeight: '700', color: '#64bef5ff' },
  gamesList: { marginLeft: 10, marginTop: 2 },
  gameItem: { fontSize: 14, color: '#475569' },
  feedbackButton: {
    backgroundColor: '#fb3896c0',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#fb3896c0',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  feedbackButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
