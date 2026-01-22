import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Assuming you have this library installed

const { width } = Dimensions.get('window');

// --- HELPER DATE FUNCTIONS ---

// Converts Date object to YYYY-MM-DD string for the backend API
const dateToBackendFormat = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Converts Date object to DD-MM-YYYY string for the UI display
const dateToDisplayFormat = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

// Calculates age in full years
const getAgeInYears = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};
// --- HELPER DATE FUNCTIONS END ---


const TeacherAddChildScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  // Dates are now stored as Date objects
  const [birthdate, setBirthdate] = useState<Date | null>(null); 
  const [diagnosisDate, setDiagnosisDate] = useState<Date | null>(null);
  
  // State for DatePicker visibility
  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [showDiagnosisDatePicker, setShowDiagnosisDatePicker] = useState(false);
  
  const [birthplace, setBirthplace] = useState('');
  const [gender, setGender] = useState('');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const countryList = [
    'Turkey', 'Germany', 'France', 'United Kingdom', 'United States',
    'Italy', 'Spain', 'Canada', 'Netherlands', 'Australia', 'Other'
  ];

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  useEffect(() => {
    const fetchTeacher = async () => {
      // (AsyncStorage logic remains the same)
      try {
        const stored = await AsyncStorage.getItem('loggedInTeacher');
        if (stored) {
          const parsed = JSON.parse(stored);
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
        console.error('❌ Error reading teacher from AsyncStorage:', e);
        Alert.alert('Error', 'Failed to load teacher info. Please login again.');
        navigation.navigate('TeacherLoginScreen');
      }
    };
    fetchTeacher();
  }, []);

  const generateCode = () => uuid.v4().toString().slice(0, 8);

  // Function to format Date object for API call (YYYY-MM-DD)
  const formatDateForBackend = (date: Date) => {
    return dateToBackendFormat(date);
  };
  
  // Function to display date string for UI
  const renderDate = (date: Date | null, placeholder: string) => {
    return date ? dateToDisplayFormat(date) : placeholder;
  };

  // --- Birthdate Picker Logic (4-8 years validation) ---
  const handleBirthdateChange = (event: any, selectedDate?: Date) => {
    setShowBirthdatePicker(false);
    if (selectedDate) {
      const age = getAgeInYears(selectedDate);
      
      // 4-8 Year Age Restriction
      if (age < 4 || age > 8) {
        Alert.alert('Validation Error', 'The child\'s age must be between 4 and 8 years old.');
        setBirthdate(null);
        return;
      }

      setBirthdate(selectedDate);

      // Check Diagnosis Date consistency if Birthdate is updated
      if (diagnosisDate && selectedDate > diagnosisDate) {
         Alert.alert('Warning', 'Birthdate updated. Diagnosis date must be on or after the Birthdate.');
         setDiagnosisDate(null); // Reset diagnosis date if inconsistent
      }
    }
  };
  
  // --- Diagnosis Date Picker Logic (Cannot be before Birthdate) ---
  const handleDiagnosisDateChange = (event: any, selectedDate?: Date) => {
    setShowDiagnosisDatePicker(false);
    if (selectedDate) {
      if (!birthdate) {
        Alert.alert('Error', 'Please select the Birthdate first.');
        return;
      }
      
      // Diagnosis Date > Birthdate Restriction
      if (selectedDate < birthdate) {
        Alert.alert('Validation Error', 'The Diagnosis Date cannot be before the Birthdate.');
        setDiagnosisDate(null);
      } else {
        setDiagnosisDate(selectedDate);
      }
    }
  };


  const handleSave = async () => {
    if (!teacherId) {
      Alert.alert('Error', 'Teacher ID is missing. Please login again.');
      return;
    }

    // Check if Date objects exist
    if (!name || !surname || !birthdate || !birthplace || !gender || !diagnosisDate || !parentEmail) {
      Alert.alert('Missing Fields', 'Please fill in all required fields and select dates.');
      return;
    }
    
    // Redundant Frontend Validation check (Backend will also enforce this)
    const age = getAgeInYears(birthdate);
    if (age < 4 || age > 8) {
        Alert.alert('Validation Error', 'Child\'s age must be between 4 and 8 years old.');
        return;
    }
    if (diagnosisDate < birthdate) {
         Alert.alert('Validation Error', 'Diagnosis Date cannot be before Birthdate.');
         return;
    }


    setLoading(true);
    const student_code = generateCode();
    const student_password = generateCode();

    const bodyData = {
      name,
      surname,
      // Format Date objects for backend
      birthdate: formatDateForBackend(birthdate),
      birthplace,
      gender,
      diagnosis_date: formatDateForBackend(diagnosisDate),
      communication_notes: communicationNotes,
      teacher_id: teacherId,
      parent_email: parentEmail,
      student_code,
      student_password,
    };

    try {
      const response = await fetch('https://bloomedu-production.up.railway.app/teacher/add-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (response.ok) {
        Alert.alert(
          'Success',
          `Student added successfully!\n\nCode: ${student_code}\nPassword: ${student_password}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        
        // Clear form
        setName('');
        setSurname('');
        setBirthdate(null);
        setBirthplace('');
        setGender('');
        setDiagnosisDate(null);
        setCommunicationNotes('');
        setParentEmail('');
      } else {
        Alert.alert('Error', data.message || 'Server error');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  // --- UI RENDER ---
  return (
    <View style={styles.container}>
      {/* Header - Geniş ve Ferah */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Student</Text>
        <View style={{ width: 45 }} /> 
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Section 1: Student Info */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>👤 Student Info</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Surname"
                    value={surname}
                    onChangeText={setSurname}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
              </View>

              {/* --- BIRTHDATE: Date Picker UI --- */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Birthdate (4-8 Year Restriction)</Text>
                <TouchableOpacity
                  style={styles.input} 
                  onPress={() => setShowBirthdatePicker(true)}
                >
                  <Text style={{ 
                      fontSize: 16, 
                      color: birthdate ? '#2D3748' : '#A0AEC0' 
                  }}>
                    {renderDate(birthdate, 'Select Date (DD-MM-YYYY)')}
                  </Text>
                </TouchableOpacity>
                {showBirthdatePicker && (
                    <DateTimePicker
                        testID="birthdatePicker"
                        // If no date is selected, initialize to a valid default date (e.g., 5 years ago)
                        value={birthdate || new Date(new Date().setFullYear(new Date().getFullYear() - 5))} 
                        mode="date"
                        display="default"
                        onChange={handleBirthdateChange}
                        // Max date: Children older than 8 years cannot register (4 years ago is the latest date)
                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 4))}
                        // Min date: Children younger than 4 years cannot register (9 years ago is the earliest date)
                        minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 9))}
                    />
                )}
                <Text style={styles.helperText}>The child must be between 4 and 8 years old at the time of registration.</Text>
              </View>
              {/* --- BIRTHDATE END --- */}


              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker 
                      selectedValue={gender} 
                      onValueChange={setGender}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select" value="" color="#999" />
                      {genderOptions.map((g) => (
                        <Picker.Item key={g} label={g} value={g} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Birthplace</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker 
                      selectedValue={birthplace} 
                      onValueChange={setBirthplace}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select" value="" color="#999" />
                      {countryList.map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 2: Clinical Info */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>🏥 Clinical Info</Text>
              
              {/* --- DIAGNOSIS DATE: Date Picker UI --- */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diagnosis Date</Text>
                 <TouchableOpacity
                  style={styles.input} 
                  onPress={() => setShowDiagnosisDatePicker(true)}
                  disabled={!birthdate} // Disable if birthdate is not selected
                >
                  <Text style={{ 
                      fontSize: 16, 
                      color: diagnosisDate ? '#2D3748' : '#A0AEC0' 
                  }}>
                    {renderDate(diagnosisDate, birthdate ? 'Select Date (DD-MM-YYYY)' : 'Select Birthdate First')}
                  </Text>
                </TouchableOpacity>
                {showDiagnosisDatePicker && (
                    <DateTimePicker
                        testID="diagnosisDatePicker"
                        value={diagnosisDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDiagnosisDateChange}
                        // Restriction: Cannot be before birthdate
                        minimumDate={birthdate || new Date(1950, 0, 1)} 
                        // Restriction: Cannot be in the future
                        maximumDate={new Date()} 
                    />
                )}
                <Text style={styles.helperText}>Diagnosis date must be on or after the Birthdate.</Text>
              </View>
              {/* --- DIAGNOSIS DATE END --- */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Communication notes..."
                  value={communicationNotes}
                  onChangeText={setCommunicationNotes}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>

            {/* Section 3: Parent Contact */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>✉️ Parent Contact</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  value={parentEmail}
                  onChangeText={setParentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A0AEC0"
                />
                <Text style={styles.helperText}>Credentials will be sent to this email.</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.saveButtonIcon}>💾</Text>
                  <Text style={styles.saveButtonText}>Save Student</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default TeacherAddChildScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4DABF7', // Teacher Blue
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4DABF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 50,
    justifyContent: 'center', // Added for centered text in TouchableOpacity
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  pickerWrapper: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    height: 52,
  },
  picker: {
    height: 52,
    width: '100%',
  },
  helperText: {
    fontSize: 13,
    color: '#718096',
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#4DABF7',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4DABF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  saveButtonIcon: {
    fontSize: 22,
  },
});