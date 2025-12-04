import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const ParentForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    try {
      const response = await fetch(
        "https://bloomedu-production.up.railway.app/parent/request-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCodeSent(true);
        Alert.alert("Success", data.message || "Verification code sent.");
      } else {
        Alert.alert("Error", data.message || "Could not send code.");
      }
    } catch (error: any) {
      Alert.alert("Network Error", error.message || "Could not connect.");
    }
  };

  const handleResetPassword = async () => {
    if (!verificationCode || !newPassword) {
      Alert.alert("Error", "Please enter the code and new password.");
      return;
    }

    try {
      const response = await fetch(
        "https://bloomedu-production.up.railway.app/parent/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code: verificationCode,
            newPassword,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Password reset successfully.");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", data.message || "Could not reset password.");
      }
    } catch (error: any) {
      Alert.alert("Network Error", error.message || "Could not connect.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ===== CENTER CARD ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email to receive a verification code.
        </Text>

        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#9b9b9b"
        />

        {codeSent && (
          <>
            <TextInput
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor="#9b9b9b"
            />

            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9b9b9b"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={codeSent ? handleResetPassword : handleRequestReset}
        >
          <Text style={styles.buttonText}>
            {codeSent ? "Reset Password" : "Send Code"}
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
    backgroundColor: "#fafafa",
    alignItems: "center",
  },

  /* ===== HEADER ===== */
  header: {
    width: "100%",
    backgroundColor: "#FF6B9A",
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  /* ===== CARD ===== */
  card: {
    width: "88%",
    backgroundColor: "#fff",
    paddingVertical: 38,
    paddingHorizontal: 28,
    borderRadius: 22,
    marginTop: 60,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF6B9A",
    textAlign: "center",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    textAlign: "center",
    color: "#6a6a6a",
    marginBottom: 25,
  },

  /* ===== INPUT ===== */
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ff8ab5",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  /* ===== BUTTON ===== */
  button: {
    backgroundColor: "#FF6B9A",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 5,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
