import React, { useState, useLayoutEffect } from 'react';
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

const ParentVerifyCodeScreen = ({ navigation, route }: any) => {
  const { email } = route.params;  // sadece email almalısın
  const [code, setCode] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Parent Verify',
      headerTintColor: 'grey',
    });
  }, [navigation]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code.');
      return;
    }

    try {
      const response = await fetch('https://bloomedu-backend.onrender.com/parent/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),  // sadece email ve code gönder
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Your account has been verified.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'Verification failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error connecting to the server.');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Verification Code Sent</Text>
      <Text style={styles.subtitle}>
        Please enter the 6-digit code sent to your email.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default ParentVerifyCodeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#525253ff',
    marginTop: -40,
  },
  subtitle: { fontSize: 16, marginBottom: 25, textAlign: 'center', color: '#555' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    backgroundColor: 'white',
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: '#22f27fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3ea5e1a4',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
