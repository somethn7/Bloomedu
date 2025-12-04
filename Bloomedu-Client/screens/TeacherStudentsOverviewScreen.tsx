import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
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
}

const TeacherStudentsOverviewScreen = ({ navigation }: any) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    const teacherId = await AsyncStorage.getItem('teacher_id');
    if (!teacherId) {
      Alert.alert('Error', 'Teacher ID not found.');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Öğrencileri çek
      const res = await fetch(
        `https://bloomedu-production.up.railway.app/children/${teacherId}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: Student[] = await res.json();

      // 2️⃣ Her öğrenci için playtime bilgisini çek
      const studentsWithProgress = await Promise.all(
        data.map(async (student) => {
          try {
            const pt = await fetch(
              `https://bloomedu-production.up.railway.app/children/playtime/${student.id}`
            );
            const json = await pt.json();

            return {
              ...student,
              dailyPlayMinutes: json.daily_minutes ?? 0,
              totalPlayMinutes: json.total_minutes ?? 0,
            };
          } catch (e) {
            return {
              ...student,
              dailyPlayMinutes: 0,
              totalPlayMinutes: 0,
            };
          }
        })
      );

      setStudents(studentsWithProgress);
    } catch (error: any) {
      Alert.alert("Fetch Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.name} ${student.surname}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const renderStudent = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <Text style={styles.studentName}>
        {item.name} {item.surname}
      </Text>

      <Text style={styles.levelText}>
        🎯 Level: <Text style={styles.levelValue}>{item.level ?? 'N/A'}</Text>
      </Text>

      <Text style={styles.idText}>
        🆔 Student ID: <Text style={styles.idValue}>{item.id}</Text>
      </Text>

      <View style={styles.progressDetails}>
        <Text style={styles.progressText}>
          Daily Play Time:{' '}
          <Text style={styles.valueText}>{item.dailyPlayMinutes} minutes</Text>
        </Text>

        <Text style={styles.progressText}>
          Total Play Time:{' '}
          <Text style={styles.valueText}>{item.totalPlayMinutes} minutes</Text>
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {/* 🔥 Child objesini tam gönderiyoruz */}
        <TouchableOpacity
          style={styles.progressButton}
          onPress={() =>
            navigation.navigate("ChildProgress", {
              child: item,
            })
          }
        >
          <Text style={styles.progressButtonText}>📊 View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() =>
            navigation.navigate("TeacherFeedback", {
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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Students Overview</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
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
            keyExtractor={item => item.id.toString()}
            renderItem={renderStudent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={styles.emptyTitle}>No Students Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try a different search term.' : 'Add a student to get started!'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TeacherStudentsOverviewScreen;

/* 🎨 STYLES — Teacher turquoise theme */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: {
    backgroundColor: "#4ECDC4",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: { fontSize: 24, color: "#fff", fontWeight: "700" },

  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },

  content: { flex: 1, padding: 20 },

  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    borderColor: "#D6EDEB",
    borderWidth: 1,
    marginBottom: 20,
    fontSize: 16,
  },

  studentCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#4ECDC4",
    elevation: 4,
  },

  studentName: { fontSize: 20, fontWeight: "700", marginBottom: 8, color: "#1E293B" },

  levelText: { fontSize: 15, color: "#475569" },

  levelValue: { color: "#4ECDC4", fontWeight: "700" },

  idText: { marginTop: 4, fontSize: 14, color: "#6B7280" },

  idValue: { fontWeight: "700", color: "#2563EB" },

  progressDetails: { marginTop: 10, marginBottom: 10 },

  progressText: { fontSize: 15, color: "#334155" },

  valueText: { color: "#4ECDC4", fontWeight: "700" },

  actionButtons: { flexDirection: "row", gap: 10, marginTop: 10 },

  progressButton: {
    flex: 1,
    backgroundColor: "#4ECDC4",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
  },

  progressButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  feedbackButton: {
    flex: 1,
    backgroundColor: "#FF6B9A",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
  },

  feedbackButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  emptyState: { paddingTop: 50, alignItems: "center" },
  emptyIcon: { fontSize: 70 },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: "700" },
  emptyText: { marginTop: 5, color: "#6B7280" },
});
