import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Feedback = {
  id: number;
  message: string;
  created_at?: string;
  createdAt?: string;
  child_name?: string;
  child_surname?: string;
  teacher_name?: string;
};

const ParentFeedbacksScreen = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) {
        Alert.alert('Error', 'Parent ID not found');
        return;
      }

      const res = await fetch(`http://10.0.2.2:3000/feedbacks/${parentId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.feedbacks)) {
        setFeedbacks(data.feedbacks);
      } else {
        Alert.alert('Error', 'Failed to fetch feedbacks.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#64bef5" style={{ marginTop: 50 }} />;
  }

  const renderItem = ({ item }: { item: Feedback }) => {
    const created = item.created_at ?? item.createdAt;

    // 🔧 Türkiye saati farkını manuel ekliyoruz (+3 saat)
    const createdDisplay = created
      ? new Date(new Date(created).getTime() + 3 * 60 * 60 * 1000).toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <View style={styles.card}>
        <Text style={styles.childName}>
          👶 {item.child_name} {item.child_surname}
        </Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.teacher}>
          👩‍🏫 Teacher: {item.teacher_name || 'Unknown'}
        </Text>
        {!!createdDisplay && <Text style={styles.date}>🕒 {createdDisplay}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Feedbacks</Text>
      {feedbacks.length === 0 ? (
        <Text style={styles.noFeedback}>No feedback available yet.</Text>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ParentFeedbacksScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2a4365',
    marginBottom: 20,
  },
  noFeedback: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748b',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#fb3896c0',
  },
  childName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  message: { fontSize: 15, color: '#1e293b', marginBottom: 6 },
  teacher: { fontSize: 14, color: '#475569', fontStyle: 'italic' },
  date: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
