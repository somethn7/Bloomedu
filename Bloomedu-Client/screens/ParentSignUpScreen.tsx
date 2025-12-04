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
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!firstName || !surname || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all the fields.');
      return;
    }

    try {
      const response = await fetch(
        'https://bloomedu-production.up.railway.app/parent/signup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: firstName,
            surname: surname,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Verification Required',
          'A verification code has been sent to your email.'
        );

        navigation.navigate('ParentVerifyCode', {
          email,
          firstName,
          surname,
          password,
          originalCode: data.verificationCode,
        });
      } else {
        Alert.alert('Signup Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Server Error', 'Unable to connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Join Bloomedu for your child</Text>

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        placeholderTextColor="#B6B6B6"
      />

      <TextInput
        placeholder="Last Name"
        value={surname}
        onChangeText={setSurname}
        style={styles.input}
        placeholderTextColor="#B6B6B6"
      />

      <TextInput
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#B6B6B6"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#B6B6B6"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ParentSignupScreen;

const PINK = "#ff5fa2";   // ana pembe
const LIGHT_PINK = "#ffe3f0"; // soft arka plan

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: PINK,
    marginBottom: 5,
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 25,
    fontSize: 14,
  },

  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1.6,
    borderColor: "#ff9bcf",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  button: {
    backgroundColor: PINK,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    shadowColor: PINK,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#777",
    fontSize: 14,
  },

  linkBold: {
    color: PINK,
    fontWeight: "700",
  },
});
