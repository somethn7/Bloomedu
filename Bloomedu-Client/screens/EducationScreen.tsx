// -umut: Education Screen - Modern ve renkli tasarım (28.10.2025)
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';

// -umut: Kategoriler - Her birinin kendine özgü rengi var (28.10.2025)
const categories = [
  { 
    title: 'Colors', 
    image: require('./assets/colors.png'),
    gradient: ['#FF6B9A', '#FF8FAB'],
    emoji: '🎨',
    description: 'Learn and match colors'
  },
  { 
    title: 'Numbers', 
    image: require('./assets/numbers.png'),
    gradient: ['#4DABF7', '#74C0FC'],
    emoji: '🔢',
    description: 'Count and recognize numbers'
  },
  { 
    title: 'Objects', 
    image: require('./assets/objects.png'),
    gradient: ['#51CF66', '#69DB7C'],
    emoji: '🎯',
    description: 'Identify everyday objects'
  },
  { 
    title: 'Animals', 
    image: require('./assets/animals.png'),
    gradient: ['#FFD43B', '#FFE066'],
    emoji: '🦁',
    description: 'Discover animals'
  },
  { 
    title: 'Family', 
    image: require('./assets/child.png'), // Mevcut bir asset kullanıyoruz
    gradient: ['#FF6B9A', '#FF8FAB'],
    emoji: '👨‍👩‍👧‍👦',
    description: 'Meet your family'
  },
];

// -umut: Child parametresi eklendi - oyunlara child bilgisini iletmek için (28.10.2025)
const EducationScreen = ({ navigation, route }: any) => {
  const { child } = route.params || {};
  const childLevel = child?.level || 1; // -umut: Çocuğun seviyesi

  // Header back davranışı: Parent Dashboard'a dön
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ paddingHorizontal: 12 }}>
          <Text style={{ color: '#7a8a91', fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // -umut: Kategori seçimi - yeni CategoryGamesScreen'e yönlendir (31.10.2025)
  const handleCategoryPress = (categoryTitle: string) => {
    navigation.navigate('CategoryGames', { categoryTitle, child });
  };
  // -umut: Seviye adı (28.10.2025)
  const getLevelName = (level: number) => {
    if (level === 1) return 'Beginner';
    if (level === 2) return 'Intermediate';
    if (level === 3) return 'Advanced';
    if (level === 4) return 'Expert';
    return 'Master';
  };

  return (
    <ScrollView style={styles.container}>
      {/* -umut: Başlık bölümü - çocuk bilgisi ile (28.10.2025) */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Learning Time! 🎓</Text>
        {child && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {childLevel}</Text>
            <Text style={styles.levelName}>{getLevelName(childLevel)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>Choose a category to start learning</Text>

      {/* -umut: Kategori kartları - Direkt tıklanabilir (28.10.2025) */}
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              { 
                backgroundColor: category.gradient[0],
                shadowColor: category.gradient[0],
              }
            ]}
            onPress={() => handleCategoryPress(category.title)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Image source={category.image} style={styles.image} />
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardDescription}>{category.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// -umut: Modern ve renkli stiller (28.10.2025)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#FF6B9A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    shadowColor: '#FF6B9A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  levelName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  card: {
    width: '45%',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    paddingBottom: 12,
  },
  cardContent: {
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  image: { 
    width: 70, 
    height: 70, 
    marginBottom: 10,
    borderRadius: 10,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default EducationScreen;
