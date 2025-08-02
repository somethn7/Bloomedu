import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';

const TeacherAddChildScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [gender, setGender] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const countryList = [
    'Turkey', 'Germany', 'France', 'United Kingdom', 'United States',
    'Italy', 'Spain', 'Canada', 'Netherlands', 'Australia', 'Other'
  ];

  const genderOptions = [
    'Male', 'Female', 'Other', 'Prefer not to say'
  ];

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const stored = await AsyncStorage.getItem('loggedInTeacher');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Loaded teacher from AsyncStorage:', parsed);
          if (parsed?.id) {
            setTeacherId(parsed.id.toString());
          } else {
            Alert.alert('Error', 'Teacher info corrupted. Please login again.');
            navigation.navigate('TeacherLoginScreen');
          }
        } else {
          Alert.alert('Error', 'Teacher not logged in. Please login again.');
          navigation.navigate('TeacherLoginScreen');
        }
      } catch (e) {
        console.error('Error reading teacher from AsyncStorage:', e);
        Alert.alert('Error', 'Failed to load teacher info. Please login again.');
        navigation.navigate('TeacherLoginScreen');
      }
    };
    fetchTeacher();
  }, []);

  const generateCode = () => {
    return uuid.v4().toString().slice(0, 8);
  };

  const isValidDate = (dateStr: string) => {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) return false;
    if (day < 1) return false;

    const maxDays = [
      31,
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    if (day > maxDays[month - 1]) return false;

    return true;
  };

  const isValidEmail = (email: string) => {
    const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicRegex.test(email)) return false;

    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const domain = parts[1];
    if (!domain.includes('.')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;

    const domainParts = domain.split('.');
    if (domainParts.some((part) => part.trim() === '')) return false;

    return true;
  };

  const handleSave = async () => {
    console.log('Attempting to save student, teacherId:', teacherId);

    if (!teacherId) {
      Alert.alert('Error', 'Teacher ID is missing. Please login again.');
      return;
    }

    if (
      !name.trim() ||
      !surname.trim() ||
      !birthdate.trim() ||
      !birthplace ||
      !gender ||
      !diagnosisDate.trim() ||
      !parentEmail.trim()
    ) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (!isValidDate(birthdate)) {
      Alert.alert('Invalid Date', 'Birthdate must be in DD-MM-YYYY format and valid.');
      return;
    }

    if (!isValidDate(diagnosisDate)) {
      Alert.alert('Invalid Date', 'Diagnosis Date must be in DD-MM-YYYY format and valid.');
      return;
    }

    if (!isValidEmail(parentEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const student_code = generateCode();
    const student_password = generateCode();

    try {
      const bodyData = {
        name,
        surname,
        birthdate,
        birthplace,
        gender,
        diagnosis_date: diagnosisDate,
        communication_notes: communicationNotes,
        teacher_id: teacherId,
        parent_email: parentEmail,
        student_code,
        student_password,
      };

      console.log('Sending /add-child body:', bodyData);

      const response = await fetch('http://10.0.2.2:3000/add-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
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
        setParentEmail('');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Server error');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to server');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
      <Text style={styles.title}>Add New Student</Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={surname}
        onChangeText={setSurname}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Birthdate (DD-MM-YYYY)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 15-08-2010"
        value={birthdate}
        onChangeText={setBirthdate}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Birthplace</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={birthplace}
          onValueChange={(itemValue) => setBirthplace(itemValue)}
        >
          <Picker.Item label="Select country..." value="" />
          {countryList.map((country) => (
            <Picker.Item key={country} label={country} value={country} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Select gender..." value="" />
          {genderOptions.map((g) => (
            <Picker.Item key={g} label={g} value={g} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Diagnosis Date (DD-MM-YYYY)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 01-01-2020"
        value={diagnosisDate}
        onChangeText={setDiagnosisDate}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Communication Notes (Optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Communication Notes (Optional)"
        value={communicationNotes}
        onChangeText={setCommunicationNotes}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Parent Email</Text>
      <TextInput
        style={styles.input}
        placeholder="example@gmail.com"
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
  label: {
    fontWeight: '600',
    marginBottom: 6,
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
  pickerContainer: {
    borderColor: '#64bef5ff',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
