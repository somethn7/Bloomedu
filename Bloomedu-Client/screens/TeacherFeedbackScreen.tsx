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
  const { childId, childName, childSurname, parentId } = route.params || {};
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // 🚀 FEEDBACK HISTORY GETIR
  const fetchHistory = async () => {
    try {
      const teacherIdStr = await AsyncStorage.getItem("teacher_id");
      const teacherId = teacherIdStr ? Number(teacherIdStr) : null;

      if (!teacherId) return;

      const res = await fetch(
        `https://bloomedu-production.up.railway.app/feedbacks/by-teacher/${teacherId}/${childId}`
      );

      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🚀 FEEDBACK YOLLA
  const handleSendFeedback = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const teacherIdStr = await AsyncStorage.getItem("teacher_id");
      const teacherId = teacherIdStr ? Number(teacherIdStr) : null;

      const response = await fetch(
        "https://bloomedu-production.up.railway.app/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            child_id: childId,
            parent_id: parentId ?? 0,
            teacher_id: teacherId,
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("");
        fetchHistory(); // 🔥 YENI FEEDBACKI GERI YUKLE
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CHAT BUBBLE TASARIMI
  const renderFeedback = ({ item }: any) => (
    <View style={styles.bubbleContainer}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleMessage}>{item.message}</Text>
        <Text style={styles.bubbleTime}>{item.created_at}</Text>
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
        <Text style={styles.headerTitle}>
          Feedback — {childName} {childSurname}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* HISTORY */}
      <View style={styles.historyBox}>
        {loadingHistory ? (
          <ActivityIndicator size="large" color="#4ECDC4" />
        ) : feedbacks.length === 0 ? (
          <Text style={styles.noHistory}>No feedback sent yet.</Text>
        ) : (
          <FlatList
            data={feedbacks}
            renderItem={renderFeedback}
            keyExtractor={(item) => item.feedback_id.toString()}
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* INPUT AREA */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a feedback..."
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.5 }]}
          onPress={handleSendFeedback}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TeacherFeedbackScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#4ECDC4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  back: { fontSize: 28, color: "white" },
  headerTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
  },

  historyBox: {
    flex: 1,
    padding: 15,
  },

  noHistory: {
    textAlign: "center",
    paddingTop: 30,
    fontSize: 15,
    color: "#888",
  },

  bubbleContainer: {
    alignItems: "flex-end",
    marginVertical: 6,
  },

  bubble: {
    maxWidth: "75%",
    backgroundColor: "#4ECDC4",
    padding: 12,
    borderRadius: 15,
    borderBottomRightRadius: 0,
  },

  bubbleMessage: {
    color: "white",
    fontSize: 15,
  },
  bubbleTime: {
    fontSize: 11,
    color: "#E0FFFB",
    textAlign: "right",
    marginTop: 3,
  },

  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },

  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },

  sendButton: {
    backgroundColor: "#4ECDC4",
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "white", fontSize: 22, fontWeight: "800" },
});
