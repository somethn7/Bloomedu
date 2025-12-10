// 🚀 FINAL ✨ MODERN GAME DETAILS SCREEN – TEACHER THEME ✨

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

      if (json.success) {
        const cleaned = json.sessions.map((s: any) => ({
          ...s,
          wrong_count: Number(s.wrong_count) || 0,
          success_rate: Number(s.success_rate) || 0,
          duration_seconds: Number(s.duration_seconds) || 0,
        }));

        setSessions(cleaned);
      }
    } catch (e) {
      console.log("❌ ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const groupByDate = () => {
    const todayList: any[] = [];
    const yesterdayList: any[] = [];
    const earlierList: any[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    sessions.forEach((s) => {
      const played = new Date(s.played_at);
      const clean = new Date(played);
      clean.setHours(0, 0, 0, 0);

      if (clean.getTime() === today.getTime()) todayList.push(s);
      else if (clean.getTime() === yesterday.getTime()) yesterdayList.push(s);
      else earlierList.push(s);
    });

    return { todayList, yesterdayList, earlierList };
  };

  const { todayList, yesterdayList, earlierList } = groupByDate();

  const StatBar = ({ label, value, max, color }: any) => {
    const percent = Math.min((value / max) * 100, 100);

    return (
      <View style={{ marginTop: 6 }}>
        <Text style={styles.statLabel}>
          {label}: {value}
        </Text>

        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              { width: `${percent}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderSession = (s: any) => (
    <View key={s.id} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.game}>🎮 {s.game_type?.toUpperCase()}</Text>
        <Text style={styles.badge}>Level {s.level}</Text>
      </View>

      {/* ❌ SCORE KALDIRILDI */}

      <StatBar
        label="Wrong"
        value={s.wrong_count}
        max={s.wrong_count + 1}
        color="#FF6B6B"
      />

      <StatBar
        label="Success %"
        value={s.success_rate}
        max={100}
        color="#FFC947"
      />

      <Text style={styles.duration}>
        ⏱ {Math.round(s.duration_seconds / 60)} mins
      </Text>

      <Text style={styles.date}>{formatDate(s.played_at)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{child.name}'s Games</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#4ECDC4" />
        ) : (
          <>
            <Text style={styles.section}>📅 Today</Text>
            {todayList.length ? (
              todayList.map(renderSession)
            ) : (
              <Text style={styles.empty}>No activity today.</Text>
            )}

            <Text style={styles.section}>📅 Yesterday</Text>
            {yesterdayList.length ? (
              yesterdayList.map(renderSession)
            ) : (
              <Text style={styles.empty}>No activity yesterday.</Text>
            )}

            <Text style={styles.section}>📅 Earlier</Text>
            {earlierList.length ? (
              earlierList.map(renderSession)
            ) : (
              <Text style={styles.empty}>No earlier activity.</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ChildGameDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FFFF" },

  header: {
    backgroundColor: "#4ECDC4",
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },

  section: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "700",
    color: "#007F73",
  },

  card: {
    marginTop: 10,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 6,
    borderLeftColor: "#4ECDC4",
    elevation: 3,
  },

  row: { flexDirection: "row", justifyContent: "space-between" },

  game: { fontSize: 17, fontWeight: "700", color: "#004F4A" },

  badge: {
    backgroundColor: "#D1FFF7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#007F73",
  },

  statLabel: {
    fontSize: 14,
    color: "#005F5A",
    fontWeight: "600",
  },

  barBackground: {
    height: 8,
    backgroundColor: "#E0F7F5",
    borderRadius: 10,
    overflow: "hidden",
  },

  barFill: { height: "100%", borderRadius: 10 },

  duration: {
    marginTop: 8,
    fontSize: 14,
    color: "#004F4A",
    fontWeight: "600",
  },

  date: {
    marginTop: 6,
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },

  empty: { color: "#AAA", marginTop: 4, fontStyle: "italic" },
});
