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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Login',
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      // Buradaki URL'yi backend ile aynı hale getirdik (tekil "parent")
      const response = await fetch('http://10.0.2.2:3000/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.parentId) {
          await AsyncStorage.setItem('parentData', JSON.stringify(data.parentId));
          Alert.alert('Success', `Welcome!`);
          navigation.navigate('Dashboard');
        } else {
          Alert.alert('Error', data.message || 'User not found.');
        }
      } else if (response.status === 401) {
        Alert.alert('Error', 'User not found or incorrect password.');
      } else {
        Alert.alert('Error', data.message || 'Login failed.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Cannot connect to server.');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image source={require('./assets/parent.png')} style={styles.iconImage} />
        <Text style={styles.title}>Parent Login</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#7a8a91"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#7a8a91"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.signUpLinkContainer}
        >
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  innerContainer: {
    marginHorizontal: 30,
  },
  iconImage: {
    width: 75,
    height: 75,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fb3896c0',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fb389681',
    color: '#34495e',
  },
  button: {
    backgroundColor: '#fb389674',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
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
  signUpLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signUpText: {
    color: '#5a6e72',
    fontSize: 14,
  },
  signUpLink: {
    color: '#ff73c7ff',
    fontSize: 14,
    fontWeight: '700',
  },
});
