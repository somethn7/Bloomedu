import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const { width } = Dimensions.get('window');

// -umut: (22.11.2025) Redesigned Settings screen with modern UI and card layout
const SettingsScreen = ({ navigation }: Props) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [screenTimeLimit, setScreenTimeLimit] = useState(20);
  const [language, setLanguage] = useState('en');

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Preferences Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>⚙️ Preferences</Text>
          
          {/* Notifications */}
          <View style={styles.rowItem}>
            <Text style={styles.menuText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#E2E8F0', true: '#FFB74D' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#F7FAFC'}
            />
          </View>

          <View style={styles.divider} />

          {/* Language */}
          <View style={styles.settingGroup}>
            <Text style={styles.subLabel}>Language</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, language === 'en' && styles.toggleButtonActive]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.toggleText, language === 'en' && styles.toggleTextActive]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, language === 'tr' && styles.toggleButtonActive]}
                onPress={() => setLanguage('tr')}
              >
                <Text style={[styles.toggleText, language === 'tr' && styles.toggleTextActive]}>Türkçe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Parental Controls Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>🛡️ Parental Controls</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.subLabel}>Daily Screen Time Limit</Text>
            <View style={styles.timeOptionsRow}>
              {[15, 20, 30, 45].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeButton, screenTimeLimit === time && styles.timeButtonActive]}
                  onPress={() => setScreenTimeLimit(time)}
                >
                  <Text style={[styles.timeText, screenTimeLimit === time && styles.timeTextActive]}>
                    {time}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionCard}>
           <Text style={styles.sectionHeader}>💬 Support</Text>
           <Text style={styles.supportText}>
             Need help? Contact us at <Text style={{fontWeight: '700', color: '#4DABF7'}}>support@bloomedu.com</Text>
           </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>v1.0.2 (Build 2025)</Text>

      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#7E57C2', // Deep Purple for Settings
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24, // Increased padding for better spacing
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 18, // Increased margin
  },
  menuText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16, // Increased vertical spacing
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingGroup: {
    marginTop: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12, // Taller buttons
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    color: '#718096',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#7E57C2',
    fontWeight: '700',
  },
  timeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 14, // Taller buttons
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeButtonActive: {
    backgroundColor: '#7E57C2',
    borderColor: '#7E57C2',
  },
  timeText: {
    color: '#4A5568',
    fontWeight: '600',
    fontSize: 15,
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
  supportText: {
    fontSize: 15, // Slightly larger text
    color: '#718096',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    paddingVertical: 18, // Taller logout button
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    marginBottom: 20,
    marginTop: 10,
  },
  logoutText: {
    color: '#E53E3E',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: '#CBD5E0',
    fontSize: 12,
    marginBottom: 20,
  },
});
