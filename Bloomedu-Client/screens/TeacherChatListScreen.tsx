import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://bloomedu-production.up.railway.app';

const TeacherChatListScreen = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 DEFAULT HEADER'I KAPAT
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    loadConversations();

    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });

    return unsubscribe;
  }, [navigation]);

  const loadConversations = async () => {
    try {
      const teacherId = await AsyncStorage.getItem('teacher_id');
      if (!teacherId) return;

      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/messages/teacher/conversations/${teacherId}`
      );
      const json = await response.json();

      if (json.success) {
        const sorted = json.conversations.sort(
          (a: any, b: any) =>
            new Date(b.last_message_time).getTime() -
            new Date(a.last_message_time).getTime()
        );
        setConversations(sorted);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (item: any) => {
    navigation.navigate('ChatScreen', {
      category: item.category,
      categoryTitle: `${item.parent_name} - ${item.category}`,
      categoryColor: '#6C5CE7',
      otherUserId: item.parent_id,
      isTeacher: true,
      childId: item.child_id,
      childName: item.child_name,
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenChat(item)}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.parent_name?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{item.child_name || 'Unknown Child'}</Text>
        <Text style={styles.subLine}>
          Parent: {item.parent_name || 'Unknown'}
        </Text>

        <Text style={styles.categoryBadge}>{item.category}</Text>

        <Text style={styles.message} numberOfLines={1}>
          {item.last_message}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.time}>
          {item.last_message_time
            ? new Date(item.last_message_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>

        {item.unread_count > 0 && (
          <View style={styles.unreadDot}>
            <Text style={styles.unreadText}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}

        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* 🔥🔥 OVAL ÜST PANEL (Teacher Dashboard ile aynı stil) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Parent Messages</Text>

        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6C5CE7"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) =>
            `${item.parent_id}-${item.child_id}-${item.category}`
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No messages yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default TeacherChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  /* 🔥 NEW HEADER STYLE */
  header: {
    backgroundColor: '#6C5CE7',
    paddingTop: 50,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backArrow: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },

  /* existing styles unchanged below */

  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4338CA',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subLine: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    color: '#6C5CE7',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
  },
  meta: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  arrow: {
    fontSize: 18,
    color: '#D1D5DB',
    marginTop: 4,
  },
  unreadDot: {
    backgroundColor: '#FF4B5C',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
