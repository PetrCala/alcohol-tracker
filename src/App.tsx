import React, { useEffect, useState, version } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import firebaseConfig from "../firebaseConfig";

import ForceUpdateScreen from './screens/ForceUpdateScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import MainScreen from './screens/MainScreen';
import DrinkingSessionScreen from './screens/DrinkingSessionScreen';
import ProfileScreen from './screens/ProfileScreen';
import SocialScreen from './screens/SocialScreen';
import AchievementScreen from './screens/AchievementScreen';
import SettingsScreen from './screens/SettingsScreen';
import DayOverviewScreen from './screens/DayOverviewScreen';
import EditSessionScreen from './screens/EditSession';
import SessionSummaryScreen from './screens/SessionSummaryScreen';
import TermsAndAgreementsScreen from './screens/TermsAndAgreementsScreen';
import MainMenuScreen from './screens/MainMenuScreen';

import { ContextProvider } from './context/Context';

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app); // Available automatically after this call

const Stack = createNativeStackNavigator();

const AlcoholTracker = () => {
  return (
    <ContextProvider db={db}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
          >
          <Stack.Screen
            name = 'Login Screen'
            component={LoginScreen}
            options={{}}
          />
          <Stack.Screen
            name = 'Force Update Screen'
            component={ForceUpdateScreen}
            options={{}}
          />
          <Stack.Screen
            name = 'Sign Up Screen'
            component={SignUpScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Main Screen'
            component={MainScreen}
            options={{ }}
          />
          <Stack.Screen 
            name='Main Menu Screen'
            component={MainMenuScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Drinking Session Screen' 
            component={DrinkingSessionScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Profile Screen' 
            component={ProfileScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Social Screen' 
            component={SocialScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Achievement Screen' 
            component={AchievementScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Settings Screen' 
            component={SettingsScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Day Overview Screen' 
            component={DayOverviewScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Edit Session Screen' 
            component={EditSessionScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Session Summary Screen' 
            component={SessionSummaryScreen}
            options={{}}
          />
          <Stack.Screen 
            name='Terms And Agreements Screen' 
            component={TermsAndAgreementsScreen}
            options={{}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
};

export default AlcoholTracker;