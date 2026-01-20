import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GenericMatchingGame from './screens/games/generic';

import ChildGameDetailsScreen from './screens/ChildGameDetailsScreen';
import ObjectColorMatchLevel3 from './screens/games/Colors/Level3/ObjectColorMatchLevel3';
import MagicColorLab from './screens/games/Colors/Level3/MagicColorLab';
import ObjectColorMatchLevel4 from './screens/games/Colors/Level4/ObjectColorMatchLevel4';

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
import ColorsMatchingGameScreen from './screens/games/Colors/Level2/ColorsMatchingGameScreen';
import ColorParkingGame from './screens/games/Colors/Level1/ColorParking';
import BalloonPop from './screens/games/Colors/Level1/BalloonPop';
import CaterpillarColoringGame from './screens/games/Colors/Level1/Caterpillar';

import ColorsRecognitionLevel1 from './screens/games/Colors/Level1/ColorsRecognitionLevel1';
import StarTrackingLevel1 from './screens/games/Objects/Level1/StarTrackingLevel1';
import LearnNumbersLevel1 from './screens/games/Numbers/Level1/LearnNumbersLevel1';
import SortNumbersLevel1 from './screens/games/Numbers/Level1/SortNumbersLevel1';
import MissingNumbersLevel1 from './screens/games/Numbers/Level1/MissingNumbers';
import MatchNumbersLevel1 from './screens/games/Numbers/Level1/MatchNumbers';
import ComparisonLevel1 from './screens/games/Numbers/Level1/Comparision';
import AnimalSoundsLevel1 from './screens/games/Animals/Level1/AnimalSoundsLevel1';
import AnimalHabitat from './screens/games/Animals/Level1/Level3/AnimalHabitat';
import AnimalLifeCycleLevel3 from './screens/games/Animals/Level1/Level3/AnimalLifeCycle';
import FruitBasketLevel1 from './screens/games/Objects/Level1/FruitBasketLevel1';
import MeetMyFamilyLevel1 from './screens/games/Family/Level1/MeetMyFamilyLevel1';
import CountBasket from './screens/games/Mixed/Mix1/CountBasket';
import SizeMatching from './screens/games/Mixed/Mix1/SizeMatching';
 import SizeClothes from './screens/games/Mixed/Mix1/SizeClothes';

import ColorObjectsLevel2 from './screens/games/Colors/Level2/ColorObjectsLevel2';
import ColorMatchPathLevel2 from './screens/games/Colors/Level2/ColorMatchPathLevel2';
import SortingBasketsLevel2 from './screens/games/Objects/Level2/SortingBasketsLevel2';
import FindFamilyMemberLevel2 from './screens/games/Family/Level2/FindFamilyMemberLevel2';
import FamilyDutyLevel3 from './screens/games/Family/Level3/FamilyDutyLevel3';

import ShapeMatchLevel3 from './screens/games/Objects/Level3/ShapeMatchLevel3';
import BasicMath from './screens/games/Numbers/Level3/BasicMath';
import FruitChefLevel3 from './screens/games/Fruits/Level3/FruitChef';
import VeggiePatternLevel3 from './screens/games/Vegetables/Level3/VeggiePattern';
import SocialReasoningLevel3 from './screens/games/Emotions/Level3/HowDoTheyFeel';
import RouteMasterLevel3 from './screens/games/Vehicles/Level3/RouteMaster';
import JobHeroesLevel3 from './screens/games/Jobs/Level3/JobHeroes';
import BodyCareLevel3 from './screens/games/BodyParts/Level3/BodyCareLevel3';
import SchoolMissionsLevel3 from './screens/games/School/Level3/SchoolMissions';
import FruitLogicLevel3 from './screens/games/Fruits/Level3/FruitLogicLevel3';

import TeacherLoginScreen from './screens/TeacherLoginScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import TeacherStudentsOverviewScreen from './screens/TeacherStudentsOverviewScreen';
import TeacherAddChildScreen from './screens/TeacherAddChildScreen';
import TeacherFeedbackScreen from './screens/TeacherFeedbackScreen';
import TeacherChatListScreen from './screens/TeacherChatListScreen';

import ChildProgressScreen from './screens/ChildProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

import ChildSelectScreen from './screens/ChildSelectScreen';
import { FeedbackProvider } from './screens/Contexts/FeedbackContext';

const Stack = createNativeStackNavigator<any>();

export default function App() {
  return (
    <FeedbackProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: true }}>

