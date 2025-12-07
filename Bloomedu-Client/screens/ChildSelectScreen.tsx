import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://bloomedu-production.up.railway.app';

const ChildSelectScreen = ({ navigation, route }: any) => {
  const { category, categoryTitle, categoryColor } = route.params;

  const [children, setChildren] = useState<any[]>([]);
  const [unreadSummary, setUnreadSummary] = useState<any>({});

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadChildren();
    loadUnread();
  }, []);

  // ChatScreen'den geri dönüldüğünde unread sayılarını güncelle
  useFocusEffect(
    useCallback(() => {
      loadUnread();
    }, [])
  );

  const loadChildren = async () => {
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) return;

      const res = await fetch(
        `${BASE_URL}/children/by-parent/${parentId}`
      );
      const json = await res.json();
      if (json.success) setChildren(json.children);
    } catch (e) {
      console.log('Error loading children:', e);
    }
  };

  const loadUnread = async () => {
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) return;

      const res = await fetch(
        `${BASE_URL}/messages/unread-summary/${parentId}`
      );
      const json = await res.json();

      if (json.success && json.unread) setUnreadSummary(json.unread);
      else setUnreadSummary({});
    } catch (e) {
      console.log('Unread summary error:', e);
      setUnreadSummary({});
    }
  };

  const getUnreadForChild = (childId: number) => {
    if (!unreadSummary[category]) return 0;
    const val = unreadSummary[category][childId];
    return val ? Number(val) : 0;
  };

  const handleSelect = (child: any) => {
    navigation.navigate('ChatScreen', {
      childId: child.id,
      childName: `${child.name} ${child.surname}`,
      category,
      categoryTitle,
      categoryColor,
      isTeacher: false,
      otherUserId: child.teacher_id,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#718096' }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Child</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Who is this message about?</Text>
        <Text style={styles.description}>
          Choose the child you want to communicate about.
        </Text>

        {children.map((child) => {
          const unread = getUnreadForChild(child.id);

          return (
            <TouchableOpacity
              key={child.id}
              style={styles.card}
              onPress={() => handleSelect(child)}
            >
              <View style={styles.cardRow}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatar}>👶</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>
                    {child.name} {child.surname}
                  </Text>
                  <Text style={styles.childTeacher}>
                    Teacher ID: {child.teacher_id}
                  </Text>
                </View>

                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unread > 99 ? '99+' : unread}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ChildSelectScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: '800',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },

  content: {
    padding: 20,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
    color: '#2D3748',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderColor: '#E5E7EB',
    borderWidth: 2,
    borderBottomWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  cardRow: { flexDirection: 'row', alignItems: 'center' },

  avatarBox: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatar: { fontSize: 28 },

  childName: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  childTeacher: { fontSize: 12, color: '#6B7280', marginTop: 3 },

  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
});
