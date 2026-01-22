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
      // --- TAMAMEN DİNAMİK SEVİYE HESAPLAMA ---
      let level1Yes = 0, level2Yes = 0, level3Yes = 0;

      // 1. "Yes" cevaplarını say
      dbQuestions.forEach((q, index) => {
        if (answers[index] === 'yes') {
          if (q.target_level === 1) level1Yes++;
          if (q.target_level === 2) level2Yes++;
          if (q.target_level === 3) level3Yes++;
        }
      });

      // 2. Mevcut soru setindeki toplam sayıları dinamik olarak bul
      const totalL1 = dbQuestions.filter(q => q.target_level === 1).length;
      const totalL2 = dbQuestions.filter(q => q.target_level === 2).length;
      const totalL3 = dbQuestions.filter(q => q.target_level === 3).length;

      // Seviye geçiş barajı (Örn: %66 başarı)
      const PASS_RATE = 0.66;
      let finalLevel = 1;

      // Dinamik Oran Kontrolü
      if (totalL1 > 0 && (level1Yes / totalL1) >= PASS_RATE) {
        finalLevel = 2;
        if (totalL2 > 0 && (level2Yes / totalL2) >= PASS_RATE) {
          finalLevel = 3;
        }
      }

      const totalCorrect = answers.filter(a => a === 'yes').length;
      
      if (child?.id) {
        try {
          // Backend'e hem skoru hem de dinamik oranları gönderiyoruz
          const response = await fetch(`${BASE_URL}/children/${child.id}/update-level`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                correctAnswers: totalCorrect,
                calculatedLevel: finalLevel,
                ratios: {
                    l1: `${level1Yes}/${totalL1}`,
                    l2: `${level2Yes}/${totalL2}`,
                    l3: `${level3Yes}/${totalL3}`
                }
            }),
          });
          
          const data = await response.json();
          if (data.success) {
            finalLevel = data.level || finalLevel;
          }

          await fetch(`${BASE_URL}/children/${child.id}/mark-survey-complete`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Finalization error:', error);
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
        <Text style={{ marginTop: 10, fontWeight: '600' }}>Preparing Assessment...</Text>
      </View>
    );
  }

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = dbQuestions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{
        backgroundColor: '#FF6B9A', paddingTop: 55, paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between', elevation: 5
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{
          width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>Skill Assessment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {currentQuestions.map((item, index) => {
            const questionIndex = startIndex + index;
            const isYes = answers[questionIndex] === 'yes';
            const isNo = answers[questionIndex] === 'no';

            return (
               <View key={item.id} style={{ 
                 backgroundColor: '#fff', padding: 22, borderRadius: 24, marginBottom: 18,
                 shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3
               }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 20, color: '#2D3436', lineHeight: 24 }}>
                 {item.question_text}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={{ 
                      backgroundColor: isYes ? '#FF6B9A' : '#F1F2F6', 
                      width: '47%', paddingVertical: 14, borderRadius: 16, alignItems: 'center' 
                    }}
                    onPress={() => handleAnswer(questionIndex, 'yes')}
                  >
                      <Text style={{ color: isYes ? 'white' : '#636E72', fontWeight: '800' }}>YES</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={{ 
                       backgroundColor: isNo ? '#2D3436' : '#F1F2F6', 
                       width: '47%', paddingVertical: 14, borderRadius: 16, alignItems: 'center' 
                     }}
                    onPress={() => handleAnswer(questionIndex, 'no')}
                  >
                     <Text style={{ color: isNo ? 'white' : '#636E72', fontWeight: '800' }}>NO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={{ 
          position: 'absolute', bottom: 30, left: 20, right: 20, 
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
        }}>
            <TouchableOpacity onPress={handleBack} disabled={currentPage === 0}>
              <Text style={{ 
                color: currentPage > 0 ? '#FF6B9A' : 'transparent', 
                fontWeight: '800', fontSize: 16 
              }}>BACK</Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              backgroundColor: '#FF6B9A', paddingVertical: 16, paddingHorizontal: 40, 
              borderRadius: 30, shadowColor: '#FF6B9A', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6
            }}
            onPress={handleNext}
          >
             <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
              {currentPage < totalPages - 1 ? 'NEXT' : 'COMPLETE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SurveyScreen;