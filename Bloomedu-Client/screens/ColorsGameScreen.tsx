// -umut: RENK ÖĞRENİM VİDEO EKRANI (28.10.2025)
// YouTube video içeriği ile renk öğrenimi
// Video boyutlandırması optimize edildi
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';

const ColorsGameScreen = ({ navigation, route }: any) => {
  const { child } = route.params || {};

  const videoUrl = `https://www.youtube.com/embed/qhOTU8_1Af4?autoplay=1&modestbranding=1&rel=0&showinfo=0&playsinline=1`;

  const { width, height: screenHeight } = Dimensions.get('window');
  // -umut: Video boyutu - ekranın %90'ı, 16:9 oranında (28.10.2025)
  const videoWidth = width - 32;
  const videoHeight = (videoWidth * 9) / 16;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* -umut: Başlık (28.10.2025) */}
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Learn Colors!</Text>
        <Text style={styles.subtitle}>Watch and learn basic colors</Text>
      </View>

      {/* -umut: Video player - optimize edilmiş boyut (28.10.2025) */}
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: videoUrl }}
          style={{ 
            width: videoWidth, 
            height: videoHeight,
            borderRadius: 16,
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* -umut: Oyun butonu - modern tasarım (28.10.2025) */}
      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => navigation.navigate('ColorsMatchingGame', { child })}
        activeOpacity={0.8}
      >
        <Text style={styles.gameButtonIcon}>🎮</Text>
        <Text style={styles.gameButtonText}>Play Matching Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#2D3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
  },
  videoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  gameButton: {
    backgroundColor: '#FF6B9A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#FF6B9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gameButtonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  gameButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ColorsGameScreen;