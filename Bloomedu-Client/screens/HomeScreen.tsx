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
      headerShown: false,
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.welcomeEmoji}>🌸</Text>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brandName}>BloomEdu</Text>
        <Text style={styles.tagline}>Empowering Every Child's Journey</Text>
      </View>

      {/* Mission Card */}
      <View style={styles.missionCard}>
        <Text style={styles.missionIcon}>💙</Text>
        <Text style={styles.missionText}>
          Designed especially for children with autism, our interactive tools support learning through engaging activities tailored to their unique needs.
        </Text>
      </View>

      {/* Login Options */}
      <View style={styles.loginSection}>
        <Text style={styles.loginTitle}>Choose Your Role</Text>
        
        <TouchableOpacity
          style={[styles.roleCard, styles.parentCard]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <View style={styles.roleIconContainer}>
            <Text style={styles.roleIcon}>👨‍👩‍👧‍👦</Text>
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Parent Login</Text>
            <Text style={styles.roleSubtitle}>Track your child's progress</Text>
          </View>
          <Text style={styles.roleArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.teacherCard]}
          onPress={() => navigation.navigate('Teacher')}
          activeOpacity={0.8}
        >
          <View style={styles.roleIconContainer}>
            <Text style={styles.roleIcon}>👩‍🏫</Text>
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Teacher Login</Text>
            <Text style={styles.roleSubtitle}>Monitor student learning</Text>
          </View>
          <Text style={styles.roleArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎮</Text>
          <Text style={styles.featureText}>Interactive Games</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureText}>Progress Tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Personalized Learning</Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About BloomEdu</Text>
        <Text style={styles.aboutText}>
          We create a safe, nurturing environment where every child can thrive. Our evidence-based approach combines engaging activities with meaningful progress tracking to support both parents and educators.
        </Text>
        <Text style={styles.reminderText}>
          💡 Remember to take regular breaks for balanced screen time!
        </Text>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 22,
  },
  heroSection: {
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FF6B9A',
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#4A5568',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  missionCard: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  missionIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 15,
    color: '#1E3A8A',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  loginSection: {
    paddingHorizontal: 20,
    marginTop: 35,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  parentCard: {
    backgroundColor: '#FF6B9A',
  },
  teacherCard: {
    backgroundColor: '#4ECDC4',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleIcon: {
    fontSize: 32,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  roleArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 35,
    gap: 12,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  aboutSection: {
    marginHorizontal: 20,
    marginTop: 35,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#BA68C8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#BA68C8',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 23,
    marginBottom: 15,
  },
  reminderText: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
  },
});