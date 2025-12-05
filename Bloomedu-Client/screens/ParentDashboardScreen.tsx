import React, { useLayoutEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'https://bloomedu-production.up.railway.app';

const ParentDashboardScreen = ({ navigation }: any) => {
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [parentName, setParentName] = useState('Parent');
  const [unreadCount, setUnreadCount] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    loadParentName();
  }, [navigation]);

  const loadParentName = async () => {
    try {
      const name = await AsyncStorage.getItem('parent_name');
      if (name) setParentName(name);
    } catch {}
  };

  const fetchChildrenForParent = async () => {
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) {
        return;
      }
      const response = await fetch(
        `${BASE_URL}/children/by-parent/${parentId}`
      );
      const json = await response.json();
      if (!json.success) {
        return;
      } else {
        const mapped = json.children.map((child: any) => ({
          ...child,
          dailyPlayMinutes: Math.floor(Math.random() * 60),
          totalPlayMinutes: Math.floor(Math.random() * 1000),
          favoriteGames: ['Puzzle Game', 'Memory Match', 'Color Blocks'],
        }));
        setChildrenList(mapped);
      }
    } catch (error) {
      console.log('Fetch children error (dashboard stats): ', error);
    }
  };

  const fetchUnreadSummary = async () => {
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) return;

      const res = await fetch(
        `${BASE_URL}/messages/unread-summary/${parentId}`
      );
      const json = await res.json();

      if (!json.success || !json.unread) {
        setUnreadCount(0);
        return;
      }

      let total = 0;
      Object.values(json.unread).forEach((cat: any) => {
        Object.values(cat || {}).forEach((n: any) => {
          total += Number(n) || 0;
        });
      });

      setUnreadCount(total);
    } catch (e) {
      console.log('Unread summary error:', e);
      setUnreadCount(0);
    }
  };

  // Dashboard ekrana her odaklandığında hızlı istatistikleri ve unread’i güncelle
  useFocusEffect(
    useCallback(() => {
      fetchChildrenForParent();
      fetchUnreadSummary();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.parentName}>{parentName}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Teacher Communication Banner */}
        <TouchableOpacity
          style={styles.teacherChatBanner}
          onPress={() => navigation.navigate('ParentMessageCategories')}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <Text style={styles.bannerIcon}>👨‍🏫</Text>
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Teacher Communication</Text>
              <Text style={styles.bannerSubtitle}>
                Official Message Channel
              </Text>
            </View>

            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}

            <Text style={styles.bannerArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View className="quickStatCard" style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>👶</Text>
            <Text style={styles.quickStatValue}>{childrenList.length}</Text>
            <Text style={styles.quickStatLabel}>Children</Text>
          </View>
          <View
            style={[styles.quickStatCard, { backgroundColor: '#FEF3C7' }]}
          >
            <Text style={styles.quickStatIcon}>📊</Text>
            <Text style={styles.quickStatValue}>
              {childrenList.filter(c => c.survey_completed).length}
            </Text>
            <Text style={styles.quickStatLabel}>Surveys</Text>
          </View>
          <View
            style={[styles.quickStatCard, { backgroundColor: '#D1FAE5' }]}
          >
            <Text style={styles.quickStatIcon}>🎓</Text>
            <Text style={styles.quickStatValue}>
              {childrenList.filter(c => c.survey_completed).length}
            </Text>
            <Text style={styles.quickStatLabel}>Active</Text>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          {/* Add Child */}
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryAction]}
            onPress={() => navigation.navigate('AddChild')}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>➕</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add a Child</Text>
              <Text style={styles.actionSubtitle}>
                Register a new student
              </Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {/* View Progress */}
          <TouchableOpacity
            style={[styles.actionCard, styles.secondaryAction]}
            onPress={() => navigation.navigate('ParentChildrenOverview')}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📊</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Progress</Text>
              <Text style={styles.actionSubtitle}>Track learning journey</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {/* View Feedbacks */}
          <TouchableOpacity
            style={[styles.actionCard, styles.tertiaryAction]}
            onPress={() => navigation.navigate('ParentFeedbacks')}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Feedbacks</Text>
              <Text style={styles.actionSubtitle}>Old Feedbacks</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pedagog AI Floating Action Button */}
      <TouchableOpacity
        style={styles.aiFab}
        onPress={() => navigation.navigate('ParentAIChat')}
      >
        <View style={styles.aiFabInner}>
          <Text style={styles.aiFabIcon}>🤖</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ParentDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 80, // Extra padding for FAB
  },
  header: {
    backgroundColor: '#FF6B9A',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#FF6B9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
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
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 15,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  parentName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
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
  teacherChatBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#4A148C',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    marginRight: 15,
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  unreadBadge: {
    backgroundColor: '#FFB74D',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15,
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
    marginTop: 20,
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
    backgroundColor: '#4ECDC4',
  },
  secondaryAction: {
    backgroundColor: '#FFB74D',
  },
  tertiaryAction: {
    backgroundColor: '#BA68C8',
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
  aiFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7E57C2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  aiFabInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7E57C2',
  },
  aiFabIcon: {
    fontSize: 32,
  },
});
