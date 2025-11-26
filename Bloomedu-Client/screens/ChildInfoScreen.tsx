import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { FeedbackContext, Child } from './Contexts/FeedbackContext';

const ChildInfoScreen: React.FC = () => {
  const feedbackContext = useContext(FeedbackContext);
  if (!feedbackContext) {
    throw new Error('FeedbackContext must be used within FeedbackProvider');
  }

  const { childrenList, addFeedback } = feedbackContext;

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [feedback, setFeedback] = useState('');

  const sendFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert('Please enter your feedback before sending.');
      return;
    }
    if (selectedChild) {
      addFeedback(selectedChild.id, feedback);
      Alert.alert('Feedback sent!', 'Thank you for your feedback.');
      setFeedback('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Children</Text>

      <ScrollView horizontal style={styles.childList} showsHorizontalScrollIndicator={false}>
        {childrenList.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.circle,
              { backgroundColor: child.gender === 'Female' ? '#f48fb1' : '#4fa3f7' },
            ]}
            onPress={() => setSelectedChild(child)}
          >
            <View>
              <Text style={styles.circleText}>{child.name}</Text>
              <Text style={styles.circleText}>{child.surname}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedChild && (
        <View style={styles.detailBox}>
          <Text style={styles.detailText}>Name: {selectedChild.name}</Text>
          <Text style={styles.detailText}>Surname: {selectedChild.surname}</Text>
          <Text style={styles.detailText}>Birth Date: {selectedChild.birthDate}</Text>
          <Text style={styles.detailText}>Gender: {selectedChild.gender}</Text>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Write your feedback here..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendFeedback}>
            <Text style={styles.sendButtonText}>Send Feedback</Text>
          </TouchableOpacity>

          {/* Gönderilen feedbackleri göster */}
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Feedbacks:</Text>
          {selectedChild.feedbacks && selectedChild.feedbacks.length > 0 ? (
            selectedChild.feedbacks.map((fb, idx) => (
              <Text key={idx} style={{ marginBottom: 5 }}>
                - {fb}
              </Text>
            ))
          ) : (
            <Text>No feedbacks yet.</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ChildInfoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  childList: { flexDirection: 'row', marginBottom: 20 },
  circle: {
    borderRadius: 100,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  circleText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
  detailBox: { padding: 20, backgroundColor: '#eee', borderRadius: 10 },
  detailText: { fontSize: 16, marginBottom: 5 },
  feedbackInput: {
    marginTop: 15,
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: 10,
    backgroundColor: '#4fa3f7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
});
