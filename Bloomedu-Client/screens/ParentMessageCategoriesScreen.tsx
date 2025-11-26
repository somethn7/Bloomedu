import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// -umut: (22.11.2025) Updated categories to English for consistency
const categories = [
  { id: 'development', title: 'Development Tracker', icon: '📘', color: '#4ECDC4', desc: 'Academic & social progress' },
  { id: 'behavior', title: 'Behavioral Obs.', icon: '🧠', color: '#FF6B6B', desc: 'Mood & behavioral notes' },
  { id: 'routine', title: 'Routine & Planning', icon: '📅', color: '#FFD93D', desc: 'Daily schedule & changes' },
  { id: 'health', title: 'Health & Concerns', icon: '🩺', color: '#6C5CE7', desc: 'Meds, sleep & physical state' },
  { id: 'homework', title: 'Homework & Activities', icon: '🎓', color: '#A8E6CF', desc: 'Home studies & projects' },
  { id: 'question', title: 'Q & A', icon: '❓', color: '#FF8B94', desc: 'General questions & consulting' },
];

const ParentMessageCategoriesScreen = ({ navigation }: any) => {
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleCategorySelect = (category: any) => {
    navigation.navigate('ChatScreen', { 
      category: category.id, 
      categoryTitle: category.title,
      categoryColor: category.color 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communication Board</Text>
        <View style={{ width: 45 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Select a Topic</Text>
        <Text style={styles.description}>
          Please select a topic to start communicating with the teacher.
        </Text>

        <View style={styles.grid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { borderColor: item.color }]}
              onPress={() => handleCategorySelect(item)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ParentMessageCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#6C5CE7', // Purple Theme for Communication
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 25,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 50) / 2, // Two column grid
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 6, // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 30,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
});
