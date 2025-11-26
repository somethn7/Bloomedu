import React, { useEffect } from 'react';
import { View, Image, StyleSheet, useWindowDimensions } from 'react-native';

export default function SplashScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions(); // Responsive: ekran döndürme desteği
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/enterence.png')}
        style={[styles.fullscreenImage, { width, height }]}
        resizeMode="cover" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreenImage: {
    // width ve height dinamik olarak inline style'dan geliyor
  },
});