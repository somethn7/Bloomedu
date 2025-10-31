import React, { useLayoutEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ParentDashboardScreen = ({ navigation }: any) => {
  const [showChildrenProgress, setShowChildrenProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [parentName, setParentName] = useState('Parent');

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
    setLoading(true);
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) {
        Alert.alert('Error', 'Parent ID not found.');
        setLoading(false);
        return [];
      }
      const response = await fetch(
        `https://bloomedu-production.up.railway.app/children/by-parent/${parentId}`
      );
      const json = await response.json();
      if (!json.success) {
        Alert.alert('Error', 'Failed to load children.');
        setLoading(false);
        return [];
      } else {
        const mapped = json.children.map((child: any) => ({
          ...child,
          dailyPlayMinutes: Math.floor(Math.random() * 60),
          totalPlayMinutes: Math.floor(Math.random() * 1000),
          favoriteGames: ['Puzzle Game', 'Memory Match', 'Color Blocks'],
        }));
        setLoading(false);
        return mapped;
      }
    } catch (error: any) {
      Alert.alert('Fetch Error', error.message || 'An unknown error occurred');
      console.error('Fetch error:', error);
      setLoading(false);
      return [];
    }
  };

  const toggleChildrenProgress = async () => {
    if (!showChildrenProgress) {
      const children = await fetchChildrenForParent();
      setChildrenList(children);
      setShowChildrenProgress(true);
    } else {
      setShowChildrenProgress(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (showChildrenProgress) {
          const children = await fetchChildrenForParent();
          setChildrenList(children);
        }
      })();
    }, [showChildrenProgress])
  );

  const renderChild = (item: any) => (
    <View style={styles.childCard}>
      <View style={styles.childHeader}>
        <View style={styles.childAvatarContainer}>
          <Text style={styles.childAvatar}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.childHeaderInfo}>
          <Text style={styles.childName}>
            {item.name} {item.surname}
          </Text>
          <Text style={styles.studentId}>ID: {item.id}</Text>
        </View>
        {item.survey_completed && (
          <View style={[styles.levelBadge, getLevelStyle(item.level)]}>
            <Text style={styles.levelBadgeText}>L{item.level}</Text>
          </View>
        )}
      </View>

      {item.survey_completed ? (
        <>
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusIcon}>✅</Text>
              <Text style={styles.statusText}>Survey Completed</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.educationButton}
            onPress={() => navigation.navigate('Education', { child: item })}
          >
            <Text style={styles.educationButtonText}>🎓 Start Learning</Text>
            <Text style={styles.educationButtonArrow}>→</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.fillSurveyButton}
          onPress={() => navigation.navigate('Survey', { child: item })}
        >
          <Text style={styles.fillSurveyIcon}>📋</Text>
          <Text style={styles.fillSurveyText}>Complete Survey</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statValue}>{item.dailyPlayMinutes}</Text>
          <Text style={styles.statLabel}>Daily mins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{item.totalPlayMinutes}</Text>
          <Text style={styles.statLabel}>Total mins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🎮</Text>
          <Text style={styles.statValue}>{item.favoriteGames.length}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
      </View>
    </View>
  );

  const getLevelStyle = (level: number) => {
    const colors: Record<number, any> = {
      1: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      2: { backgroundColor: '#D1FAE5', color: '#065F46' },
      3: { backgroundColor: '#FEF3C7', color: '#92400E' },
      4: { backgroundColor: '#FCE7F3', color: '#831843' },
      5: { backgroundColor: '#E0E7FF', color: '#3730A3' },
    };
    return colors[level] || colors[1];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatIcon}>👶</Text>
          <Text style={styles.quickStatValue}>{childrenList.length}</Text>
          <Text style={styles.quickStatLabel}>Children</Text>
        </View>
        <View style={[styles.quickStatCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.quickStatIcon}>📊</Text>
          <Text style={styles.quickStatValue}>
            {childrenList.filter((c) => c.survey_completed).length}
          </Text>
          <Text style={styles.quickStatLabel}>Surveys</Text>
        </View>
        <View style={[styles.quickStatCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.quickStatIcon}>🎓</Text>
          <Text style={styles.quickStatValue}>
            {childrenList.filter((c) => c.survey_completed).length}
          </Text>
          <Text style={styles.quickStatLabel}>Active</Text>
        </View>
      </View>

      {/* Action Cards */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.primaryAction]}
          onPress={() => navigation.navigate('AddChild')}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Add a Child</Text>
            <Text style={styles.actionSubtitle}>Register a new student</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.secondaryAction]}
          onPress={toggleChildrenProgress}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>
              {showChildrenProgress ? '👁️' : '📊'}
            </Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {showChildrenProgress ? 'Hide Progress' : 'View Progress'}
            </Text>
            <Text style={styles.actionSubtitle}>Track learning journey</Text>
          </View>
          <Text style={styles.actionArrow}>
            {showChildrenProgress ? '▼' : '→'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.tertiaryAction]}
          onPress={() => navigation.navigate('ParentFeedbacks')}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>💬</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Feedbacks</Text>
            <Text style={styles.actionSubtitle}>Teacher messages</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Children List */}
      {showChildrenProgress && (
        <View style={styles.childrenSection}>
          <Text style={styles.sectionTitle}>📚 Your Children</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B9A" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : childrenList.length > 0 ? (
            childrenList.map((child) => (
              <View key={child.id}>{renderChild(child)}</View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👶</Text>
              <Text style={styles.emptyTitle}>No Children Yet</Text>
              <Text style={styles.emptyText}>Add a child to start tracking their learning progress!</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default ParentDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 40,
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
  childrenSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
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
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  childAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B9A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatar: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  childHeaderInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  educationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 15,
  },
  educationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  educationButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fillSurveyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64B5F6',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 15,
  },
  fillSurveyIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fillSurveyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
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
