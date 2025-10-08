import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ParentAddChildScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Child',
      headerTitleStyle: {
        color: '#888888',
        fontWeight: 'bold',
        fontSize: 18,
      },
    });
  }, [navigation]);

  const validateAndProceed = async () => {
    if (!firstName || !lastName || !studentCode || !password) {
      Alert.alert('Missing Information', 'Please fill in all the fields.');
      return;
    }

    setLoading(true);
    try {
      const parentIdString = await AsyncStorage.getItem('parent_id');
      if (!parentIdString) {
        Alert.alert('Error', 'Parent not logged in.');
        setLoading(false);
        return;
      }
      const parentData = JSON.parse(parentIdString);
      const parentId = typeof parentData === 'object' && parentData.id ? parentData.id : parentData;
      if (!parentId) {
        Alert.alert('Error', 'Invalid parent data.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://10.0.2.2:3000/parent/verify-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          studentCode,
          studentPassword: password,
          parentId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.message === 'Child already added.') {
          Alert.alert('Info', 'This child is already added. Redirecting you to dashboard.');
          navigation.replace('Dashboard');
        } else {
          Alert.alert('Success', 'Child matched. Redirecting to the survey screen.');
          navigation.replace('Survey', { child: data.child });
        }
      } else {
        Alert.alert('Error', data.message || 'Information did not match.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to server.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.iconTitleWrapper}>
          <Image source={require('./assets/child.png')} style={styles.icon} />
          <Text style={styles.title}>Child Verification</Text>
        </View>

        <Text style={styles.info}>
          Please enter the information provided by your teacher to verify your child.
        </Text>

        <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Student Code" value={studentCode} onChangeText={setStudentCode} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.customButton, loading && { opacity: 0.6 }]}
          onPress={validateAndProceed}
          disabled={loading}
        >
          <Text style={styles.customButtonText}>
            {loading ? 'Verifying...' : 'Verify & Fill Survey'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ParentAddChildScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  iconTitleWrapper: { alignItems: 'center', marginBottom: 12 },
  icon: { width: 75, height: 75, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#73c0ff' },
  info: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  customButton: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#2a6dfcb9',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: '#2a6dfcd8',
    alignItems: 'center',
  },
  customButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
