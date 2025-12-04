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

const ParentVerifyCodeScreen = ({ navigation, route }: any) => {
  const { email } = route.params;
  const [code, setCode] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // kendi header’ımızı kullanıyoruz
    });
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code.');
      return;
    }

    try {
      const response = await fetch(
        'https://bloomedu-production.up.railway.app/parent/verify-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Your account has been verified.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'Verification failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Verify Email</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Verification Code Sent</Text>

            <Text style={styles.subtitle}>
              Please enter the 6-digit code we sent to:
            </Text>

           

            <TextInput
              style={styles.input}
              placeholder="Enter Code"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              placeholderTextColor="#9aa5ab"
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default ParentVerifyCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F7F5',
  },

  /* HEADER */
  header: {
    backgroundColor: '#22C7B8',
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },

  /* CONTENT */
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 20,
    marginTop: -40,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D3B3A',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#506c6a',
    marginBottom: 6,
  },

  emailText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#22A7A0',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1.5,
    borderColor: '#AEE8E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#F8FFFF',
    marginBottom: 25,
    color: '#1d3b3a',
  },

  button: {
    backgroundColor: '#22C7B8',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#22C7B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
