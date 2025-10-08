import React, { useState, useEffect } from 'react';
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
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
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
                    borderRadius: 25, // ✅ oval
                  }}
                  onPress={() => handleAnswer(questionIndex, 'yes')}
                >
                  <Text
                    style={{
                      color: '#222',
                      fontSize: 16,
                      fontWeight: isYes ? '700' : '500',
                    }}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: isNo ? '#b0b0b0' : '#e5e5e5',
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 25, // ✅ oval
                  }}
                  onPress={() => handleAnswer(questionIndex, 'no')}
                >
                  <Text
                    style={{
                      color: '#222',
                      fontSize: 16,
                      fontWeight: isNo ? '700' : '500',
                    }}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* === Bottom Buttons === */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {currentPage > 0 ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#a0a0a0',
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 25, // ✅ oval
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
            backgroundColor: '#FF6B9A', // ✅ tekrar pembe oldu
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 25, // ✅ oval
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
          onPress={handleNext}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 5 }}>
            {currentPage < totalPages - 1 ? 'Next' : 'Finish'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 14, color: '#555' }}>
        Page {currentPage + 1} of {totalPages}
      </Text>
    </View>
  );
};

export default SurveyScreen;
