import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: 15 }}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      ),
      headerTitle: '',
      headerStyle: {
        backgroundColor: '#ffffffff',
      },
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>WELCOME TO BLOOMEDU!</Text>

        <Text style={styles.subtitle}>
          This app helps support your child's learning journey by providing engaging, interactive tools designed especially for children with autism.
          We recommend taking short breaks regularly to ensure a healthy and balanced screen time experience for your child.
        </Text>

        {/* spacer kaldırıldı */}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.parentButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Parent Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.teacherButton]}
            onPress={() => navigation.navigate('Teacher')}
          >
            <Text style={styles.buttonText}>Teacher Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutUsContainer}>
          <Text style={styles.aboutUsTitle}>About Us</Text>
          <Text style={styles.aboutUsText}>
            BloomEdu is dedicated to supporting children with autism by providing a safe and nurturing learning environment.
            Our mission is to empower parents and teachers with the right tools to help every child thrive.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fb3896c0',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    marginTop: -30,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a6e72',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40, // subtitle ile buttonlar arasındaki boşluk artırıldı
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 0, // buton container üst boşluğu kaldırıldı
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  parentButton: {
    backgroundColor: '#fb389674',
  },
  teacherButton: {
    backgroundColor: '#64bef5ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  aboutUsContainer: {
    marginTop: 50,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#cbb9e7',
  },
  aboutUsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fb389681',
    marginBottom: 8,
    textAlign: 'center',
  },
  aboutUsText: {
    fontSize: 14,
    color: '#5a6e72',
    textAlign: 'center',
    lineHeight: 20,
  },
});