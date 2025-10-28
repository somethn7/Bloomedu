import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

// -umut: Child parametresi eklendi - matching game'e iletmek için (28.10.2025)
const ColorsGameScreen = ({ navigation, route }: any) => {
  const { child } = route.params || {};

  const videoUrl = `https://www.youtube.com/embed/qhOTU8_1Af4?autoplay=1&modestbranding=1&rel=0&showinfo=0&playsinline=1`;


  const { width } = Dimensions.get('window');
  const height = (width * 9) / 16;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's Learn Colors!</Text>


  
      <WebView
        source={{ uri: videoUrl }}
        style={{ width: width - 40, height: height }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />


      {/* -umut: Child parametresi matching game'e iletiliyor (28.10.2025) */}
      <View style={{ marginTop: 20 }}>
        <Button
          title="Play Matching Game"
          onPress={() => navigation.navigate('ColorsMatchingGame', { child })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default ColorsGameScreen;