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
  }, [navigation]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/surveys`);
        const data = await response.json();
        if (data.success) {
          setDbQuestions(data.questions);
          setAnswers(Array(data.questions.length).fill(null));
        }
      } catch (error) {
        console.error("Survey fetch error:", error);
        Alert.alert("Connection Error", "Could not connect to the server.");
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

  const handleNext = async () => {
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
      // --- LEVEL 3 HESAPLAMA MANTIĞI ---
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

      // Kademeli Seviye Belirleme
      let finalLevel = 1;
      if (level1Yes >= 3) {
        finalLevel = 2;
        if (level2Yes >= 4) {
          finalLevel = 3;
        }
      }

      const totalCorrect = answers.filter(a => a === 'yes').length;
      
      if (child?.id) {
        try {
          // Backend'e detaylı veri gönderimi
          const response = await fetch(`${BASE_URL}/children/${child.id}/update-level`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                correctAnswers: totalCorrect,
                calculatedLevel: finalLevel,
                levelStats: { l1: level1Yes, l2: level2Yes, l3: level3Yes }
            }),
          });
          
          const data = await response.json();
          if (data.success) {
            finalLevel = data.level || finalLevel;
          }

          // Anket tamamlandı işaretlemesi
          await fetch(`${BASE_URL}/children/${child.id}/mark-survey-complete`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Error updating status:', error);
        }
      }

      navigation.replace('Result', { 
        answers, 
        child: { ...child, level: finalLevel },
        score: totalCorrect
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
        <Text style={{ marginTop: 10 }}>Loading Survey...</Text>
      </View>
    );
  }

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = dbQuestions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* HEADER */}
      <View style={{
        backgroundColor: '#FF6B9A', paddingTop: 55, paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between', elevation: 4
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{
          width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>Assessment Survey</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {currentQuestions.map((item, index) => {
            const questionIndex = startIndex + index;
            const isYes = answers[questionIndex] === 'yes';
            const isNo = answers[questionIndex] === 'no';

            return (
               <View key={item.id} style={{ 
                 backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20,
                 shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
               }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#444', lineHeight: 22 }}>
                 {item.question_text}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={{ 
                      backgroundColor: isYes ? '#FF6B9A' : '#F1F2F6', 
                      width: '45%', paddingVertical: 12, borderRadius: 15, alignItems: 'center' 
                    }}
                    onPress={() => handleAnswer(questionIndex, 'yes')}
                  >
                      <Text style={{ color: isYes ? 'white' : '#555', fontWeight: '700' }}>YES</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={{ 
                       backgroundColor: isNo ? '#2F3542' : '#F1F2F6', 
                       width: '45%', paddingVertical: 12, borderRadius: 15, alignItems: 'center' 
                     }}
                    onPress={() => handleAnswer(questionIndex, 'no')}
                  >
                     <Text style={{ color: isNo ? 'white' : '#555', fontWeight: '700' }}>NO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* NAVIGATION BUTTONS */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={currentPage === 0}
              style={{ padding: 10 }}
            >
              <Text style={{ color: currentPage > 0 ? '#FF6B9A' : 'transparent', fontWeight: '700' }}>Previous</Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              backgroundColor: '#FF6B9A', paddingVertical: 15, paddingHorizontal: 35, 
              borderRadius: 25, shadowColor: '#FF6B9A', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
            }}
            onPress={handleNext}
          >
             <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
              {currentPage < totalPages - 1 ? 'NEXT' : 'FINISH'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', marginTop: 15, fontSize: 13, color: '#A4B0BE', fontWeight: '600' }}>
          PROGRESS: {currentPage + 1} / {totalPages}
        </Text>
      </View>
    </View>
  );
};

export default SurveyScreen;