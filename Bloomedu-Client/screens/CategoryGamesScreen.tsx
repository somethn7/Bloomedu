import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CategoryGamesScreenProps {
  navigation: any;
  route: any;
}

const CategoryGamesScreen: React.FC<CategoryGamesScreenProps> = ({ navigation, route }) => {
  const { categoryTitle, child } = route.params || {};
  const childLevel = child?.level || 1;

  // Kategori bazlı oyun listesi
  const gamesByCategory: Record<string, any> = {
   Colors: {
  icon: '🎨',
  color: '#FF6B9A',
  gradient: ['#FF6B9A', '#FF8FAB'],
  games: {
    1: [
      { title: 'Color Match', subtitle: 'Find matching colors', screen: 'ColorsRecognitionLevel1', icon: '🎯' },
    ],
    2: [
      { title: 'Color Objects', subtitle: 'Match colors with objects', screen: 'ColorObjectsLevel2', icon: '🎨' },
      { title: 'Color Match Path', subtitle: 'Watch colors match', screen: 'ColorMatchPathLevel2', icon: '🎨' },
    ],
    3: [
      { title: 'Object Color Match', subtitle: 'Choose object with the asked color', screen: 'ObjectColorMatchLevel3', icon: '🌈' },
    ],
    4: [
      { 
        title: 'Object Color Match – Multi', 
        subtitle: 'Find ALL objects of the shown color', 
        screen: 'ObjectColorMatchLevel4', 
        icon: '🌈' 
      },
    ],
  },
},


    Numbers: {
      icon: '🔢',
      color: '#4DABF7',
      gradient: ['#4DABF7', '#74C0FC'],
      games: {
        1: [
          { title: 'Learn Numbers', subtitle: 'Recognize numbers 1-10', screen: 'LearnNumbersLevel1', icon: '📚' },
          { title: 'Sort Numbers', subtitle: 'Arrange numbers in order', screen: 'SortNumbersLevel1', icon: '🔄' },
        ],
        2: [
          { title: 'Missing Numbers', subtitle: 'Find the missing number', screen: 'MissingNumbersLevel2', icon: '❓' },
          { title: 'Match Numbers', subtitle: 'Memory card game', screen: 'MatchNumbersLevel2', icon: '🎴' },
        ],
      },
    },

    Objects: {
      icon: '🎯',
      color: '#51CF66',
      gradient: ['#51CF66', '#69DB7C'],
      games: {
        1: [
          { title: 'Bedtime Journey', subtitle: 'Follow the stars home', screen: 'StarTrackingLevel1', icon: '🌙' },
          { title: 'Fruit Basket', subtitle: 'Watch fruits go to basket', screen: 'FruitBasketLevel1', icon: '🍎' },
        ],
        2: [
          { title: 'Sorting Baskets', subtitle: 'Sort items by category', screen: 'SortingBasketsLevel2', icon: '🧺' },
        ],
        3: [
          { title: 'Shape Match', subtitle: 'Match the shapes', screen: 'ShapeMatchLevel3', icon: '🌼' },
        ],
      },
    },

    Animals: {
      icon: '🦁',
      color: '#FFD43B',
      gradient: ['#FFD43B', '#FFE066'],
      games: {
        1: [
          { title: 'Animal Sounds', subtitle: 'Learn animal sounds', screen: 'AnimalSoundsLevel1', icon: '🎵' },
        ],
        2: [],
      },
    },

    Family: {
      icon: '👨‍👩‍👧‍👦',
      color: '#FF6B9A',
      gradient: ['#FF6B9A', '#FF8FAB'],
      games: {
        1: [
          { title: 'Meet My Family', subtitle: 'Learn about family members', screen: 'MeetMyFamilyLevel1', icon: '💕' },
        ],
        2: [
          { title: 'Find Family Member', subtitle: 'Identify family members', screen: 'FindFamilyMemberLevel2', icon: '🤔' },
        ],
      },
    },
  };

  const categoryData = gamesByCategory[categoryTitle] || null;
  const games = categoryData?.games[childLevel] || [];

  const handleGamePress = (screen: string, index?: number) => {
    navigation.navigate(screen, { 
      child,
      gameSequence: games,
      currentGameIndex: index ?? 0,
      categoryTitle,
    });
  };

  const handlePlayAll = () => {
    if (games.length > 0) {
      handleGamePress(games[0].screen, 0);
    }
  };

  const getLevelName = (level: number) => {
    if (level === 1) return 'Beginner';
    if (level === 2) return 'Intermediate';
    if (level === 3) return 'Advanced';
    if (level === 4) return 'Expert';
    return 'Master';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: categoryData?.color || '#4DABF7' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Education', { child })} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.categoryIcon}>{categoryData?.icon}</Text>
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {childLevel} • {getLevelName(childLevel)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {games.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Choose a Game 🎮</Text>

            {games.length > 1 && (
              <TouchableOpacity
                style={styles.playAllButton}
                onPress={handlePlayAll}
                activeOpacity={0.8}
              >
                <Text style={styles.playAllIcon}>🎯</Text>
                <View style={styles.playAllContent}>
                  <Text style={styles.playAllTitle}>Play All Games</Text>
                  <Text style={styles.playAllSubtitle}>Complete {games.length} games in sequence</Text>
                </View>
                <Text style={styles.playAllArrow}>▶</Text>
              </TouchableOpacity>
            )}

            {games.map((game: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[styles.gameCard, { borderLeftColor: categoryData?.color }]}
                onPress={() => handleGamePress(game.screen, index)}
                activeOpacity={0.7}
              >
                <View style={[styles.gameIconContainer, { backgroundColor: categoryData?.color }]}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                </View>

                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                </View>

                <View style={styles.arrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚧</Text>
            <Text style={styles.emptyTitle}>Coming Soon!</Text>
            <Text style={styles.emptyText}>
              {categoryTitle} games for Level {childLevel} are being prepared.
            </Text>
            <Text style={styles.emptySubtext}>Check back later for new adventures!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginBottom: 15,
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  levelText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
    marginTop: 10,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playAllIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  playAllContent: {
    flex: 1,
  },
  playAllTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playAllSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  playAllArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  gameIcon: {
    fontSize: 30,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  gameSubtitle: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CategoryGamesScreen;

