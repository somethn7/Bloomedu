import React, { useState, useLayoutEffect } from 'react';
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

function AddChildScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');

  // Simüle edilmiş öğretmen veri tabanı
  const teacherChildList = [
    {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      studentCode: 'A1234',
      password: 'abc123',
    },
    {
      firstName: 'Zeynep',
      lastName: 'Kara',
      studentCode: 'Z5678',
      password: 'zey789',
    },
  ];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Child',
      headerTitleStyle: {
        color: '#888888', // Gri renk
        fontWeight: 'bold',
        fontSize: 18,
      },
    });
  }, [navigation]);

  const validateAndProceed = () => {
    if (!firstName || !lastName || !studentCode || !password) {
      Alert.alert('Missing Information', 'Please fill in all the fields.');
      return;
    }

    const matchedChild = teacherChildList.find(
      (child) =>
        child.firstName.toLowerCase() === firstName.toLowerCase() &&
        child.lastName.toLowerCase() === lastName.toLowerCase() &&
        child.studentCode === studentCode &&
        child.password === password
    );

    if (matchedChild) {
      Alert.alert('Success', 'Child matched. Redirecting to the survey screen.');
      navigation.navigate('Survey', { child: matchedChild });
    } else {
      Alert.alert('Error', 'Information did not match. Please check again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        {/* İkon ve Child Verification yazısı ekran içinde */}
        <View style={styles.iconTitleWrapper}>
          <Image
            source={require('./assets/child.png')} // ikon dosyanı buraya koy
            style={styles.icon}
          />
          <Text style={styles.title}>Child Verification</Text>
        </View>

        <Text style={styles.info}>
          Please enter the information provided by your teacher to verify your child.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Student Code"
          value={studentCode}
          onChangeText={setStudentCode}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.customButton} onPress={validateAndProceed}>
          <Text style={styles.customButtonText}>Verify & Fill Survey</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default AddChildScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  iconTitleWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 75,
    height: 75,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#73c0ff', // Açık mavi başlık rengi
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',  // Daha belirgin sınır
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  customButton: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#2a6dfcb9',  // Mavi border
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a6dfcd8',  // Mavi arka plan
    alignItems: 'center',
  },
  customButtonText: {
    color: '#fff',  // Beyaz yazı
    fontSize: 16,
    fontWeight: 'bold',
  },
});
