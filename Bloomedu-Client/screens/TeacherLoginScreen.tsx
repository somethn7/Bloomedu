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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeacherLoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = async () => {
    console.log('🟦 Login button pressed');
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    try {
      console.log('🔹 Sending login request to backend...');
      const response = await fetch('https://bloomedu-production.up.railway.app/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔸 Response status:', response.status);

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.indexOf('application/json') !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('⚠️ Response is not JSON:', text);
        Alert.alert('Error', 'Invalid server response.');
        return;
      }

      console.log('✅ Backend response:', data);

      if (response.ok && data.teacherId) {
        await AsyncStorage.setItem('loggedInTeacher', JSON.stringify({ id: data.teacherId }));
        await AsyncStorage.setItem('teacher_id', data.teacherId.toString());
        console.log('👩‍🏫 Logged in as teacherId:', data.teacherId);

        navigation.navigate('WelcomeSuccess', {
          role: 'teacher',
          nextScreen: 'TeacherStudents',
          nextParams: { teacherId: data.teacherId },
          name: data.name || 'Teacher',
        });

      } else if (response.status === 401) {
        Alert.alert('Login Failed', data.message || 'Invalid email or password.');
      } else {
        Alert.alert('Login Failed', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Network or unexpected error:', error);
      Alert.alert('Network Error', 'Could not connect to server.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.iconEmoji}>👩‍🏫</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.title}>Teacher Login</Text>
          <Text style={styles.subtitle}>Access your classroom dashboard</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert('Password Reset', 'Please contact support for password reset assistance.')
            }
            style={styles.forgotPasswordLink}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
            <Text style={styles.loginButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📚</Text>
          <Text style={styles.infoText}>
            Monitor student progress, send feedback to parents, and manage your classroom efficiently.
          </Text>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportText}>Need help? Contact support</Text>
          <Text style={styles.supportEmail}>support@bloomedu.com</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TeacherLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#4ECDC4',
    fontWeight: '700',
  },
  headerSection: {
    paddingTop: 120,
    paddingBottom: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 70,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    color: '#2D3748',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  loginButtonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E6FFFA',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  supportSection: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  supportText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 6,
  },
  supportEmail: {
    fontSize: 15,
    color: '#4ECDC4',
    fontWeight: '700',
  },
});
