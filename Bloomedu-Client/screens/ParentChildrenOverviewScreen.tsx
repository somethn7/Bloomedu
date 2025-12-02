// 🚀 ParentChildrenOverviewScreen – UPDATED v2
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParentChildrenOverviewScreen = ({ navigation }: any) => {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) {
        Alert.alert('Error', 'Parent ID not found.');
        return;
      }

      const response = await fetch(
        `https://bloomedu-production.up.railway.app/children/by-parent/${parentId}`
      );
      const json = await response.json();

      if (!json.success) {
        Alert.alert('Error', 'Failed to load children.');
        return;
      }

      setChildren(json.children);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const isSurveyDone = (value: any) =>
    value === true || value === "TRUE" || value === 1;

  const renderChildCard = (child: any) => (
    <View style={styles.childCard} key={child.id}>
      {/* HEADER */}
      <View style={styles.childHeader}>
        <View style={styles.childAvatarContainer}>
          <Text style={styles.childAvatar}>
            {child.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.childHeaderInfo}>
          <Text style={styles.childName}>
            {child.name} {child.surname}
          </Text>
          <Text style={styles.studentId}>ID: {child.id}</Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>L{child.level || 1}</Text>
        </View>
      </View>

      {/* SURVEY */}
      {isSurveyDone(child.survey_completed) ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusText}>Survey Completed</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.fillSurveyButton}
          onPress={() => navigation.navigate('Survey', { child })}
        >
          <Text style={styles.fillSurveyIcon}>📋</Text>
          <Text style={styles.fillSurveyText}>Complete Survey</Text>
        </TouchableOpacity>
      )}

      {/* START LEARNING */}
      {isSurveyDone(child.survey_completed) && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Education', { child })}
        >
          <Text style={styles.startButtonText}>🎓 Start Learning →</Text>
        </TouchableOpacity>
      )}

      {/* ✨ NEW: VIEW DETAILS BUTTON */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate("ChildGameDetails", { child })}
      >
        <Text style={styles.detailsText}>📊 View Details</Text>
      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Children</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator size="large" color="#FF6B9A" />
          </View>
        ) : (
          children.map(renderChildCard)
        )}
      </ScrollView>
    </View>
  );
};

export default ParentChildrenOverviewScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    backgroundColor: '#FF6B9A',
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },

  childCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },

  childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  childAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B9A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  childAvatar: { fontSize: 22, color: '#fff', fontWeight: '700' },
  childHeaderInfo: { flex: 1 },
  childName: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  studentId: { fontSize: 13, color: '#6B7280' },

  levelBadge: {
    backgroundColor: '#FFE4EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  levelBadgeText: { fontSize: 14, fontWeight: '700', color: '#C2185B' },

  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusIcon: { marginRight: 6, fontSize: 16 },
  statusText: { color: '#065F46', fontWeight: '600', fontSize: 14 },

  fillSurveyButton: {
    backgroundColor: '#64B5F6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fillSurveyIcon: { fontSize: 18, marginRight: 6, color: '#fff' },
  fillSurveyText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  startButton: {
    backgroundColor: '#4ADE80',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  /** 🌟 NEW DETAILS BUTTON */
  detailsButton: {
    backgroundColor: "#FFB7D5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  detailsText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7A003C",
  },
});
