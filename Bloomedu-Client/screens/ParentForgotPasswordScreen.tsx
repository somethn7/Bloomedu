import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const ParentForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    try {
      console.log("🔄 handleRequestReset — initiating request for email:", email);
      const response = await fetch('https://bloomedu-backend.onrender.com/parent/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      console.log("🔁 handleRequestReset — response status:", response.status);

      const raw = await response.text();
      console.log("🔁 handleRequestReset — raw response text:", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (parseError) {
        console.error("⚠️ handleRequestReset — JSON parse failed:", parseError, " — raw:", raw);
        Alert.alert('Error', 'Invalid response from server.');
        return;
      }

      console.log("🔁 handleRequestReset — parsed response data:", data);

      if (response.ok) {
        setCodeSent(true);
        Alert.alert('Success', data.message || 'Verification code sent to your email.');
      } else {
        Alert.alert('Error', data.message || 'Failed to send code.');
      }
    } catch (error: any) {
      console.error("❌ handleRequestReset network error:", error);
      Alert.alert('Network Error', 'Could not connect to server. ' + (error.message || ''));
    }
  };

  const handleResetPassword = async () => {
    if (!verificationCode || !newPassword) {
      Alert.alert('Error', 'Please enter the code and new password.');
      return;
    }
    try {
      console.log("🔄 handleResetPassword — sending code & new password", { email, verificationCode, newPassword });
      const response = await fetch('http://10.0.2.2:3000/parent/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode,
          newPassword,
        }),
      });
      console.log("🔁 handleResetPassword — response status:", response.status);

      const raw = await response.text();
      console.log("🔁 handleResetPassword — raw response text:", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (parseError) {
        console.error("⚠️ handleResetPassword — JSON parse failed:", parseError, " — raw:", raw);
        Alert.alert('Error', 'Invalid response from server.');
        return;
      }

      console.log("🔁 handleResetPassword — parsed response data:", data);

      if (response.ok) {
        Alert.alert('Success', data.message || 'Password reset successfully.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      console.error("❌ handleResetPassword network error:", error);
      Alert.alert('Network Error', 'Could not connect to server. ' + (error.message || ''));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#7a8a91"
        />
        {codeSent && (
          <>
            <TextInput
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#7a8a91"
            />
            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#7a8a91"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={codeSent ? handleResetPassword : handleRequestReset}
        >
          <Text style={styles.buttonText}>
            {codeSent ? 'Reset Password' : 'Send Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ParentForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  innerContainer: {
    marginHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fb3896c0',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fb389681',
    color: '#34495e',
  },
  button: {
    backgroundColor: '#fb389674',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#fb389674',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
