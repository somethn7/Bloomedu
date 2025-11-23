import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ParentLoginScreen from './screens/ParentLoginScreen';
import ParentSignUpScreen from './screens/ParentSignUpScreen';
import ParentVerifyCodeScreen from './screens/ParentVerifyCodeScreen';
import ParentDashboardScreen from './screens/ParentDashboardScreen';
import ParentAddChildScreen from './screens/ParentAddChildScreen';
import ParentForgotPasswordScreen from './screens/ParentForgotPasswordScreen';
import ParentFeedbacksScreen from './screens/ParentFeedbacksScreen';
import ParentAIChatScreen from './screens/ParentAIChatScreen';
import ChildInfoScreen from './screens/ChildInfoScreen';
import SurveyScreen from './screens/SurveyScreen';
import ResultScreen from './screens/ResultScreen';
import EducationScreen from './screens/EducationScreen';
import CategoryGamesScreen from './screens/CategoryGamesScreen';
import ColorsGameScreen from './screens/ColorsGameScreen';
import ColorsMatchingGameScreen from './screens/ColorsMatchingGameScreen';

import ParentMessageCategoriesScreen from './screens/ParentMessageCategoriesScreen';
import ChatScreen from './screens/ChatScreen';
// -umut: (22.11.2025) Added TeacherChatListScreen
import TeacherChatListScreen from './screens/TeacherChatListScreen';

// -umut: Level 1 oyunları için yeni import eklendi (28.10.2025)
// Oyun skor takibi sisteminin bir parçası
// Level 1 Games
import ColorsRecognitionLevel1 from './screens/games/Level1/ColorsRecognitionLevel1';
import StarTrackingLevel1 from './screens/games/Level1/StarTrackingLevel1';
import LearnNumbersLevel1 from './screens/games/Level1/LearnNumbersLevel1';
import SortNumbersLevel1 from './screens/games/Level1/SortNumbersLevel1';
import AnimalSoundsLevel1 from './screens/games/Level1/AnimalSoundsLevel1';
import FruitBasketLevel1 from './screens/games/Level1/FruitBasketLevel1';
import MeetMyFamilyLevel1 from './screens/games/Level1/MeetMyFamilyLevel1';

// -umut: Level 2 oyunları (28.10.2025)
// Level 2 Games
import ColorObjectsLevel2 from './screens/games/Level2/ColorObjectsLevel2';
import MissingNumbersLevel2 from './screens/games/Level2/MissingNumbersLevel2';
import MatchNumbersLevel2 from './screens/games/Level2/MatchNumbersLevel2';
import ColorMatchPathLevel2 from './screens/games/Level2/ColorMatchPathLevel2';
import SortingBasketsLevel2 from './screens/games/Level2/SortingBasketsLevel2';
import FindFamilyMemberLevel2 from './screens/games/Level2/FindFamilyMemberLevel2';

// Level 3 Games
import ShapeMatchLevel3 from './screens/games/Level3/ShapeMatchLevel3';

import TeacherLoginScreen from './screens/TeacherLoginScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import TeacherStudentsOverviewScreen from './screens/TeacherStudentsOverviewScreen';
import TeacherAddChildScreen from './screens/TeacherAddChildScreen';
import TeacherFeedbackScreen from './screens/TeacherFeedbackScreen';
import WelcomeSuccessScreen from './screens/WelcomeSuccessScreen';

// -umut: Çocuk gelişim ekranı (28.10.2025)
import ChildProgressScreen from './screens/ChildProgressScreen';

import SettingsScreen from './screens/SettingsScreen';
import { FeedbackProvider } from './screens/Contexts/FeedbackContext';

const Stack = createNativeStackNavigator<any>();

