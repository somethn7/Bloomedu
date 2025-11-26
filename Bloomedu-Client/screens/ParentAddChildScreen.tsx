import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// -umut: (22.11.2025) Redesigned Parent Add Child screen to match dashboard style
function ParentAddChildScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
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
      
      const response = await fetch('https://bloomedu-production.up.railway.app/parent/verify-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          studentCode: studentCode.trim(),
          studentPassword: password.trim(),
          parentId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.message === 'Child already added.') {
          Alert.alert('Info', 'This child is already added. Redirecting you to dashboard.');
          navigation.replace('Dashboard');
        } else {
          Alert.alert('Success', 'Child verified successfully! Redirecting to survey.');
          navigation.replace('Survey', { child: data.child });
        }
      } else {
        Alert.alert('Verification Failed', data.message || 'Information did not match. Please check your entry.');
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
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Child</Text>
          <View style={{ width: 45 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.headerIcon}>👶</Text>
            </View>
            <Text style={styles.description}>
              Enter the details provided by your teacher to link your child's account.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Ali" 
                value={firstName} 
                onChangeText={setFirstName} 
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Yilmaz" 
                value={lastName} 
                onChangeText={setLastName} 
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Code</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 12345678" 
                value={studentCode} 
                onChangeText={setStudentCode} 
                autoCapitalize="none"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              onPress={validateAndProceed}
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
              {!loading && <Text style={styles.buttonArrow}>→</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ParentAddChildScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FF6B9A',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#FF6B9A',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIcon: {
    fontSize: 40,
  },
  description: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  verifyButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
