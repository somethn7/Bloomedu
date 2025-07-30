import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ResultScreen = ({ route, navigation }: any) => {
  const { score } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Completed!</Text>
      <Text style={styles.score}>Your Score: {score} / 10</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Education')}  
      >
        <Text style={styles.buttonText}>START EDUCATION</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  score: { fontSize: 20, color: 'green', marginBottom: 20 },
  button: {
    backgroundColor: '#2196F3', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 5, elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ResultScreen;