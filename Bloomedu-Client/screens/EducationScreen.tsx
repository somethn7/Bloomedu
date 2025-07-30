import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';

const categories = [
  { title: 'Numbers', image: require('./assets/numbers.png') },
  { title: 'Colors', image: require('./assets/colors.png') },
  { title: 'Objects', image: require('./assets/objects.png') },
  { title: 'Animals', image: require('./assets/animals.png') },
];

const EducationScreen = ({ navigation }: any) => {
  const handleCategoryPress = (categoryTitle: string) => {
    if (categoryTitle === 'Colors') {
      navigation.navigate('ColorsGame');
    } else {
      Alert.alert('Selected', categoryTitle);
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
