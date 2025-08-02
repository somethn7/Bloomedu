import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParentDashboardScreen = ({ navigation }: any) => {
  const [showChildrenProgress, setShowChildrenProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [childrenList, setChildrenList] = useState<any[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Dashboard',
      headerStyle: {
        backgroundColor: '#ffffff',
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: '#7a8a91',
      headerTitleStyle: {
        color: '#7a8a91',
        fontWeight: '600',
        fontSize: 20,
      },
    });
  }, [navigation]);

  const fetchChildrenForParent = async () => {
    setLoading(true);
    try {
      const parentId = await AsyncStorage.getItem('parent_id');
      if (!parentId) {
        Alert.alert('Error', 'Parent ID not found.');
        setLoading(false);
        return [];
      }

      const response = await fetch(`http://10.0.2.2:3000/children-by-parent/${parentId}`);
      const json = await response.json();

      if (!json.success) {
        Alert.alert('Error', 'Failed to load children.');
        return [];
      } else {
        return json.children.map((child: any) => ({
          ...child,
          dailyPlayMinutes: Math.floor(Math.random() * 60),
          totalPlayMinutes: Math.floor(Math.random() * 1000),
          favoriteGames: ['Puzzle Game', 'Memory Match', 'Color Blocks'],
        }));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Fetch Error', error.message);
        console.error('Fetch error:', error);
      } else {
        Alert.alert('Fetch Error', 'An unknown error occurred');
        console.error('Fetch unknown error:', error);
      }
      return [];
    } finally {
      setLoading(false);
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

  const showFeedback = (child: any) => {
    const feedbacks = child.feedbacks || [];
    if (feedbacks.length > 0) {
      Alert.alert(
        `${child.name} ${child.surname} Feedback`,
        feedbacks[feedbacks.length - 1],
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        `${child.name} ${child.surname}`,
        'No feedback available.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderChild = ({ item }: { item: any }) => (
    <View style={styles.childCard}>
      <TouchableOpacity onPress={() => showFeedback(item)}>
        <Text style={styles.childName}>{item.name} {item.surname}</Text>
      </TouchableOpacity>
      <View style={styles.progressDetails}>
        <Text style={styles.progressText}>
          Daily Play Time: <Text style={styles.valueText}>{item.dailyPlayMinutes} minutes</Text>
        </Text>
        <Text style={styles.progressText}>
          Total Play Time: <Text style={styles.valueText}>{item.totalPlayMinutes} minutes</Text>
        </Text>
        <Text style={styles.progressText}>Favorite Games:</Text>
        <View style={styles.gamesList}>
          {item.favoriteGames.map((game: string, index: number) => (
            <Text key={index} style={styles.gameItem}>• {game}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
      <Text style={styles.welcome}>MY PROFILE</Text>
      <Text style={styles.subWelcome}>It's a great day to make progress together.</Text>

      <View style={styles.buttonsColumn}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addChildButton]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddChild')}
        >
          <Text style={styles.actionButtonText}>Add a Child</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.viewProgressButton]}
          activeOpacity={0.8}
          onPress={toggleChildrenProgress}
        >
          <Text style={styles.actionButtonText}>
            {showChildrenProgress ? 'Hide Children Progress' : 'View Children Progress'}
          </Text>
        </TouchableOpacity>
      </View>

      {!showChildrenProgress && (
        <Text style={styles.noFeedbackText}>Click "View Children Progress" to see progress data.</Text>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#64bef5" style={{ marginTop: 20 }} />
      )}

      {!loading && showChildrenProgress && childrenList.length === 0 && (
        <Text style={styles.noFeedbackText}>No children added yet.</Text>
      )}
    </View>
  );

  return (
    <FlatList
      data={showChildrenProgress ? childrenList : []}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderChild}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21}
    />
  );
};

export default ParentDashboardScreen;

const styles = StyleSheet.create({
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#fb3896c0',
    textAlign: 'center',
  },
  subWelcome: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 30,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonsColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 15,
  },
  addChildButton: {
    backgroundColor: '#64bef5ff',
  },
  viewProgressButton: {
    backgroundColor: '#fbb6ce',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  noFeedbackText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 10,
  },
  childCard: {
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#e8f0fe',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  progressDetails: {
    marginTop: 8,
    marginLeft: 10,
  },
  progressText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 4,
  },
  valueText: {
    fontWeight: '700',
    color: '#64bef5ff',
  },
  gamesList: {
    marginLeft: 10,
    marginTop: 2,
  },
  gameItem: {
    fontSize: 14,
    color: '#475569',
  },
});
