import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

type Params = {
  role: 'parent' | 'teacher';
  nextScreen: string;
  nextParams?: any;
  name?: string;
};

const THEME = {
  parent: {
    primary: '#FF6B9A',
    secondary: '#FFB3C6',
    accent: '#FFE5F1',
    gradient1: '#FF6B9A',
    gradient2: '#FF8FAB',
    icon: '👨‍👩‍👧‍👦',
    message: 'Your children are waiting!',
  },
  teacher: {
    primary: '#4ECDC4',
    secondary: '#7FE5DC',
    accent: '#E0F8F5',
    gradient1: '#4ECDC4',
    gradient2: '#6FD9D0',
    icon: '👩‍🏫',
    message: 'Your classroom awaits!',
  },
};

export default function WelcomeSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role = 'parent', nextScreen, nextParams, name } = (route.params || {}) as Params;

  const theme = THEME[role];

  // Animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  // Particles
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: Math.random() * width,
        y: -50 - Math.random() * 100,
        delay: Math.random() * 600,
        duration: 2000 + Math.random() * 1500,
        size: 8 + Math.random() * 12,
        emoji: ['✨', '🌟', '⭐', '💫', '🎉', '🎊', '💝', '💖'][Math.floor(Math.random() * 8)],
        fall: new Animated.Value(-100),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0),
      })),
    []
  );

  useEffect(() => {
    // Status bar
    StatusBar.setBarStyle('dark-content');

    // Main animations sequence
    Animated.sequence([
      // Circle appears
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      // Check mark bounces in
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade and slide text
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ring waves
    Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particles fall
    particles.forEach((p) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(p.fall, {
            toValue: height + 50,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: 1,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 400,
              delay: p.duration - 700,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, p.delay);
    });

    // Auto navigate - Daha uzun süre göster
    const timer = setTimeout(() => {
      if (nextScreen) {
        navigation.replace(nextScreen, nextParams || {});
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (nextScreen) navigation.replace(nextScreen, nextParams || {});
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.accent }]}>
      {/* Animated background gradient circles */}
      <View style={[styles.bgCircle1, { backgroundColor: theme.gradient1, opacity: 0.15 }]} />
      <View style={[styles.bgCircle2, { backgroundColor: theme.gradient2, opacity: 0.12 }]} />
      <View style={[styles.bgCircle3, { backgroundColor: theme.primary, opacity: 0.08 }]} />

      {/* Particles */}
      {particles.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.particle,
            {
              left: p.x,
              fontSize: p.size,
              opacity: p.opacity,
              transform: [
                { translateY: p.fall },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Success Icon Container */}
        <View style={styles.iconContainer}>
          {/* Expanding Rings */}
          <Animated.View
            style={[
              styles.ring,
              {
                backgroundColor: theme.primary,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                backgroundColor: theme.secondary,
                opacity: ringOpacity.interpolate({
                  inputRange: [0, 0.8],
                  outputRange: [0, 0.5],
                }),
                transform: [
                  {
                    scale: ringScale.interpolate({
                      inputRange: [0.8, 1.5],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Main Circle */}
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: theme.primary,
                transform: [{ scale: circleScale }, { scale: pulseAnim }],
              },
            ]}
          >
            {/* Check Mark */}
            <Animated.View
              style={[
                styles.checkContainer,
                {
                  transform: [{ scale: checkScale }],
                },
              ]}
            >
              <Text style={styles.checkMark}>✓</Text>
            </Animated.View>
          </Animated.View>

          {/* Role Icon */}
          <Animated.Text
            style={[
              styles.roleIcon,
              {
                opacity: fadeIn,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {theme.icon}
          </Animated.Text>
        </View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          <Text style={[styles.welcomeTitle, { color: theme.primary }]}>
            Welcome Back!
          </Text>
          {name && (
            <Text style={styles.userName}>{name}</Text>
          )}
          <Text style={styles.message}>{theme.message}</Text>

          {/* Success Badge */}
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>✨ Login Successful ✨</Text>
          </View>

          {/* Quick Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🎯</Text>
              <Text style={styles.infoText}>
                {role === 'parent'
                  ? 'Track progress & support learning'
                  : 'Monitor students & provide feedback'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📊</Text>
              <Text style={styles.infoText}>
                {role === 'parent'
                  ? 'View detailed performance analytics'
                  : 'Access detailed progress reports'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeIn.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  translateY: fadeIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.primary }]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>→</Text>
          </TouchableOpacity>
          <Text style={styles.autoText}>Auto-continuing in a moment...</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    top: -width * 0.4,
    left: -width * 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    bottom: -width * 0.3,
    right: -width * 0.25,
  },
  bgCircle3: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    top: height * 0.3,
    right: -width * 0.2,
  },
  particle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 70,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  roleIcon: {
    position: 'absolute',
    fontSize: 50,
    bottom: -25,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    color: '#718096',
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  continueArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  autoText: {
    fontSize: 13,
    color: '#A0AEC0',
    marginTop: 14,
    fontStyle: 'italic',
  },
});
