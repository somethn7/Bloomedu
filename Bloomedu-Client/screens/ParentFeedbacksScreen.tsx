import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Feedback = {
  feedback_id: number;
  message: string;
  created_at?: string;
  child_name?: string;
  child_surname?: string;
  teacher_name?: string;
  is_read?: boolean;
};

const ParentFeedbacksScreen = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const parentIdString = await AsyncStorage.getItem("parent_id");
      if (!parentIdString) return;
      const parentId = Number(parentIdString);

      const url = `https://bloomedu-production.up.railway.app/feedbacks/by-parent/${parentId}`;
      const res = await fetch(url);
      const text = await res.text();
      const data = JSON.parse(text);

      if (data.success) {
        setFeedbacks(data.feedbacks);

        const unread = data.feedbacks.some((f: Feedback) => f.is_read === false);
        setHasNew(unread);

        markAllAsRead(parentId);
      }
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async (parentId: number) => {
    try {
      await fetch(
        "https://bloomedu-production.up.railway.app/feedbacks/mark-read",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parent_id: parentId }),
        }
      );
    } catch {}
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Feedback }) => {
    const expanded = expandedId === item.feedback_id;

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.feedback_id)}
        activeOpacity={0.8}
      >
        <View style={[styles.card, item.is_read === false && styles.newCard]}>
          <View style={styles.headerRow}>
            <Text style={styles.child}>
              👶 {item.child_name} {item.child_surname}
            </Text>

            {item.is_read === false && <Text style={styles.newBadge}>NEW</Text>}
          </View>

          {expanded && (
            <View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.teacher}>👩‍🏫 {item.teacher_name}</Text>
              <Text style={styles.date}>🕒 {formatDate(item.created_at)}</Text>
            </View>
          )}

          {!expanded && (
            <Text style={styles.preview}>{item.message.slice(0, 35)}...</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* NOTIFICATION BANNER */}
      {hasNew && (
        <TouchableOpacity
          onPress={() => setHasNew(false)}
          style={styles.banner}
          activeOpacity={0.8}
        >
          <Text style={styles.bannerText}>🔔 You have new feedback! Tap to view.</Text>
        </TouchableOpacity>
      )}

      {/* Title */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Teacher Feedback</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B9A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item.feedback_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ParentFeedbacksScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDECF5" },
  topBar: {
    backgroundColor: "#FF6B9A",
    paddingTop: 55,
    paddingBottom: 15,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    alignItems: "center",
  },
  topBarText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },

  banner: {
    backgroundColor: "#FFE3EE",
    padding: 12,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B9A",
  },
  bannerText: {
    color: "#C2185B",
    fontSize: 14,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
  },
  newCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#FF6B9A",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  child: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  newBadge: {
    backgroundColor: "#FF6B9A",
    color: "#FFF",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "700",
  },
  preview: {
    marginTop: 6,
    color: "#6B7280",
  },
  message: { marginTop: 10, fontSize: 15, color: "#444" },
  teacher: { marginTop: 10, color: "#6B7280", fontStyle: "italic" },
  date: { marginTop: 8, color: "#9CA3AF", fontSize: 12 },
});