export default function App() {
  return (
    <FeedbackProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: true }}>

          {/* === PARENT SIDE === */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={ParentLoginScreen} />
          <Stack.Screen name="Signup" component={ParentSignUpScreen} />
          <Stack.Screen name="ParentVerifyCode" component={ParentVerifyCodeScreen} />
          
          {/* 👇 ÖNEMLİ: Dashboard ismi 'Dashboard' */}
          <Stack.Screen
            name="Dashboard"
            component={ParentDashboardScreen}
            options={{ title: 'Parent Dashboard', headerTintColor: '#7a8a91' }}
          />

          <Stack.Screen name="AddChild" component={ParentAddChildScreen} />
          <Stack.Screen
            name="ParentFeedbacks"
            component={ParentFeedbacksScreen}
            options={{ title: 'Feedbacks', headerTintColor: '#7a8a91' }}
          />
          {/* -umut: (22.11.2025) Added ParentAIChatScreen to navigation */}
          <Stack.Screen 
            name="ParentAIChat" 
            component={ParentAIChatScreen} 
            options={{ headerShown: false }}
          />
          {/* -umut: (22.11.2025) Added Advanced Communication Screens */}
          <Stack.Screen 
            name="ParentMessageCategories" 
            component={ParentMessageCategoriesScreen} 
            options={{ title: 'Communication Board' }}
          />
          <Stack.Screen 
            name="ChatScreen" 
            component={ChatScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ChildInfo" component={ChildInfoScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen 
            name="WelcomeSuccess" 
            component={WelcomeSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Education" component={EducationScreen} />
          <Stack.Screen 
            name="CategoryGames" 
            component={CategoryGamesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ColorsGame" component={ColorsGameScreen} />
          <Stack.Screen name="ColorsMatchingGame" component={ColorsMatchingGameScreen} />
          
          {/* -umut: Level 1 oyunları için navigation route eklendi (28.10.2025) */}
          {/* Renk tanıma oyunu - Child bilgisini alır ve skorları backend'e kaydeder */}
          {/* === LEVEL 1 GAMES === */}
          <Stack.Screen 
            name="ColorsRecognitionLevel1" 
            component={ColorsRecognitionLevel1}
            options={{ 
              title: '🎨 Color Match - Beginner', 
              headerTintColor: '#FF6B9A',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="StarTrackingLevel1" 
            component={StarTrackingLevel1}
            options={{ 
              title: '🌙 Bedtime Journey - Focus', 
              headerTintColor: '#5DADE2',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="LearnNumbersLevel1" 
            component={LearnNumbersLevel1}
            options={{ 
              title: '🔢 Learn Numbers - Beginner', 
              headerTintColor: '#4ECDC4',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="SortNumbersLevel1" 
            component={SortNumbersLevel1}
            options={{ 
              title: '🔢 Sort Numbers - Beginner', 
              headerTintColor: '#45B7D1',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="AnimalSoundsLevel1" 
            component={AnimalSoundsLevel1}
            options={{ 
              title: '🎵 Animal Sounds - Beginner', 
              headerTintColor: '#FFD43B',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="FruitBasketLevel1" 
            component={FruitBasketLevel1}
            options={{ 
              title: '🍎 Fruit Basket - Focus', 
              headerTintColor: '#81C784',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="MeetMyFamilyLevel1" 
            component={MeetMyFamilyLevel1}
            options={{ 
              title: '👨‍👩‍👧‍👦 Meet My Family - Beginner', 
              headerTintColor: '#FF6B9A',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />

          {/* -umut: Level 2 oyunları (28.10.2025) */}
          {/* Renk + Nesne kombinasyonu oyunu */}
          {/* === LEVEL 2 GAMES === */}
          <Stack.Screen 
            name="ColorObjectsLevel2" 
            component={ColorObjectsLevel2}
            options={{ 
              title: '🎯 Color Objects - Intermediate', 
              headerTintColor: '#4DABF7',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="MissingNumbersLevel2" 
            component={MissingNumbersLevel2}
            options={{ 
              title: '🔢 Missing Numbers - Intermediate', 
              headerTintColor: '#85C1E9',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="MatchNumbersLevel2" 
            component={MatchNumbersLevel2}
            options={{ 
              title: '🔢 Match Numbers - Intermediate', 
              headerTintColor: '#96CEB4',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="ColorMatchPathLevel2" 
            component={ColorMatchPathLevel2}
            options={{ 
              title: '🎨 Color Match Path - Intermediate', 
              headerTintColor: '#4ECDC4',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="SortingBasketsLevel2" 
            component={SortingBasketsLevel2}
            options={{ 
              title: '🧺 Sorting Baskets - Intermediate', 
              headerTintColor: '#00796B',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />
          <Stack.Screen 
            name="FindFamilyMemberLevel2" 
            component={FindFamilyMemberLevel2}
            options={{ 
              title: '👨‍👩‍👧‍👦 Find Family Member - Intermediate', 
              headerTintColor: '#FF6B9A',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />

          {/* Level 3 Games */}
          <Stack.Screen 
            name="ShapeMatchLevel3" 
            component={ShapeMatchLevel3}
            options={{ 
              title: '🌼 Shape Match - Advanced', 
              headerTintColor: '#51CF66',
              headerStyle: { backgroundColor: '#FFF' }
            }}
          />

          {/* === TEACHER SIDE === */}
          <Stack.Screen
            name="Teacher"
            component={TeacherLoginScreen}
            options={{ title: 'Teacher Login', headerTintColor: '#7a8a91' }}
          />
          <Stack.Screen
            name="TeacherStudents"
            component={TeacherDashboardScreen}
            options={{ title: 'Students', headerTintColor: 'grey' }}
          />
          <Stack.Screen
            name="TeacherStudentsOverview"
            component={TeacherStudentsOverviewScreen}
            options={{ title: 'Students Overview', headerTintColor: 'grey' }}
          />
          <Stack.Screen
            name="TeacherAddChild"
            component={TeacherAddChildScreen}
            options={{ title: 'Add Student', headerTintColor: 'grey' }}
          />
          {/* -umut: (22.11.2025) Added Teacher Chat List */}
          <Stack.Screen
            name="TeacherChatList"
            component={TeacherChatListScreen}
            options={{ title: 'Messages', headerTintColor: 'grey' }}
          />
          <Stack.Screen
            name="TeacherFeedback"
            component={TeacherFeedbackScreen as any}
            options={{ title: 'Send Feedback', headerTintColor: 'grey' }}
          />
          <Stack.Screen
            name="ChildProgress"
            component={ChildProgressScreen}
            options={{ title: 'Student Progress', headerTintColor: '#4DABF7' }}
          />

          {/* === OTHER === */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="ParentForgotPassword"
            component={ParentForgotPasswordScreen}
            options={{ title: 'Reset Password', headerTintColor: '#7a8a91' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FeedbackProvider>
  );
}
