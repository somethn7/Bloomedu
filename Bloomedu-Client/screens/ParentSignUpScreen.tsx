import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const ParentSignupScreen = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // E-posta format kontrolü (Regex)
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Şifre güvenlik kontrolü (En az 8 karakter, harf ve sayı)
  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[A-Za-z]/.test(pass) && /[0-9]/.test(pass);
  };

  const handleSignup = async () => {
    // 1. Boş Alan Kontrolü
    if (!firstName.trim() || !surname.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    // 2. Email Validasyonu
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // 3. Şifre Gücü Kontrolü
    if (!validatePassword(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and include both letters and numbers."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "https://bloomedu-production.up.railway.app/parent/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: firstName.trim(),
            surname: surname.trim(),
            email: email.toLowerCase().trim(),
            password: password, // Sunucu tarafında mutlaka hashlenmelidir
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
          email: email.toLowerCase().trim(),
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
      Alert.alert("Server Error", "Unable to reach the server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* HEADER */}
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Create your parent account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            placeholder="Enter your name"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            placeholder="Enter your surname"
            style={styles.input}
            value={surname}
            onChangeText={setSurname}
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            placeholder="name@example.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            placeholder="Min. 8 chars with letters & numbers"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.disabledButton]} 
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.loginBold}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ParentSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#7A003C",
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#FFA6C9",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    fontSize: 16,
    color: "#333",
  },
  signupButton: {
    backgroundColor: "#FF6B9A",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#FF6B9A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signupText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loginLink: {
    marginTop: 20,
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
  },
  loginBold: {
    color: "#FF6B9A",
    fontWeight: "700",
  },
});