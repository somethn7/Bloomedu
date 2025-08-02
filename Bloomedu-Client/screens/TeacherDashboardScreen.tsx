import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Student {
  id: number;
  name: string;
  surname: string;
  dailyPlayMinutes?: number;
  totalPlayMinutes?: number;
  favoriteGames?: string[];
}

const TeacherDashboardScreen = ({ navigation }: any) => {
  const [showProgress, setShowProgress] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChildren = async () => {
    const teacherId = await AsyncStorage.getItem('teacher_id');
    if (!teacherId) {
      Alert.alert('Error', 'Teacher ID not found.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:3000/children/${teacherId}`);
      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const data: Student[] = await response.json();

      // Demo progress data
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
        console.error('Fetch unknown error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProgress = () => {
    setShowProgress(!showProgress);
    if (!showProgress) fetchChildren();
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <Text style={styles.studentName}>{item.name} {item.surname}</Text>
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleToggleProgress}
      >
        <Text style={styles.buttonText}>
          {showProgress ? 'Hide Children Progress' : 'View Children Progress'}
        </Text>
      </TouchableOpacity>

      {showProgress && (
        loading ? (
          <ActivityIndicator size="large" color="#64bef5" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderStudent}
            contentContainerStyle={{ paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  );
};

export default TeacherDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2a4365',
  },
  button: {
    backgroundColor: '#64bef5ff',
    paddingVertical: 14,
    borderRadius: 30,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#64bef5ff',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  studentCard: {
    backgroundColor: '#e8f0fe',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#f564dacf',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e293b',
  },
  progressDetails: {
    marginLeft: 10,
  },
  progressText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 4,
  },
  valueText: {
    fontWeight: '700',
    color: '#64bef5ff',
  },
  gamesList: {
    marginLeft: 10,
    marginTop: 2,
  },
  gameItem: {
    fontSize: 14,
    color: '#475569',
  },
});
