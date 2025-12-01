import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function ParentVerifyResetCodeScreen({ route, navigation }: any) {
  const { email } = route.params;
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    if (!code || !newPassword) {
      Alert.alert("Error", "Please enter the code and new password.");
      return;
    }

    try {
      const res = await fetch(
        "https://bloomedu-production.up.railway.app/parent/reset-password", // NO TRAILING SLASH
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        }
      );

      let data;

      // SAFE JSON PARSE → backend bazen HTML dönerse sorun çıkmasın
      try {
        data = await res.json();
      } catch {
        Alert.alert("Error", "Invalid response from server.");
        return;
      }

      if (res.ok) {
        Alert.alert("Success", "Password changed successfully!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", data?.message || "Invalid code.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Code</Text>

      <TextInput
        placeholder="Enter Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 25,
    color: "#fb3896c0",
    textAlign: "center",
  },
  input: {
    padding: 15,
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fb389681",
  },
  button: {
    backgroundColor: "#fb389674",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
