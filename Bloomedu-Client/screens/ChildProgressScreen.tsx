// 🚀 FINAL ✨ MODERN GAME DETAILS SCREEN – TEACHER THEME ✨

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  TextInput,
  Platform,
  ToastAndroid,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { API_ENDPOINTS } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChildGameDetailsScreen = ({ navigation }: any) => {
  const { child }: any = useRoute().params;
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(child?.level || 1);
  const [savingLevel, setSavingLevel] = useState(false);
  const [childLevel, setChildLevel] = useState<number>(child?.level || 1);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchSessions();
    loadTeacherId();
  }, []);

  const loadTeacherId = async () => {
    try {
      const tid = await AsyncStorage.getItem("teacher_id");
      if (tid) setTeacherId(parseInt(tid, 10));
    } catch {}
  };

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

  const handleLevelSave = async () => {
    Alert.alert(
      "Confirm",
      `Set child level to ${selectedLevel}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            if (!teacherId) {
              Alert.alert("Error", "Teacher ID not found. Please re-login.");
              return;
            }
            setSavingLevel(true);
            try {
              const res = await fetch(
                API_ENDPOINTS.MANUAL_LEVEL_UPDATE(child.id),
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    level: selectedLevel,
                    teacher_id: teacherId,
                    changed_by_role: "teacher",
                    reason: reason.trim() || undefined,
                  }),
                }
              );
              const json = await res.json();
              if (json.success) {
                setChildLevel(selectedLevel);
                setLevelModalVisible(false);
                // Refresh sessions / stats if needed
                fetchSessions();
                if (Platform.OS === "android") {
                  ToastAndroid.show("Level updated successfully ✅", ToastAndroid.SHORT);
                } else {
                  Alert.alert("Success", "Level updated successfully ✅");
                }
              } else {
                Alert.alert("Error", json.message || "Failed to update level");
              }
            } catch (e) {
              Alert.alert("Error", "Network error updating level");
            } finally {
              setSavingLevel(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const LevelSelector = () => {
    const levels = [1, 2, 3, 4, 5];
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          Select new level
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {levels.map((lvl) => {
            const active = selectedLevel === lvl;
            return (
              <Pressable
                key={lvl}
                onPress={() => setSelectedLevel(lvl)}
                style={[
                  styles.levelPill,
                  active && styles.levelPillActive,
                ]}
              >
                <Text style={[styles.levelPillText, active && styles.levelPillTextActive]}>
                  Level {lvl}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

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

        <View>
          <Text style={styles.headerTitle}>{child.name}'s Games</Text>
          <Text style={styles.headerSubtitle}>Current Level: {childLevel}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity
          style={styles.levelButton}
          onPress={() => setLevelModalVisible(true)}
        >
          <Text style={styles.levelButtonText}>Change Level</Text>
        </TouchableOpacity>

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

      {/* Level Change Modal */}
      <Modal
        visible={levelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Level</Text>
            <Text style={styles.modalDesc}>
              Choose the new level for this child.
            </Text>
            <LevelSelector />

            <Text style={styles.modalDesc}>
              Optional note to parent (will be included in notification)
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason / note"
              multiline
              value={reason}
              onChangeText={setReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLevelModalVisible(false)}
                disabled={savingLevel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleLevelSave}
                disabled={savingLevel}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  {savingLevel ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerSubtitle: { fontSize: 13, color: "#e8fdf8", marginTop: 2 },

  section: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "700",
    color: "#007F73",
  },

  levelButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "stretch",
    marginBottom: 16,
    elevation: 2,
  },
  levelButtonText: { color: "#fff", fontWeight: "800", textAlign: "center" },

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  modalDesc: { fontSize: 14, color: "#334155", marginTop: 6 },
  reasonInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    color: "#0f172a",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancelButton: { backgroundColor: "#e2e8f0" },
  saveButton: { backgroundColor: "#4ECDC4" },
  modalButtonText: { fontWeight: "700", color: "#0f172a" },

  levelPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginRight: 8,
    marginBottom: 8,
  },
  levelPillActive: {
    backgroundColor: "#e6fffa",
    borderColor: "#4ECDC4",
  },
  levelPillText: { color: "#0f172a", fontWeight: "600" },
  levelPillTextActive: { color: "#0f766e" },
});
