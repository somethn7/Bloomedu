import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const SettingsScreen = ({ navigation }: Props) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [screenTimeLimit, setScreenTimeLimit] = useState(20);
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#ffffffff',  // ekran rengi ile aynı pastel pembe-mor
      },
      headerShadowVisible: false, // header altındaki gölgeyi kaldırır (opsiyonel)
      headerTitleStyle: {
        color: '#5a6e72', 
        fontWeight: '700',
      },
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Bildirim Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            thumbColor={notificationsEnabled ? '#85c7fdff' : '#ccc'} // pembe ton
            trackColor={{ true: '#f7d3f7', false: '#eee' }} // açık pembe
          />
        </View>
      </View>

      {/* Dil Seçeneği */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity
            style={[
              styles.langButton,
              language === 'en' && styles.selectedLang,
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text style={language === 'en' ? styles.selectedLangText : styles.label}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langButton,
              language === 'tr' && styles.selectedLang,
            ]}
            onPress={() => setLanguage('tr')}
          >
            <Text style={language === 'tr' ? styles.selectedLangText : styles.label}>Türkçe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ekran Zaman Ayarı */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Time Limit (minutes)</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {[10, 15, 20, 25, 30].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.langButton,
                screenTimeLimit === time && styles.selectedLang,
              ]}
              onPress={() => setScreenTimeLimit(time)}
            >
              <Text style={screenTimeLimit === time ? styles.selectedLangText : styles.label}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Yazı Boyutu Ayarı */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Size</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {['small', 'medium', 'large'].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.fontButton,
                fontSize === size && styles.selectedFont,
              ]}
              onPress={() => setFontSize(size)}
            >
              <Text style={fontSize === size ? styles.selectedFontText : styles.label}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Yardım ve Destek */}
      <View style={[styles.section, { marginTop: 50 }]}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <Text style={styles.helpText}>
          If you have any questions or need assistance, please contact us at{' '}
          <Text style={styles.email}>support@bloomedu.com</Text>.
          We're here to help you and your child have the best learning experience possible.
        </Text>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',  // HomeScreen ile uyumlu pastel pembe-mor
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fb3896c0',  // HomeScreen başlıktaki pembe tonuna yakın
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    color: '#5a6e72',  // HomeScreen subtitle yazısına uyumlu yumuşak mavi-yeşil
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#bde1feb4', // açık pembe pastel
  },
  selectedLang: {
    backgroundColor: '#85c7fdff', // HomeScreen'deki parentButton rengi pastel pembe
  },
  selectedLangText: {
    color: '#000000c8',  // koyu pembe-mor
    fontWeight: '700',
  },
  fontButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#bde1feb4',  // açık mor-pembe pastel
  },
  selectedFont: {
    backgroundColor: '#85c7fdff',  // HomeScreen'deki parentButton alternatif pastel mor-pembe
  },
  selectedFontText: {
    color: '#000000c8',  // koyu mor
    fontWeight: '700',
  },
  helpText: {
    fontSize: 16,
    color: '#5a6e72', // HomeScreen subtitle ile uyumlu yumuşak mavi-yeşil
    lineHeight: 22,
  },
  email: {
    fontWeight: '700',
    color: '#fb38967a',  // pastel pembe ton
  },
});