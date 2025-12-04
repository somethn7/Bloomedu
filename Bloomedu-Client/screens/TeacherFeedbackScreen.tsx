import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TeacherFeedbackScreen = ({ route, navigation }: any) => {
  const {
    childId,
    childName,
    childSurname,
    parentName,
    parentSurname
  } = route.params || {};

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const fetchHistory = async () => {
    try {
      const teacherIdStr = await AsyncStorage.getItem("teacher_id");
      const teacherId = teacherIdStr ? Number(teacherIdStr) : null;

      const res = await fetch(
        `https://bloomedu-production.up.railway.app/feedbacks/by-teacher/${teacherId}/${childId}`
      );

      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      const teacherIdStr = await AsyncStorage.getItem("teacher_id");
      const teacherId = teacherIdStr ? Number(teacherIdStr) : null;

      const res = await fetch(
        "https://bloomedu-production.up.railway.app/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            child_id: childId,
            parent_id: 0,
            teacher_id: teacherId,
            message: message.trim(),
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setMessage("");
        fetchHistory();
      }
    } catch (err) {
      console.error("Send error:", err);
    }

    setLoading(false);
  };

  const renderFeedback = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardLeftBorder} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>Feedback</Text>
        <Text style={styles.cardMessage}>{item.message}</Text>
        <Text style={styles.cardDate}>{item.created_at}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Feedback</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* CHILD + PARENT */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>
          Child: {childName} {childSurname}
        </Text>
        <Text style={styles.infoSubtitle}>
          Parent: {parentName || "Parent"} {parentSurname || ""}
        </Text>
      </View>

      {/* LIST */}
      <View style={styles.historyBox}>
        {loadingHistory ? (
          <ActivityIndicator size="large" color="#4ECDC4" />
        ) : feedbacks.length === 0 ? (
          <Text style={styles.noHistory}>No feedback yet.</Text>
        ) : (
          <FlatList
            data={feedbacks}
            keyExtractor={(item) => item.feedback_id.toString()}
            renderItem={renderFeedback}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write feedback..."
          value={message}
          multiline
          onChangeText={setMessage}
        />

        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.5 }]}
          onPress={handleSend}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TeacherFeedbackScreen;

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#4ECDC4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
  },
  back: { fontSize: 30, color: "#fff" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  infoBox: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 18,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 15,
    color: "#475569",
  },

  historyBox: { flex: 1, paddingHorizontal: 16 },
  noHistory: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#9ca3af",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 22,
    paddingHorizontal: 22,
    borderRadius: 22,
    marginBottom: 20,
    elevation: 4,
  },

  cardLeftBorder: {
    width: 8,
    backgroundColor: "#4ECDC4",
    borderRadius: 8,
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 16,
    color: "#4ECDC4",
    fontWeight: "700",
    marginBottom: 8,
  },

  cardMessage: {
    fontSize: 17,
    color: "#334155",
    marginBottom: 10,
    lineHeight: 22,
  },

  cardDate: {
    fontSize: 13,
    color: "#64748b",
  },

  inputRow: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },

  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },

  sendButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 22,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