<Stack.Screen name="GenericMatchingGame" component={GenericMatchingGame} />

          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={ParentLoginScreen} />
          <Stack.Screen name="Signup" component={ParentSignUpScreen} />
          <Stack.Screen name="ParentVerifyCode" component={ParentVerifyCodeScreen} />
          <Stack.Screen name="Dashboard" component={ParentDashboardScreen} options={{ headerTintColor: '#7a8a91' }} />
          <Stack.Screen name="AddChild" component={ParentAddChildScreen} />
          <Stack.Screen name="ParentFeedbacks" component={ParentFeedbacksScreen} />
          <Stack.Screen name="ParentAIChat" component={ParentAIChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ParentMessageCategories" component={ParentMessageCategoriesScreen} />
          <Stack.Screen name="ChildSelectScreen" component={ChildSelectScreen} />
          <Stack.Screen name="ParentChildrenOverview" component={ParentChildrenOverviewScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChildInfo" component={ChildInfoScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="WelcomeSuccess" component={WelcomeSuccessScreen} options={{ headerShown: false }} />

          <Stack.Screen name="Education" component={EducationScreen} />
          <Stack.Screen name="CategoryGames" component={CategoryGamesScreen} options={{ headerShown: false }} />

          <Stack.Screen name="ColorsGame" component={ColorsGameScreen} />
          <Stack.Screen name="ColorsMatchingGame" component={ColorsMatchingGameScreen} />
                    <Stack.Screen name="ColorParking" component={ColorParkingGame} />
          <Stack.Screen name="BalloonPop" component={BalloonPop} />
          <Stack.Screen name="CaterpillarColoringGame" component={CaterpillarColoringGame} />

          <Stack.Screen name="ChildGameDetails" component={ChildGameDetailsScreen} options={{ headerShown: false }} />

          {/* LEVEL 1 */}
          <Stack.Screen name="ColorsRecognitionLevel1" component={ColorsRecognitionLevel1} />
          <Stack.Screen name="StarTrackingLevel1" component={StarTrackingLevel1} />
          <Stack.Screen name="LearnNumbersLevel1" component={LearnNumbersLevel1} />
          <Stack.Screen name="SortNumbersLevel1" component={SortNumbersLevel1} />
                    <Stack.Screen name="MissingNumbersLevel1" component={MissingNumbersLevel1} />
          <Stack.Screen name="MatchNumbersLevel1" component={MatchNumbersLevel1} />
          <Stack.Screen name="ComparisonLevel1" component={ComparisonLevel1} />
          <Stack.Screen name="AnimalSoundsLevel1" component={AnimalSoundsLevel1} />
          <Stack.Screen name="FruitBasketLevel1" component={FruitBasketLevel1} />
          <Stack.Screen name="MeetMyFamilyLevel1" component={MeetMyFamilyLevel1} />
                    <Stack.Screen name="CountBasket" component={CountBasket} />
          <Stack.Screen name="SizeMatching" component={SizeMatching} />
          <Stack.Screen name="SizeClothes" component={SizeClothes} />

          {/* LEVEL 2 */}
          <Stack.Screen name="ColorObjectsLevel2" component={ColorObjectsLevel2} />
          <Stack.Screen name="ColorMatchPathLevel2" component={ColorMatchPathLevel2} />
          <Stack.Screen name="SortingBasketsLevel2" component={SortingBasketsLevel2} />
          <Stack.Screen name="FindFamilyMemberLevel2" component={FindFamilyMemberLevel2} />

          {/* LEVEL 3 */}
          <Stack.Screen name="ShapeMatchLevel3" component={ShapeMatchLevel3} />
          <Stack.Screen name="ObjectColorMatchLevel3" component={ObjectColorMatchLevel3} />
          <Stack.Screen name="MagicColorLab" component={MagicColorLab} />
          <Stack.Screen name="FamilyDutyLevel3" component={FamilyDutyLevel3} />
          <Stack.Screen name="BasicMath" component={BasicMath} />
          <Stack.Screen name="AnimalHabitat" component={AnimalHabitat} />
          <Stack.Screen name="AnimalLifeCycle" component={AnimalLifeCycleLevel3} />
          <Stack.Screen name="FruitChef" component={FruitChefLevel3} />
          <Stack.Screen name="VeggiePatternLevel3" component={VeggiePatternLevel3} />
          <Stack.Screen name="SocialReasoning" component={SocialReasoningLevel3} />
          <Stack.Screen name="RouteMaster" component={RouteMasterLevel3} />
          <Stack.Screen name="JobHeroes" component={JobHeroesLevel3} />
          <Stack.Screen name="BodyCare" component={BodyCareLevel3} />
          <Stack.Screen name="SchoolMissions" component={SchoolMissionsLevel3} />
          <Stack.Screen name="FruitLogic" component={FruitLogicLevel3} />

          {/* LEVEL 4 — NEW GAME */}
          <Stack.Screen name="ObjectColorMatchLevel4" component={ObjectColorMatchLevel4} />

          {/* TEACHER */}
          <Stack.Screen name="Teacher" component={TeacherLoginScreen} />
          <Stack.Screen name="TeacherStudents" component={TeacherDashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TeacherStudentsOverview" component={TeacherStudentsOverviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TeacherAddChild" component={TeacherAddChildScreen} />
          <Stack.Screen name="TeacherChatList" component={TeacherChatListScreen} />
          <Stack.Screen name="TeacherFeedback" component={TeacherFeedbackScreen} />
          <Stack.Screen name="ChildProgress" component={ChildProgressScreen} options={{ headerShown: false }} />

          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ParentForgotPassword" component={ParentForgotPasswordScreen} />
          <Stack.Screen name="ParentVerifyReset" component={ParentVerifyResetCodeScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </FeedbackProvider>
  );
}
