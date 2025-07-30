import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const ParentSignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all the fields.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/parent/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Verification Required',
          'We have sent a verification code to your email. Please enter the code to complete your registration.'
        );
        navigation.navigate('ParentVerifyCode', { email: email, name, password, originalCode: data.verificationCode });
      } else {
        Alert.alert('Signup Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Server Error', 'Unable to connect to the server.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Sign Up</Text>
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ParentSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fb3896c0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fb389681',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#fb389674',
    padding: 16,
    borderRadius: 30,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#fb389674',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    color: '#ff73c7ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
