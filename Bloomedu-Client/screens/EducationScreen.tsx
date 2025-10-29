import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';

const categories = [
  { title: 'Numbers', image: require('./assets/numbers.png') },
  { title: 'Colors', image: require('./assets/colors.png') },
  { title: 'Objects', image: require('./assets/objects.png') },
  { title: 'Animals', image: require('./assets/animals.png') },
];

// -umut: Child parametresi eklendi - oyunlara child bilgisini iletmek için (28.10.2025)
const EducationScreen = ({ navigation, route }: any) => {
  const { child } = route.params || {};
  const childLevel = child?.level || 1; // -umut: Çocuğun seviyesi

  const handleCategoryPress = (categoryTitle: string) => {
    if (categoryTitle === 'Colors') {
      // -umut: Çocuğun seviyesine göre oyun yönlendirmesi (28.10.2025)
      if (childLevel === 1) {
        navigation.navigate('ColorsRecognitionLevel1', { child });
      } else if (childLevel === 2) {
        navigation.navigate('ColorObjectsLevel2', { child });
      } else {
        // Level 3+ için henüz oyun yok
        Alert.alert('Coming Soon!', `Level ${childLevel} Colors games will be available soon!`);
      }
    } else if (categoryTitle === 'Numbers') {
      // -umut: Numbers kategorisi - seviyeye göre (28.10.2025)
      Alert.alert('Coming Soon!', `Numbers games for Level ${childLevel} will be available soon!`);
    } else if (categoryTitle === 'Objects') {
      // -umut: Objects kategorisi - seviyeye göre (28.10.2025)
      Alert.alert('Coming Soon!', `Objects games for Level ${childLevel} will be available soon!`);
    } else if (categoryTitle === 'Animals') {
      // -umut: Animals kategorisi - seviyeye göre (28.10.2025)
      Alert.alert('Coming Soon!', `Animals games for Level ${childLevel} will be available soon!`);
    } else {
      Alert.alert('Coming Soon!', `${categoryTitle} games will be available soon!`);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Category</Text>
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleCategoryPress(category.title)}
          >
            <Image source={category.image} style={styles.image} />
            <Text style={styles.cardText}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  card: {
    width: '40%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
  },
  image: { width: 80, height: 80, marginBottom: 10 },
  cardText: { fontSize: 16, fontWeight: 'bold' },
});

export default EducationScreen;
