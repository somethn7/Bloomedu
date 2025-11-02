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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParentLoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('https://bloomedu-production.up.railway.app/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.parentId) {
          await AsyncStorage.setItem('parent_id', data.parentId.toString());
          navigation.navigate('WelcomeSuccess', {
            role: 'parent',
            nextScreen: 'Dashboard',
            nextParams: {},
            name: data.name || 'Parent',
          });
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
          <Text style={styles.iconEmoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.title}>Parent Login</Text>
          <Text style={styles.subtitle}>Sign in to track your child's progress</Text>
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
            onPress={() => navigation.navigate('ParentForgotPassword')}
            style={styles.forgotPasswordLink}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
            <Text style={styles.loginButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Section */}
        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            style={styles.signUpButton}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Track learning progress, manage children, and receive teacher feedback all in one place.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ParentLoginScreen;

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
    color: '#FF6B9A',
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
    color: '#FF6B9A',
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
    color: '#FF6B9A',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FF6B9A',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9A',
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
  signUpSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 12,
  },
  signUpButton: {
    borderWidth: 2,
    borderColor: '#FF6B9A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  signUpButtonText: {
    color: '#FF6B9A',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F7',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9A',
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
});
