import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Feedback = {
  id: number;
  message: string;
  created_at?: string;
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
      const parentIdString = await AsyncStorage.getItem('parent_id');
      if (!parentIdString) {
        Alert.alert('Error', 'Parent ID not found.');
        setLoading(false);
        return;
      }
      const parentId = Number(parentIdString);
      if (Number.isNaN(parentId)) {
        Alert.alert('Error', 'Invalid Parent ID.');
        setLoading(false);
        return;
      }

      const url = `https://bloomedu-production.up.railway.app/feedbacks/by-parent/${parentId}`;
      console.log('🔗 Fetching feedbacks from', url);

      const res = await fetch(url);
      const raw = await res.text();
      console.log('📥 Raw response:', raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (jsonErr) {
        console.error('❌ JSON parse error', jsonErr);
        Alert.alert('Error', 'Unexpected server response.');
        setLoading(false);
        return;
      }

      if (res.ok) {
        if (data.success && Array.isArray(data.feedbacks)) {
          console.log(`✅ Received ${data.feedbacks.length} feedbacks`);
          setFeedbacks(data.feedbacks);
        } else {
          const msg = data.message || 'Failed fetching feedbacks';
          console.warn('⚠️ Fetch returned ok but unsuccessful:', msg);
          Alert.alert('Error', msg);
        }
      } else {
        const msg = data.message || `Fetch failed with status ${res.status}`;
        console.error('❌ Fetch error status:', res.status, msg);
        Alert.alert('Error', msg);
      }
    } catch (err) {
      console.error('❌ Fetch threw error:', err);
      Alert.alert('Error', 'Cannot connect to server or network error.');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Feedbacks</Text>
      {feedbacks.length === 0 ? (
        <Text style={styles.noFeedback}>No feedback available yet.</Text>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const created = item.created_at;
            return (
              <View style={styles.card}>
                <Text style={styles.childName}>
                  👶 {item.child_name} {item.child_surname}
                </Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.teacher}>Teacher: {item.teacher_name || 'Unknown'}</Text>
                {!!created && <Text style={styles.date}>Date: {new Date(created).toLocaleString()}</Text>}
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ParentFeedbacksScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 15 },
  noFeedback: { textAlign: 'center', fontSize: 16, color: '#777' },
  card: { backgroundColor: '#eef', padding: 12, borderRadius: 10, marginBottom: 12 },
  childName: { fontWeight: '700', marginBottom: 4 },
  message: { marginBottom: 4 },
  teacher: { fontStyle: 'italic', marginBottom: 4 },
  date: { fontSize: 12, color: '#555' },
});
