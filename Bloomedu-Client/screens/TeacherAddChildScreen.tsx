import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

// -umut: (22.11.2025) Redesigned Teacher Add Child screen with organized cards
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
  const [loading, setLoading] = useState(false);

  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [showDiagnosisPicker, setShowDiagnosisPicker] = useState(false);
  const [birthdateObj, setBirthdateObj] = useState<Date>(new Date());
  const [diagnosisDateObj, setDiagnosisDateObj] = useState<Date>(new Date());

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

  const formatDateForBackend = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`; 
  };

  const formatDateForUi = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    return `${day}-${month}-${year}`;
  };

  const parseDdMmYyyy = (s: string) => {
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const onBirthdateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowBirthdatePicker(false);
    if (date) {
      setBirthdateObj(date);
      setBirthdate(formatDateForUi(date));
    }
  };

  const onDiagnosisDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDiagnosisPicker(false);
    if (date) {
      setDiagnosisDateObj(date);
      setDiagnosisDate(formatDateForUi(date));
    }
  };

  const handleSave = async () => {
    if (!teacherId) {
      Alert.alert('Error', 'Teacher ID is missing. Please login again.');
      return;
    }

    if (!name || !surname || !birthdate || !birthplace || !gender || !diagnosisDate || !parentEmail) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const student_code = generateCode();
    const student_password = generateCode();

    const bodyData = {
      name,
      surname,
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
        
        setName('');
        setSurname('');
        setBirthdate('');
        setBirthplace('');
        setGender('');
        setDiagnosisDate('');
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Birthdate</Text>
                <Pressable
                  onPress={() => {
                    const parsed = parseDdMmYyyy(birthdate);
                    if (parsed) setBirthdateObj(parsed);
                    setShowBirthdatePicker(true);
                  }}
                  style={styles.dateInput}
                >
                  <Text style={styles.dateText}>
                    {birthdate ? birthdate : 'Select date 📅'}
                  </Text>
                </Pressable>
              </View>

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
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diagnosis Date</Text>
                <Pressable
                  onPress={() => {
                    const parsed = parseDdMmYyyy(diagnosisDate);
                    if (parsed) setDiagnosisDateObj(parsed);
                    setShowDiagnosisPicker(true);
                  }}
                  style={styles.dateInput}
                >
                  <Text style={styles.dateText}>
                    {diagnosisDate ? diagnosisDate : 'Select date 📅'}
                  </Text>
                </Pressable>
              </View>

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

      {/* Android native pickers */}
      {showBirthdatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={birthdateObj}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={onBirthdateChange}
        />
      )}
      {showDiagnosisPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={diagnosisDateObj}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={onDiagnosisDateChange}
        />
      )}

      {/* iOS modal pickers */}
      <Modal
        visible={showBirthdatePicker && Platform.OS === 'ios'}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBirthdatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Birthdate</Text>
            <DateTimePicker
              value={birthdateObj}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={onBirthdateChange}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setShowBirthdatePicker(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  setBirthdate(formatDateForUi(birthdateObj));
                  setShowBirthdatePicker(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDiagnosisPicker && Platform.OS === 'ios'}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDiagnosisPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Diagnosis Date</Text>
            <DateTimePicker
              value={diagnosisDateObj}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={onDiagnosisDateChange}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setShowDiagnosisPicker(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  setDiagnosisDate(formatDateForUi(diagnosisDateObj));
                  setShowDiagnosisPicker(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 22, // Daha büyük başlık
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
    marginBottom: 18, // Geniş boşluk
  },
  label: {
    fontSize: 14, // Daha okunaklı font
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
    paddingVertical: 14, // Daha yüksek input
    fontSize: 16, // Daha büyük yazı
    color: '#2D3748',
    minHeight: 50, // Minimum yükseklik garantisi
  },
  dateInput: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2D3748',
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
    paddingVertical: 18, // Daha büyük buton
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginLeft: 10,
  },
  modalBtnGhost: {
    backgroundColor: '#E2E8F0',
  },
  modalBtnPrimary: {
    backgroundColor: '#4DABF7',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
});
