import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface ResultScreenParams {
  answers: (string | null)[];
  child: any;
}

const ResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { answers, child } = route.params as ResultScreenParams;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // ✅ Survey tamamlandı → DB’de işaretle
  useEffect(() => {
    const markSurveyCompleted = async () => {
      try {
        const res = await fetch(`https://bloomedu-production.up.railway.app/children/${child.id}/mark-survey-complete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!data.success) {
          console.warn('⚠️ Survey mark failed:', data.message);
        } else {
          console.log('✅ Survey marked complete in DB for child:', child.id);
        }
      } catch (err) {
        console.error('❌ Error marking survey as complete:', err);
        Alert.alert('Error', 'Failed to update survey status.');
      }
    };

    if (child?.id) markSurveyCompleted();
  }, [child]);

  const score = answers.reduce((total, a) => total + (a === 'yes' ? 1 : 0), 0);

  // ✅ Send child's level to backend
useEffect(() => {
  const updateLevel = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/children/${child.id}/update-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctAnswers: score }),
      });

      const data = await response.json();
      if (data.success) {
        console.log(`✅ Level ${data.level} saved for child ID: ${child.id}`);
      } else {
        console.warn('⚠️ Level update failed:', data.message);
      }
    } catch (err) {
      console.error('❌ Error updating child level:', err);
    }
  };

  if (child?.id) updateLevel();
}, [child, score]);

  let level = 1;
  if (score <= 4) level = 1;
  else if (score <= 8) level = 2;
  else if (score <= 12) level = 3;
  else if (score <= 16) level = 4;
  else level = 5;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
      }}
    >
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
          marginBottom: 15,
        }}
        onPress={() => navigation.navigate('Education')}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>START EDUCATION →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#73c0ff',
          paddingVertical: 15,
          paddingHorizontal: 30,
          borderRadius: 25,
        }}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>GO TO DASHBOARD</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResultScreen;
