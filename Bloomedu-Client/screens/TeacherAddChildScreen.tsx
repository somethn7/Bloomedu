import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const TeacherAddChildScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [gender, setGender] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [parentEmail, setParentEmail] = useState('');           // <-- Yeni
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      const stored = await AsyncStorage.getItem('loggedInTeacher');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTeacherId(parsed.id);
      }
    };
    fetchTeacher();
  }, []);

  const generateCode = () => {
    return uuid.v4().toString().slice(0, 8);
  };

  const handleSave = async () => {
    if (
      !name ||
      !surname ||
      !birthdate ||
      !birthplace ||
      !gender ||
      !diagnosisDate ||
      !parentEmail                                         // <-- Kontrol eklendi
    ) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const student_code = generateCode();
    const student_password = generateCode();

    try {
      const response = await fetch('http://10.0.2.2:3000/add-child', {  // <-- URL güncellendi
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname,
          birthdate,
          birthplace,
          gender,
          diagnosis_date: diagnosisDate,
          communication_notes: communicationNotes,
          teacher_id: teacherId,
          parent_email: parentEmail,                           // <-- Burada gönderiliyor
          student_code,
          student_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          `Student added.\nCode: ${student_code}\nPassword: ${student_password}`
        );
        setName('');
        setSurname('');
        setBirthdate('');
        setBirthplace('');
        setGender('');
        setDiagnosisDate('');
        setCommunicationNotes('');
        setParentEmail('');                                  // <-- Sıfırla
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Server error');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to server');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Student</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Birthdate (DD-MM-YYYY)"
        value={birthdate}
        onChangeText={setBirthdate}
      />
      <TextInput
        style={styles.input}
        placeholder="Birthplace"
        value={birthplace}
        onChangeText={setBirthplace}
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholder="Diagnosis Date (DD-MM-YYYY)"
        value={diagnosisDate}
        onChangeText={setDiagnosisDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Communication Notes (Optional)"
        value={communicationNotes}
        onChangeText={setCommunicationNotes}
      />
      <TextInput
        style={styles.input}
        placeholder="Parent Email"
        value={parentEmail}
        onChangeText={setParentEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Student</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeacherAddChildScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#64bef5ff',
  },
  input: {
    borderColor: '#64bef5ff',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
});
