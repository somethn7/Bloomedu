// -umut: Education Screen - Modern ve renkli tasarım (28.10.2025)
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

// -umut: Kategoriler - Her birinin kendine özgü rengi var (28.10.2025)
const categories = [
  { 
    title: 'Colors', 
    gradient: ['#FF6B9A', '#FF8FAB'],
    emoji: '🎨',
    description: 'Learn and match colors'
  },
  { 
    title: 'Numbers', 
    gradient: ['#4DABF7', '#74C0FC'],
    emoji: '🔢',
    description: 'Count and recognize numbers'
  },
  { 
    title: 'Objects', 
    gradient: ['#51CF66', '#69DB7C'],
    emoji: '🎯',
    description: 'Identify everyday objects'
  },
  { 
    title: 'Animals', 
    gradient: ['#FFD43B', '#FFE066'],
    emoji: '🦁',
    description: 'Discover animals'
  },
  
  { 
        title: 'Fruits',
    gradient: ['#FF9F43', '#FFC368'],
    emoji: '🍎',
    description: 'Learn about fruits'
  },
  {
    title: 'Vegetables',
    gradient: ['#37B24D', '#51CF66'],
    emoji: '🥦',
    description: 'Learn about vegetables'
  },
  {
    title: 'BodyParts',
    gradient: ['#FF8787', '#FFA8A8'],
    emoji: '🧠',
    description: 'Know your body parts'
  },
    {
    title: 'Emotions',
    gradient: ['#F03E3E', '#FF6B6B'],
    emoji: '😊',
    description: 'Understand different emotions'
  },
  {
    title: 'Vehicles',
    gradient: ['#FF922B', '#FFA94D'],
    emoji: '🚗',
    description: 'Learn about vehicles'
  },
  { 
    title: 'Family', 
    gradient: ['#FF6B9A', '#FF8FAB'],
    emoji: '👨‍👩‍👧‍👦',
    description: 'Meet your family'
  },
   {
    title: 'Jobs',
    gradient: ['#845EF7', '#B197FC'],
    emoji: '💼',
    description: 'Explore different professions'
  },
  {
    title: 'School',
    gradient: ['#339AF0', '#74C0FC'],
    emoji: '🏫',
    description: 'Fun school-related games'
  },
  {
    title: 'Mixed',
    gradient: ['#7950F2', '#B197FC'],
    emoji: '🧩',
    description: 'Fun mixed games'
  }
];

const EducationScreen = ({ navigation, route }: any) => {
  // Route params'dan child'ı direkt al - her render'da güncel değeri kullan
  const child = route.params?.child;

  // 🔥 DEFAULT HEADER’I KALDIR
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const handleCategoryPress = (categoryTitle: string) => {
    navigation.navigate('CategoryGames', { categoryTitle, child });
  };

  const getLevelName = (level: number) => {
    if (level === 1) return 'Recognition';
    if (level === 2) return 'Association';
    return 'Scenario';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>

      {/* ⭐⭐⭐ OVAL CUSTOM HEADER PANEL (YALNIZCA BU EKLENDİ) */}
      <View style={styles.topPanel}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>Learning Time! 🎓</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        
        {/* Mevcut içerik aynen duruyor */}
        {child && (
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {child?.level || 1}</Text>
              <Text style={styles.levelName}>{getLevelName(child?.level || 1)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.subtitle}>Choose a category to start learning</Text>

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
                <Text style={styles.cardTitle}>{category.title}</Text>
                <Text style={styles.cardDescription}>{category.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// -umut: Modern ve renkli stiller (28.10.2025)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
  },
    categoryIconContainer: {
    width: 80, // İsteğe göre ayarla
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Hafif şeffaf beyaz arka plan
    borderRadius: 20,
    justifyContent: 'center', // Dikeyde ortalar
    alignItems: 'center',     // Yatayda ortalar
    marginBottom: 10,
    alignSelf: 'center',      // Kapsayıcıyı kutu içinde ortalar
  },
  // Emojinin kendi stili
  categoryIconText: {
    fontSize: 45, // Emojiyi büyütmek istersen burayı artır
    textAlign: 'center',
  },
  // Eğer altındaki o küçük resim grupları duruyorsa onları silmek için
  // Render kısmında o View'ı tamamen kaldıracağız.

  /* 🔥 YENİ EKLENEN OVAL PANEL */
  topPanel: {
    backgroundColor: '#FF6B9A',
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backArrow: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: '700',
  },

  topTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '700',
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
  levelContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  levelBadge: {
    backgroundColor: '#FF6B9A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
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
    marginTop: 15,
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
