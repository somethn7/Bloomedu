import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const questions = [
  "1. Recognizes familiar and frequently used objects or toys.",
  "2. When asked, gives the requested objects.",
  "3. Understands the concept of 'same'.",
  "4. Understands the concept of 'big'.",
  "5. Identifies simple words in pictures."
];

const SurveyScreen = ({ navigation }: any) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (answer === 'yes') {
      setScore(prev => prev + 2);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigation.navigate('Result', { score: score + (answer === 'yes' ? 2 : 0) });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[currentQuestion]}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={() => handleAnswer('yes')}>
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.noButton]} onPress={() => handleAnswer('no')}>
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.progressText}>{currentQuestion + 1} / {questions.length}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  question: { fontSize: 22, textAlign: 'center', marginBottom: 40 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', marginBottom: 20 },
  button: { flex: 1, marginHorizontal: 10, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  yesButton: { backgroundColor: '#4CAF50' }, noButton: { backgroundColor: '#F44336' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  progressText: { fontSize: 16, color: '#555' },
});

export default SurveyScreen;