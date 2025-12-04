import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

const ParentSignupScreen = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const handleSignup = async () => {
    if (!firstName || !surname || !email || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(
        "https://bloomedu-production.up.railway.app/parent/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: firstName,
            surname,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert(
          "Verification Required",
          "A verification code was sent to your email."
        );
        navigation.navigate("ParentVerifyCode", {
          email,
          firstName,
          surname,
          password,
          originalCode: data.verificationCode,
        });
      } else {
        Alert.alert("Signup Failed", data.message || "Something went wrong.");
      }
    } catch (err) {
      console.log("Signup error:", err);
      Alert.alert("Server Error", "Unable to reach the server.");
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER — SAME STYLE AS OTHER PARENT SCREENS */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sign Up</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput
          placeholder="First Name"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          placeholder="Last Name"
          style={styles.input}
          value={surname}
          onChangeText={setSurname}
        />

        <TextInput
          placeholder="Email Address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.loginBold}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ParentSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  /* HEADER — SAME AS ParentChildrenOverview */
  header: {
    backgroundColor: "#FF6B9A",
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  content: {
    padding: 20,
    paddingTop: 30,
  },

  subtitle: {
    fontSize: 18,
    color: "#7A003C",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#FFA6C9",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 16,
  },

  signupButton: {
    backgroundColor: "#FF6B9A",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },

  signupText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  loginLink: {
    marginTop: 18,
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },

  loginBold: {
    color: "#FF6B9A",
    fontWeight: "700",
  },
});
