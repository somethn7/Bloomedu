import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ParentSignUpScreen from './screens/ParentSignUpScreen';
import ParentVerifyCodeScreen from './screens/ParentVerifyCodeScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddChildScreen from './screens/AddChildScreen';
import ChildInfoScreen from './screens/ChildInfoScreen';
import SurveyScreen from './screens/SurveyScreen';
import ResultScreen from './screens/ResultScreen';
import EducationScreen from './screens/EducationScreen';
import ColorsGameScreen from './screens/ColorsGameScreen';
import ColorsMatchingGameScreen from './screens/ColorsMatchingGameScreen';

import TeacherScreen from './screens/TeacherScreen';
import TeacherStudentsScreen from './screens/TeacherStudentsScreen';
import TeacherAddChildScreen from './screens/TeacherAddChildScreen';

import SettingsScreen from './screens/SettingsScreen';

import { FeedbackProvider } from './screens/Contexts/FeedbackContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <FeedbackProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: true }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={ParentSignUpScreen} />
          <Stack.Screen name="ParentVerifyCode" component={ParentVerifyCodeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="AddChild" component={AddChildScreen} />
          <Stack.Screen name="ChildInfo" component={ChildInfoScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Education" component={EducationScreen} />
          <Stack.Screen name="ColorsGame" component={ColorsGameScreen} />
          <Stack.Screen name="ColorsMatchingGame" component={ColorsMatchingGameScreen} />
          <Stack.Screen
            name="Teacher"
            component={TeacherScreen}
            options={{ title: 'Teacher Login', headerTintColor: '#7a8a91' }}
          />
          <Stack.Screen
            name="TeacherStudents"
            component={TeacherStudentsScreen}
            options={{ title: 'Students', headerTintColor: 'grey' }}
          />
          <Stack.Screen
            name="TeacherAddChild"
            component={TeacherAddChildScreen}
            options={{ title: 'Add Student', headerTintColor: 'grey' }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </FeedbackProvider>
  );
}
