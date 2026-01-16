import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const questions = [
  "If you point at something across the room, does your child look at it?",
  "Have you ever wondered if your child might be deaf?",
  "Does your child play pretend or make-believe?",
  "Does your child like climbing on things?",
  "Does your child make unusual finger movements near his or her eyes?",
  "Does your child point with one finger to ask for something or to get help?",
  "Does your child point with one finger to show you something interesting?",
  "Is your child interested in other children?",
  "Does your child show you things by bringing them to you or holding them up for you to see?",
  "Does your child respond when you call his or her name?",
  "When you smile at your child, does he or she smile back at you?",
  "Does your child get upset by everyday noises?",
  "Does your child walk?",
  "Does your child look you in the eye when you are talking to him or her?",
  "Does your child try to copy what you do?",
  "If you turn your head to look at something, does your child look around to see what you are looking at?",
  "Does your child try to get you to watch him or her?",
  "Does your child understand when you tell him or her to do something?",
  "If something new happens, does your child look at your face to see how you feel about it?",
  "Does your child like movement activities?"
];

const SurveyScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const child = route.params?.child;

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // 💥 DEFAULT HEADER'I KAPAT
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
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
    const endIndex = startIndex + questionsPerPage;
    const unanswered = answers.slice(startIndex, endIndex).some((a) => a === null);

    if (unanswered) {
      Alert.alert('Incomplete', 'Please answer all questions on this page.');
      return;
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.replace('Result', { answers, child });
    }
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>

      {/* 🌟 PERFECT OVAL HEADER - Sabit, tam ortalanmış, estetik */}
      <View
        style={{
          backgroundColor: '#d9d9d9',
          paddingTop: 55,
          paddingBottom: 25,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 35,
          borderBottomRightRadius: 35,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FF6B9A',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 22, fontWeight: '700', color: '#444' }}>Survey</Text>

        {/* Sağ tarafı boş bırakarak başlığı tam ortaya alıyoruz */}
        <View style={{ width: 40 }} />
      </View>

      {/* MAIN CONTENT */}
      <View style={{ flex: 1, padding: 20 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {currentQuestions.map((question, index) => {
            const questionIndex = startIndex + index;
            const isYes = answers[questionIndex] === 'yes';
            const isNo = answers[questionIndex] === 'no';

            return (
              <View key={questionIndex} style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 12, color: '#333' }}>
                  {question}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: isYes ? '#b0b0b0' : '#e5e5e5',
                      paddingVertical: 12,
                      paddingHorizontal: 30,
                      borderRadius: 25,
                    }}
                    onPress={() => handleAnswer(questionIndex, 'yes')}
                  >
                    <Text style={{ color: '#222', fontSize: 16, fontWeight: isYes ? '700' : '500' }}>
                      Yes
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: isNo ? '#b0b0b0' : '#e5e5e5',
                      paddingVertical: 12,
                      paddingHorizontal: 30,
                      borderRadius: 25,
                    }}
                    onPress={() => handleAnswer(questionIndex, 'no')}
                  >
                    <Text style={{ color: '#222', fontSize: 16, fontWeight: isNo ? '700' : '500' }}>
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* BOTTOM BUTTONS */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {currentPage > 0 ? (
            <TouchableOpacity
              style={{
                backgroundColor: '#a0a0a0',
                paddingVertical: 12,
                paddingHorizontal: 25,
                borderRadius: 25,
              }}
              onPress={handleBack}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 100 }} />
          )}

          <TouchableOpacity
            style={{
              backgroundColor: '#FF6B9A',
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 25,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleNext}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 5 }}>
              {currentPage < totalPages - 1 ? 'Next' : 'Finish'}
            </Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>→</Text>
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
