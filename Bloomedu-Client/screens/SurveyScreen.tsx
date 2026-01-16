import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const BASE_URL = 'https://bloomedu-production.up.railway.app';

const SurveyScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const child = route.params?.child;

  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);

  const questionsPerPage = 5;
  const totalPages = dbQuestions.length > 0 ? Math.ceil(dbQuestions.length / questionsPerPage) : 1;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  // === BACKEND'DEN SORULARI ÇEK + LOG EKLEMESİ ===
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Fetching from:", `${BASE_URL}/surveys`);
        const response = await fetch(`${BASE_URL}/surveys`);
        
        // Yanıtın JSON olup olmadığını anlamak için önce text olarak alıyoruz
        const responseText = await response.text();
        console.log("Raw Backend Response:", responseText);

        try {
          const data = JSON.parse(responseText);
          if (data.success) {
            setDbQuestions(data.questions);
            setAnswers(Array(data.questions.length).fill(null));
          } else {
            console.error("Data success is false:", data);
          }
        } catch (jsonError) {
          console.error("JSON Parse Error! Backend muhtemelen HTML veya hata mesajı döndü.");
          Alert.alert("Server Error", "Backend is not sending valid JSON.");
        }

      } catch (error) {
        console.error("Survey fetch network error:", error);
        Alert.alert("Connection Error", "Could not connect to Railway server.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Warning', 'You must complete the survey before exiting.');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleAnswer = (questionIndex: number, answer: 'yes' | 'no') => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    const startIndex = currentPage * questionsPerPage;
    const currentBatch = dbQuestions.slice(startIndex, startIndex + questionsPerPage);
    const unanswered = currentBatch.some((_, index) => answers[startIndex + index] === null);

    if (unanswered) {
      Alert.alert('Incomplete', 'Please answer all questions on this page.');
      return;
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      let level1Yes = 0;
      let level2Yes = 0;
      let level3Yes = 0;

      dbQuestions.forEach((q, index) => {
        if (answers[index] === 'yes') {
          if (q.target_level === 1) level1Yes++;
          if (q.target_level === 2) level2Yes++;
          if (q.target_level === 3) level3Yes++;
        }
      });

      let finalLevel = 1;
      if (level1Yes >= 3) finalLevel = 2;
      if (level1Yes >= 3 && level2Yes >= 4) finalLevel = 3;

      navigation.replace('Result', { 
        answers, 
        child: { ...child, level: finalLevel },
        score: answers.filter(a => a === 'yes').length
      });
    }
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B9A" />
        <Text style={{ marginTop: 10 }}>Loading Survey Questions...</Text>
      </View>
    );
  }

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = dbQuestions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <View style={{
        backgroundColor: '#d9d9d9', paddingTop: 55, paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 35, borderBottomRightRadius: 35, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{
          width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B9A',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#444' }}>Survey</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {currentQuestions.map((item, index) => {
            const questionIndex = startIndex + index;
            const isYes = answers[questionIndex] === 'yes';
            const isNo = answers[questionIndex] === 'no';

            return (
               <View key={item.id} style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 12, color: '#333' }}>
                 {item.question_text}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                  <TouchableOpacity
                    style={{ backgroundColor: isYes ? '#FF6B9A' : '#e5e5e5', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25 }}
                    onPress={() => handleAnswer(questionIndex, 'yes')}
                  >
                      <Text style={{ color: isYes ? 'white' : '#222', fontWeight: '700' }}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={{ backgroundColor: isNo ? '#555' : '#e5e5e5', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25 }}
                    onPress={() => handleAnswer(questionIndex, 'no')}
                  >
                     <Text style={{ color: isNo ? 'white' : '#222', fontWeight: '700' }}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
             style={{ backgroundColor: currentPage > 0 ? '#a0a0a0' : 'transparent', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 }}
              onPress={handleBack}
              disabled={currentPage === 0}
            >
              {currentPage > 0 && <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back</Text>}
            </TouchableOpacity>

          <TouchableOpacity
           style={{ backgroundColor: '#FF6B9A', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, flexDirection: 'row', alignItems: 'center' }}
            onPress={handleNext}
          >
             <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {currentPage < totalPages - 1 ? 'Next' : 'Finish'}
            </Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 5 }}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 14, color: '#555' }}>
          Page {currentPage + 1} of {totalPages}
        </Text>
      </View>
    </View>
  );
};

export default SurveyScreen;