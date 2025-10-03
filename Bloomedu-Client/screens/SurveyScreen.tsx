import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

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

const SurveyScreen = ({ navigation }: any) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const handleAnswer = (questionIndex: number, answer: 'yes' | 'no') => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.navigate('Result', { answers });
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {currentQuestions.map((question, index) => {
          const questionIndex = startIndex + index;
          return (
            <View key={questionIndex} style={{ marginBottom: 30 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 12, color: '#333' }}>
                {question}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {/* Yes Button */}
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 25,
                    borderRadius: 12,
                    backgroundColor: answers[questionIndex] === 'yes' ? '#888' : '#ccc',
                  }}
                  onPress={() => handleAnswer(questionIndex, 'yes')}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Yes</Text>
                </TouchableOpacity>

                {/* No Button */}
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 25,
                    borderRadius: 12,
                    backgroundColor: answers[questionIndex] === 'no' ? '#888' : '#ccc',
                  }}
                  onPress={() => handleAnswer(questionIndex, 'no')}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {/* Back Button */}
        {currentPage > 0 ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#aaa',
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 25,
            }}
            onPress={handleBack}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Back</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 100 }} />} {/* İlk sayfada boşluk bırak */}

        {/* Next / Finish Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FF6B9A',
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 25,
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

      {/* Page Indicator */}
      <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 14, color: '#555' }}>
        Page {currentPage + 1} of {totalPages}
      </Text>
    </View>
  );
};

export default SurveyScreen;
