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
      { title: 'Color Parking', subtitle: 'Park the car in the right color spot', screen: 'ColorParking', icon: '🚗' },
      { title: 'Balloon Pop', subtitle: 'Pop the balloons of the correct color', screen: 'BalloonPop', icon: '🎈' },
      {title: 'Caterpillar Coloring', subtitle: 'Color the caterpillar parts', screen: 'CaterpillarColoringGame', icon: '🐛' },
    ],
    2: [
      { title: 'Color Objects', subtitle: 'Match colors with objects', screen: 'ColorObjectsLevel2', icon: '🎨' },
      { title: 'Color Match Path', subtitle: 'Watch colors match', screen: 'ColorMatchPathLevel2', icon: '🎨' },
      { title: 'Object Color Match', subtitle: 'Choose object with the asked color', screen: 'ObjectColorMatchLevel3', icon: '🌈' },
    ],
        3: [
          { title: 'Magic Color Lab', subtitle: 'Mix colors to create new ones', screen: 'MagicColorLab', icon: '🧪' },
          { title: 'Color Adventure', subtitle: 'Find colors in different scenes', screen: 'GenericMatchingGame', icon: '🕵️‍♂️' },
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
          { title: 'Missing Numbers', subtitle: 'Find the missing number', screen: 'MissingNumbersLevel1', icon: '❓' },
          { title: 'Match Numbers', subtitle: 'Memory card game', screen: 'MatchNumbersLevel1', icon: '🎴' }
         
        ],
        2: [
     { title: 'Comparison', subtitle: 'Compare two numbers', screen: 'Comparison', icon: '⚖️' },
     { title: 'Basic Addition', subtitle: 'Learn simple addition', screen: 'Addition', icon: '➕' },
     { title: 'Basic Subtraction', subtitle: 'Learn simple subtraction', screen: 'subtraction', icon: '➖' },
        ],
        3: [
          { title: 'Basic Math', subtitle: 'Learn addition and subtraction', screen: 'BasicMath', icon: '➕' },
          { title: 'Market Math', subtitle: 'Buy items within budget', screen: 'GenericMatchingGame', icon: '🛒' },
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
          { title: 'Learn Objects', subtitle: 'Recognize everyday objects', screen: 'GenericMatchingGame', icon: '📦' },
        ],
        2: [
          { title: 'Object Match', subtitle: 'Match everyday objects', screen: 'ObjectMatchLevel2', icon: '🧸' },
        ],
        3: [
          { title: 'Object Adventure', subtitle: 'Find objects in scenes', screen: 'GenericMatchingGame', icon: '🕵️‍♀️' },
        ],
      },
    },

    Animals: {
      icon: '🦁',
      color: '#FFD43B',
      gradient: ['#FFD43B', '#FFE066'],
      games: {
        1: [
         { 
          title: 'Learn Animals', 
          subtitle: 'Recognize cute animals', 
          screen: 'GenericMatchingGame', 
          icon: '🦒',
          categoryKey: 'Animals',
          gameMode: 'recognition' // Birinci mod
        },
          { title: 'Animal Sounds', subtitle: 'Learn animal sounds', screen: 'AnimalSoundsLevel1', icon: '🎵' },
        ],
        2: [ 
          {
            title: 'Sound Match', 
            subtitle: 'Match animals to their sounds',
            screen: 'GenericMatchingGame',
            icon: '🦉'
            ,
          }
        ],
        3: [
          { title: 'Animal Life Cycle', subtitle: 'Learn how animals grow', screen: 'AnimalLifeCycle', icon: '🦋' },
          { title: 'Animal Habitat', subtitle: 'Match animals to their habitats', screen: 'AnimalHabitat', icon: '🌲' },
          { title: 'Animal Rescue', subtitle: 'Help animals in need', screen: 'GenericMatchingGame', icon: '🚑' },
        ],
      },
    },
        Fruits: {
      icon: '🍎',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8787'],
      games: {
        1: [
          { 
            title: 'Learn Fruits', 
            subtitle: 'Recognize delicious fruits', 
            screen: 'GenericMatchingGame', 
            icon: '🍓',
            categoryKey: 'Fruits' 
          },
        ],
        2: [
          { 
            title: 'Fruit Match', 
            subtitle: 'Match fruits to their names', 
            screen: 'GenericMatchingGame', 
            icon: '🍒',
            categoryKey: 'Fruits' 
          },
        ],
        3: [
          { 
            title: 'Fruit Detective', 
            subtitle: 'Find fruits from clues', 
            screen: 'FruitLogic', 
            icon: '🕵️‍♂️',
          },
        ],
      },
    },
        Vegetables: {
      icon: '🥦',
      color: '#26DE81',
      gradient: ['#26DE81', '#20BF6B'],
      games: {
        1: [
          { 
            title: 'Learn Vegetables', 
            subtitle: 'Healthy and tasty vegetables', 
            screen: 'GenericMatchingGame', 
            icon: '🥕',
            categoryKey: 'Vegetables' 
          },
        ],
        2: [
          {
            title: 'Veggie Match', 
            subtitle: 'Match vegetables to their names', 
            screen: 'GenericMatchingGame', 
            icon: '🌽',
            categoryKey: 'Vegetables'
          }
        ],
        3: [
          { 
            title: 'Veggie Pattern', 
            subtitle: 'Complete the veggie sequences', 
            screen: 'VeggiePatternLevel3', 
            icon: '🧩' 
          },
        ],
      },
    },
    BodyParts: {
      icon: '🧠',
      color: '#FF8787',
      gradient: ['#FF8787', '#FFA8A8'],
      games: {
        1: [
          {
            title: 'Learn Body Parts',
            subtitle: 'Identify different body parts',
            screen: 'GenericMatchingGame',
            icon: '🦵',
            categoryKey: 'BodyParts'
          },
        ],
        2: [
          {
            title: 'Body Parts Match',
            subtitle: 'Match body parts to their functions',
            screen: 'GenericMatchingGame',
            icon: '🧠',
            categoryKey: 'BodyParts'
          },
        ],
        3: [
          {
            title: 'Body Care Hero',
            subtitle: 'Choose the right tool to help',
            screen: 'BodyCare',
            icon: '🩹',
          },
        ],
      },
    },
    Emotions: {
      icon: '😊',
      color: '#FECA57',
      gradient: ['#FECA57', '#FF9F43'],
      games: {
        1: [
          { title: 'Learning Emotions', subtitle: 'Recognize facial expressions', screen: 'GenericMatchingGame', icon: '🎭', categoryKey: 'Emotions' },
        ],
        2: [
          { title: 'Emotion Match', subtitle: 'Match emotions to situations', screen: 'GenericMatchingGame', icon: '😢', categoryKey: 'Emotions' },
        ],
        3: [
          { title: 'How Do They Feel', subtitle: 'Understand emotions in stories', screen: 'SocialReasoning', icon: '🧠' },
        ],
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
          { title: 'Family Roles', subtitle: 'Match family members to their roles', screen: 'GenericMatchingGame', icon: '🏡' } ,
        ],
        3: [
          { title: 'Family Duty', subtitle: 'Complete family responsibilities', screen: 'FamilyDutyLevel3', icon: '🏠' },
        ],
      },
    },
       Vehicles: {
      icon: '🚀',
      color: '#2F3542',
      gradient: ['#2F3542', '#57606F'],
      games: {
        1: [
          { 
            title: 'Learn Vehicles', 
            subtitle: 'Identify different vehicles', 
            screen: 'GenericMatchingGame', // Senin sihirli dosyan
            icon: '🚁',
            categoryKey: 'Vehicles' // gameData.ts'deki anahtar ile aynı olmalı
          },
        ],
        2: [
          {
            title: 'Vehicle Match', 
            subtitle: 'Match vehicles to their sounds', 
            screen: 'GenericMatchingGame', 
            icon: '🚤',
            categoryKey: 'Vehicles' 
          }
        ],
        3: [
          { 
            title: 'Route Master', 
            subtitle: 'Match vehicles to their paths', 
            screen: 'RouteMaster', 
            icon: '🛣️',
          },
        ],
      },
    },
     Jobs: {
      icon: '💼',
      color: '#45B7D1',
      gradient: ['#45B7D1', '#3498DB'],
      games: {
        1: [
          { 
            title: 'Learn Jobs', 
            subtitle: 'Identify different professions', 
            screen: 'GenericMatchingGame', 
            icon: '👨‍🔧',
            categoryKey: 'Jobs' 
          },
        ],
        2: [
          { 
            title: 'Job Match', 
            subtitle: 'Match jobs to their tools', 
            screen: 'GenericMatchingGame', 
            icon: '🛠️',
            categoryKey: 'Jobs' 
          },
        ],
        3: [
          { 
            title: 'Job Heroes', 
            subtitle: 'Choose the right job for help', 
            screen: 'JobHeroes', 
            icon: '🦸‍♂️',
          },
        ],
      },
    },
    School: {
      icon: '🏫',
      color: '#3C40C6',
      gradient: ['#3C40C6', '#5758BB'],
      games: {
        1: [
          { 
            title: 'School Supplies', 
            subtitle: 'Learn classroom objects', 
            screen: 'GenericMatchingGame', 
            icon: '✏️',
            categoryKey: 'Schools' 
          },
        ],
        2: [
          { 
            title: 'Supply Match', 
            subtitle: 'Match supplies to their uses', 
            screen: 'GenericMatchingGame', 
            icon: '📚',
            categoryKey: 'Schools' 
          },
        ],
        3: [
          { 
            title: 'School Missions', 
            subtitle: 'Choose the right tool for school', 
            screen: 'SchoolMissions', 
            icon: '🎒',
          },
        ],
      },
    },

    Mixed: {
      icon: '🧠',
      color: '#A29BFE', // Mor tonu, zihinsel becerileri temsil eder
      gradient: ['#A29BFE', '#6C5CE7'],
      games: {
        1: [
          { title: 'Fruit Basket', subtitle: 'Count and sort delicious fruits', screen: 'CountBasket', icon: '🧺' },
          { title: 'Size Matching', subtitle: 'Match objects by size', screen: 'SizeMatching', icon: '📏' },
          { title: 'Size Clothes', subtitle: 'Dress the character according to size', screen: 'SizeClothes', icon: '👗' },
        ],
        2: [
          { title: 'Big or Small', subtitle: 'Compare sizes of objects', screen: 'SizeComparisonLevel2', icon: '📏' },
          { title: 'Belonging', subtitle: 'Sort items into their correct places', screen: 'belong', icon: '🧺' },
        ],
        3: [
          { title: 'Logic Path', subtitle: 'Find the correct sequence', screen: 'LogicPathLevel3', icon: '🧩' },
        ],
      },
    },
  };

  const categoryData = gamesByCategory[categoryTitle] || null;
  const games = categoryData?.games[childLevel] || [];

  const handleGamePress = (game: any, index?: number) => {
    if (!game?.screen) {
      console.warn('handleGamePress called without a valid game.screen', game);
      return;
    }

    navigation.navigate(game.screen, {
      child,
      gameSequence: games,
      currentGameIndex: index ?? 0,
      categoryTitle,
      categoryKey: game.categoryKey || categoryTitle,
      gameMode: game.gameMode,
    });
  };

  const handlePlayAll = () => {
    if (games.length > 0) {
      // IMPORTANT: pass the whole game object (not the screen string)
      handleGamePress(games[0], 0);
    }
  };

  const getLevelName = (level: number) => {
    if (level === 1) return 'Recognition';
    if (level === 2) return 'Association';
    return 'Scenario';
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
                 onPress={() => handleGamePress(game, index)}
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

