import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { API_ENDPOINTS } from "../config/api"; // ⭐ API'den çekilecek

const ChildGameDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { child } = route.params as any;

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const url = API_ENDPOINTS.GAME_SESSIONS_BY_CHILD(child.id); // ⭐ DOĞRU YER
      const response = await fetch(url);

      const json = await response.json();
      console.log("📌 GAME SESSIONS RESPONSE:", json);

      if (json.success && json.sessions) {
        setSessions(json.sessions);
      } else {
        setSessions([]); // Hiç session yoksa boş set et
      }

    } catch (err) {
      console.error("❌ Game session fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // DATE GROUPING
  const groupByDate = () => {
    const groups: any = { today: [], yesterday: [], older: [] };

    sessions.forEach((s) => {
      const played = s.played_at ? new Date(s.played_at) : null;
      if (!played) return;

      const today = new Date();
      const diff = Math.floor((today.getTime() - played.getTime()) / (1000 * 3600 * 24));

      if (diff === 0) groups.today.push(s);
      else if (diff === 1) groups.yesterday.push(s);
      else groups.older.push(s);
    });

    return groups;
  };

  const groups = groupByDate();

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Unknown date";
      return `${d.toLocaleDateString()} – ${d.toLocaleTimeString()}`;
    } catch {
      return "Unknown date";
    }
  };

  const renderSession = (s: any) => (
    <View key={s.id} style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.gameType}>🎮 {s.game_type?.toUpperCase()}</Text>
        <Text style={styles.levelBadge}>L{s.level}</Text>
      </View>

      <Text style={styles.scoreText}>
        Score: <Text style={styles.bold}>{s.score}</Text> / {s.max_score}
      </Text>

      <Text style={styles.durationText}>
        Duration: {Math.round((s.duration_seconds || 0) / 60)} mins
      </Text>

      <Text style={styles.dateText}>
        {formatDate(s.played_at)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {child.name}'s Game Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B9A" />
        ) : (
          <>
            {/* TODAY */}
            {groups.today.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📅 Today</Text>
                {groups.today.map(renderSession)}
              </>
            )}

            {/* YESTERDAY */}
            {groups.yesterday.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📅 Yesterday</Text>
                {groups.yesterday.map(renderSession)}
              </>
            )}

            {/* OLDER */}
            {groups.older.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📅 Earlier</Text>
                {groups.older.map(renderSession)}
              </>
            )}

            {sessions.length === 0 && (
              <Text style={styles.noData}>No game activity found.</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ChildGameDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },

  header: {
    backgroundColor: "#FF6B9A",
    paddingTop: 55,
    paddingBottom: 20,
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
  backIcon: { fontSize: 22, color: "#fff", fontWeight: "700" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },

  scroll: { padding: 20 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#444",
  },

  sessionCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },

  sessionHeader: { flexDirection: "row", justifyContent: "space-between" },
  gameType: { fontSize: 16, fontWeight: "600", color: "#333" },

  levelBadge: {
    backgroundColor: "#FFE4EC",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontWeight: "700",
    color: "#C2185B",
  },

  bold: { fontWeight: "800", color: "#222" },
  scoreText: { fontSize: 15, marginTop: 6, color: "#444" },
  durationText: { fontSize: 14, color: "#555", marginTop: 2 },
  dateText: { fontSize: 13, color: "#777", marginTop: 4 },

  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
  },
});
