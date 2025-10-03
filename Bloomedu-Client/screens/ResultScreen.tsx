import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ResultScreenParams {
  answers: (string | null)[];
}

const ResultScreen = ({ route, navigation }: { route: { params: ResultScreenParams }; navigation: any }) => {
  const { answers } = route.params;

  // null değerleri önemsiz say, sadece 'yes'leri say
  const score = answers.reduce((total, a) => total + (a === 'yes' ? 1 : 0), 0);

  // Seviyeyi belirle (1-5)
  let level = 1;
  if (score <= 4) level = 1;
  else if (score <= 8) level = 2;
  else if (score <= 12) level = 3;
  else if (score <= 16) level = 4;
  else level = 5;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#FF6B9A', marginBottom: 20 }}>
        Survey Completed!
      </Text>

      <Text style={{ fontSize: 22, color: '#333', marginBottom: 10 }}>
        Your Score: {score} / {answers.length}
      </Text>

      <Text style={{ fontSize: 20, color: '#555', marginBottom: 30 }}>
        Your Child's Level: {level}
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#FF6B9A',
          paddingVertical: 15,
          paddingHorizontal: 30,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => navigation.navigate('Education')}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 5 }}>
          START EDUCATION
        </Text>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResultScreen;
