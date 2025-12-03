import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParentFeedbacksScreen = ({ navigation }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // 🔥 ÜSTTEKİ BEYAZ PANELİ TAMAMEN KALDIRIYORUZ
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchFeedbacks = async () => {
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) return;

      const res = await fetch(
        `https://bloomedu-production.up.railway.app/feedbacks/by-parent/${parentId}`
      );

      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to load feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // 🔹 Artık sadece feedback_id gönderiyoruz
  const markOneAsRead = async (feedbackId) => {
    try {
      await fetch(
        `https://bloomedu-production.up.railway.app/feedbacks/mark-read-single`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback_id: feedbackId }),
        }
      );

      setFeedbacks(prev =>
        prev.map(f =>
          f.feedback_id === feedbackId ? { ...f, is_read: true } : f
        )
      );
    } catch (err) {
      console.log('Mark ONE read error:', err);
    }
  };

  const toggleExpand = async (item) => {
    setExpandedId(expandedId === item.feedback_id ? null : item.feedback_id);

    if (!item.is_read) {
      markOneAsRead(item.feedback_id);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#6bfff3ff"
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Feedback</Text>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => String(item.feedback_id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const expanded = expandedId === item.feedback_id;

          return (
            <TouchableOpacity
              onPress={() => toggleExpand(item)}
              activeOpacity={0.9}
              style={[
                styles.card,
                !expanded ? styles.cardClosed : styles.cardOpened
              ]}
            >
              {/* 🔔 NEW BANNER */}
              {!item.is_read && (
                <View style={styles.newBanner}>
                  <Text style={styles.newBannerText}>🔔 You have a new feedback</Text>
                </View>
              )}

              {/* CHILD */}
              <Text style={styles.childName}>👶 {item.child_name} {item.child_surname}</Text>

              {/* CLOSED */}
              {!expanded && (
                <>
                  <Text style={styles.line}>
                    <Text style={styles.bold}>📨 From:</Text> {item.teacher_name}
                  </Text>
                  <Text style={styles.line}>
                    <Text style={styles.bold}>📅 Date:</Text> {item.created_at}
                  </Text>
                </>
              )}

              {/* OPENED */}
              {expanded && (
                <View style={styles.expandedBox}>
                  <Text style={styles.expandedLine}>
                    <Text style={styles.bold}>📨 From:</Text> {item.teacher_name}
                  </Text>

                  <Text style={styles.expandedLine}>
                    <Text style={styles.bold}>👶 For:</Text> {item.child_name} {item.child_surname}
                  </Text>

                  <Text style={styles.expandedLine}>
                    <Text style={styles.bold}>📅 Date:</Text> {item.created_at}
                  </Text>

                  <Text style={styles.messageTitle}>💬 Message:</Text>
                  <Text style={styles.message}>{item.message}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default ParentFeedbacksScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    backgroundColor: '#FF6B9A',
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },

  backButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backArrow: { fontSize: 26, color: 'white', fontWeight: '700' },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginRight: 45,
  },

  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 22,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },

  // 🎨 GREEN THEMING
  cardClosed: { backgroundColor: '#f7f1feff' }, // Açık yeşil
  cardOpened: { backgroundColor: 'white' },

  newBanner: {
    backgroundColor: '#FF4F88',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: '#FF4F88',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  newBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  childName: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  bold: { fontWeight: '700' },
  line: { fontSize: 14, color: '#444', marginBottom: 3 },

  expandedBox: {
    marginTop: 16,
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 18,
  },

  expandedLine: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },

  messageTitle: {
    marginTop: 12,
    fontWeight: '700',
    fontSize: 17,
    color: '#444',
  },

  message: {
    marginTop: 6,
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
  },
});

