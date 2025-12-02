// 🚀 FINAL GAME DETAILS — WRONG + SUCCESS INCLUDED

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
import { API_ENDPOINTS } from "../config/api";

const ChildGameDetailsScreen = ({ navigation }: any) => {
  const { child }: any = useRoute().params;
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.GAME_SESSIONS_BY_CHILD(child.id));
      const json = await res.json();

      if (json.success) setSessions(json.sessions);
    } catch (e) {
      console.log("❌", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    try {
      const x = new Date(d);
      return `${x.toLocaleDateString()} – ${x.toLocaleTimeString()}`;
    } catch {
      return "Unknown";
    }
  };

  const render = (s: any) => (
    <View key={s.id} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.game}>🎮 {s.game_type?.toUpperCase()}</Text>
        <Text style={styles.badge}>L{s.level}</Text>
      </View>

      <Text style={styles.text}>Score: {s.score}/{s.max_score}</Text>
      <Text style={styles.text}>Wrong answers: {s.wrong_count}</Text>
      <Text style={styles.text}>Success rate: {s.success_rate}%</Text>
      <Text style={styles.text}>Duration: {Math.round(s.duration_seconds/60)} mins</Text>

      <Text style={styles.date}>{formatDate(s.played_at)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B9A" />
        ) : sessions.length === 0 ? (
          <Text style={styles.no}>No game activity found.</Text>
        ) : (
          sessions.map(render)
        )}
      </ScrollView>
    </View>
  );
};

export default ChildGameDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginBottom: 12,
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  game: { fontSize: 16, fontWeight: "700" },
  badge: {
    backgroundColor: "#FFD1DC",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: "700",
  },
  text: { marginTop: 4, fontSize: 14, color: "#444" },
  date: { marginTop: 6, color: "#777", fontSize: 12 },
  no: { textAlign: "center", marginTop: 40, color: "#777" },
});
