import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChildGameDetailsScreen from './screens/ChildGameDetailsScreen';

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
import ParentMessageCategoriesScreen from './screens/ParentMessageCategoriesScreen';
import ParentVerifyResetCodeScreen from './screens/ParentVerifyResetCodeScreen';
import ParentChildrenOverviewScreen from './screens/ParentChildrenOverviewScreen';

import ChatScreen from './screens/ChatScreen';
import ChildInfoScreen from './screens/ChildInfoScreen';
import SurveyScreen from './screens/SurveyScreen';
import ResultScreen from './screens/ResultScreen';
import WelcomeSuccessScreen from './screens/WelcomeSuccessScreen';

import EducationScreen from './screens/EducationScreen';
import CategoryGamesScreen from './screens/CategoryGamesScreen';
import ColorsGameScreen from './screens/ColorsGameScreen';
import ColorsMatchingGameScreen from './screens/ColorsMatchingGameScreen';

import ColorsRecognitionLevel1 from './screens/games/Level1/ColorsRecognitionLevel1';
import StarTrackingLevel1 from './screens/games/Level1/StarTrackingLevel1';
import LearnNumbersLevel1 from './screens/games/Level1/LearnNumbersLevel1';
import SortNumbersLevel1 from './screens/games/Level1/SortNumbersLevel1';
import AnimalSoundsLevel1 from './screens/games/Level1/AnimalSoundsLevel1';
import FruitBasketLevel1 from './screens/games/Level1/FruitBasketLevel1';
import MeetMyFamilyLevel1 from './screens/games/Level1/MeetMyFamilyLevel1';

import ColorObjectsLevel2 from './screens/games/Level2/ColorObjectsLevel2';
import MissingNumbersLevel2 from './screens/games/Level2/MissingNumbersLevel2';
import MatchNumbersLevel2 from './screens/games/Level2/MatchNumbersLevel2';
import ColorMatchPathLevel2 from './screens/games/Level2/ColorMatchPathLevel2';
import SortingBasketsLevel2 from './screens/games/Level2/SortingBasketsLevel2';
import FindFamilyMemberLevel2 from './screens/games/Level2/FindFamilyMemberLevel2';

import ShapeMatchLevel3 from './screens/games/Level3/ShapeMatchLevel3';

import TeacherLoginScreen from './screens/TeacherLoginScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import TeacherStudentsOverviewScreen from './screens/TeacherStudentsOverviewScreen';
import TeacherAddChildScreen from './screens/TeacherAddChildScreen';
import TeacherFeedbackScreen from './screens/TeacherFeedbackScreen';
import TeacherChatListScreen from './screens/TeacherChatListScreen';

import ChildProgressScreen from './screens/ChildProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

// ⭐⭐⭐ YENİ: Child Select Screen (Communication akışı için)
import ChildSelectScreen from './screens/ChildSelectScreen';

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

          <Stack.Screen
            name="Dashboard"
            component={ParentDashboardScreen}
            options={{ title: 'Parent Dashboard', headerTintColor: '#7a8a91' }}
          />

          <Stack.Screen name="AddChild" component={ParentAddChildScreen} />
          <Stack.Screen name="ParentFeedbacks" component={ParentFeedbacksScreen} />

          <Stack.Screen 
            name="ParentAIChat" 
            component={ParentAIChatScreen} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen 
            name="ParentMessageCategories" 
            component={ParentMessageCategoriesScreen}
            options={{ title: 'Communication Board' }}
          />

          {/* ⭐ NEW — Parent Child Select Screen */}
          <Stack.Screen
            name="ChildSelectScreen"
            component={ChildSelectScreen}
            options={{ title: 'Select Child' }}
          />

          <Stack.Screen 
            name="ParentChildrenOverview"
            component={ParentChildrenOverviewScreen}
            options={{ title: 'Your Children', headerTintColor: '#7a8a91' }}
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

          <Stack.Screen
            name="ChildGameDetails"
            component={ChildGameDetailsScreen}
            options={{ headerShown: false }}
          />

          {/* === LEVEL GAMES === */}
          <Stack.Screen name="ColorsRecognitionLevel1" component={ColorsRecognitionLevel1} />
          <Stack.Screen name="StarTrackingLevel1" component={StarTrackingLevel1} />
          <Stack.Screen name="LearnNumbersLevel1" component={LearnNumbersLevel1} />
          <Stack.Screen name="SortNumbersLevel1" component={SortNumbersLevel1} />
          <Stack.Screen name="AnimalSoundsLevel1" component={AnimalSoundsLevel1} />
          <Stack.Screen name="FruitBasketLevel1" component={FruitBasketLevel1} />
          <Stack.Screen name="MeetMyFamilyLevel1" component={MeetMyFamilyLevel1} />

          <Stack.Screen name="ColorObjectsLevel2" component={ColorObjectsLevel2} />
          <Stack.Screen name="MissingNumbersLevel2" component={MissingNumbersLevel2} />
          <Stack.Screen name="MatchNumbersLevel2" component={MatchNumbersLevel2} />
          <Stack.Screen name="ColorMatchPathLevel2" component={ColorMatchPathLevel2} />
          <Stack.Screen name="SortingBasketsLevel2" component={SortingBasketsLevel2} />
          <Stack.Screen name="FindFamilyMemberLevel2" component={FindFamilyMemberLevel2} />

          <Stack.Screen name="ShapeMatchLevel3" component={ShapeMatchLevel3} />

          {/* === TEACHER SIDE === */}
          <Stack.Screen name="Teacher" component={TeacherLoginScreen} />
          <Stack.Screen name="TeacherStudents" component={TeacherDashboardScreen} />
          <Stack.Screen name="TeacherStudentsOverview" component={TeacherStudentsOverviewScreen} />
          <Stack.Screen name="TeacherAddChild" component={TeacherAddChildScreen} />
          <Stack.Screen name="TeacherChatList" component={TeacherChatListScreen} />
          <Stack.Screen name="TeacherFeedback" component={TeacherFeedbackScreen} />
          <Stack.Screen name="ChildProgress" component={ChildProgressScreen} />

          {/* === OTHER === */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ParentForgotPassword" component={ParentForgotPasswordScreen} />

          <Stack.Screen
            name="ParentVerifyReset"
            component={ParentVerifyResetCodeScreen}
            options={{ title: 'Verify Code' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </FeedbackProvider>
  );
}
