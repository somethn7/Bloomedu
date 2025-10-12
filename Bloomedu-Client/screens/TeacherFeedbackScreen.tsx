import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeacherFeedbackScreen = ({ route, navigation }: any) => {
  const { childId, childName, childSurname, parentId } = route.params || {};
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendFeedback = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a feedback message.');
      return;
    }

    setLoading(true);

    try {
      const teacherIdStr = await AsyncStorage.getItem('teacher_id');
      const teacherId = teacherIdStr ? Number(teacherIdStr) : null;
      if (!teacherId) {
        Alert.alert('Error', 'Teacher ID not found.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://bloomedu-backend.onrender.com/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          parent_id: parentId ?? undefined,
          teacher_id: teacherId,
          message: message,
        }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        // sunucu farklı format döndürdüyse
      }

      if (response.ok && data.success) {
        Alert.alert('Success', 'Feedback sent successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || `Failed to send feedback. (${response.status})`);
      }
    } catch (error) {
      console.error('Send feedback error:', error);
      Alert.alert('Error', 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Send Feedback</Text>
      <Text style={styles.subtitle}>
        For {childName} {childSurname}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your feedback here..."
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSendFeedback}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Feedback'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default TeacherFeedbackScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#2a4365', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#64748b', marginBottom: 20 },
  input: {
    height: 150,
    borderColor: '#64bef5',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fb3896c0',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
