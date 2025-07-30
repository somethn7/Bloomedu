import React, { useContext, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { FeedbackContext } from './Contexts/FeedbackContext';

const DashboardScreen = ({ navigation }: any) => {
  const feedbackContext = useContext(FeedbackContext);

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

  if (!feedbackContext) {
    return <Text>Loading...</Text>;
  }

  const { childrenList } = feedbackContext;

  const showFeedback = (child: typeof childrenList[0]) => {
    const feedbacks = child.feedbacks || [];
    if (feedbacks.length > 0) {
      Alert.alert(
        `${child.name} ${child.surname} Feedback`,
        feedbacks[feedbacks.length - 1], // Son feedback
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}>
      <Text style={styles.welcome}>MY PROFILE</Text>
      <Text style={styles.subWelcome}>It's a great day to make progress together.</Text>

      {/* Add a Child & View Progress */}
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
          onPress={() => navigation.navigate('ViewChildProgress')}
        >
          <Text style={styles.actionButtonText}>View of Child Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Teacher Feedbacks</Text>
        <Text style={styles.feedbackSubtitle}>Tap a child to see detailed feedback.</Text>

        {childrenList.length === 0 && (
          <Text style={styles.noFeedbackText}>No children added yet.</Text>
        )}

        {childrenList.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.childCard,
              child.gender === 'Female' ? styles.femaleCard : styles.maleCard,
              { marginBottom: 15 },
            ]}
            activeOpacity={0.7}
            onPress={() => showFeedback(child)}
          >
            <Text style={styles.childName}>{child.name} {child.surname}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 35,
    marginBottom: 10,
    color: '#fb3896c0',
    textAlign: 'center',
  },
  subWelcome: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 40,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonsColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 40,
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
  feedbackContainer: {
    width: '100%',
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#69bbfeff',
    marginBottom: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#69bbfeff',
    paddingBottom: 6,
  },
  feedbackSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#718096',
    marginBottom: 15,
  },
  noFeedbackText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginVertical: 20,
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
  },
  femaleCard: {
    backgroundColor: '#f9d5e5',
  },
  maleCard: {
    backgroundColor: '#b3d9ff',
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
});
