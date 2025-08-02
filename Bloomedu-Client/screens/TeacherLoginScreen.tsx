import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeacherLoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Teacher Login',
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
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    try {
      const response = await fetch('http://10.0.2.2:3000/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.indexOf('application/json') !== -1) {
        data = await response.json();
      } else {
        Alert.alert('Error', 'Invalid server response.');
        return;
      }

      if (response.ok && data.teacherId) {
        // Burada teacherId objesi olarak saklıyoruz ki, diğer ekranlarda parse ettiğimizde id alınabilsin
        await AsyncStorage.setItem('loggedInTeacher', JSON.stringify({ id: data.teacherId }));
        await AsyncStorage.setItem('teacher_id', data.teacherId.toString());

        Alert.alert('Welcome', `Welcome, Teacher!`);

        navigation.navigate('TeacherStudents', { teacherId: data.teacherId });
      } else if (response.status === 401) {
        Alert.alert('Login Failed', data.message || 'Invalid email or password.');
      } else {
        Alert.alert('Login Failed', data.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to server');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image source={require('./assets/teacher.png')} style={styles.iconImage} />

        <Text style={styles.title}>Teacher Login</Text>

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
          onPress={() =>
            Alert.alert('Password Reset', 'Please contact support or use the reset screen.')
          }
        >
          <Text style={styles.forgotPasswordText}>
            Forgot your password? Tap here to reset.
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TeacherLoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center' },
  innerContainer: { marginHorizontal: 30 },
  iconImage: { width: 75, height: 75, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#64bef5ff', marginBottom: 40, textAlign: 'center' },
  input: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#64bef5ff',
    color: '#34495e',
  },
  button: {
    backgroundColor: '#64bef5ff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#73c0ffce',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  forgotPasswordText: {
    color: '#7a8a91',
    textAlign: 'center',
    marginTop: 25,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
