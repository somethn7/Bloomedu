import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const ColorsGameScreen = ({ navigation }: any) => {

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


      <View style={{ marginTop: 20 }}>
        <Button
          title="Play Matching Game"
          onPress={() => navigation.navigate('ColorsMatchingGame')}
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