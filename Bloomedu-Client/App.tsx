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
import ChildInfoScreen from './screens/ChildInfoScreen';
import SurveyScreen from './screens/SurveyScreen';
import ResultScreen from './screens/ResultScreen';
import EducationScreen from './screens/EducationScreen';
import ColorsGameScreen from './screens/ColorsGameScreen';
import ColorsMatchingGameScreen from './screens/ColorsMatchingGameScreen';

import TeacherLoginScreen from './screens/TeacherLoginScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import TeacherAddChildScreen from './screens/TeacherAddChildScreen';
import TeacherFeedbackScreen from './screens/TeacherFeedbackScreen';

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
          <Stack.Screen name="ChildInfo" component={ChildInfoScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Education" component={EducationScreen} />
          <Stack.Screen name="ColorsGame" component={ColorsGameScreen} />
          <Stack.Screen name="ColorsMatchingGame" component={ColorsMatchingGameScreen} />

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
            name="TeacherAddChild"
            component={TeacherAddChildScreen}
            options={{ title: 'Add Student', headerTintColor: 'grey' }}
          />
          <Stack.Screen
            name="TeacherFeedback"
            component={TeacherFeedbackScreen as any}
            options={{ title: 'Send Feedback', headerTintColor: 'grey' }}
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
