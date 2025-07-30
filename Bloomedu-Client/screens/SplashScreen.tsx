import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

export default function SplashScreen({ navigation }: any) {
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
        style={styles.fullscreenImage}
        resizeMode="cover" 
      />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreenImage: {
    width: width,
    height: height,
  },
});