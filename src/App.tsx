import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import MainScreen from './screens/MainScreen';
import LoginScreen from './screens/LoginScreen';
import DrinkingSessionScreen from './screens/DrinkingSessionScreen';
import ProfileScreen from './screens/ProfileScreen';
import SocialScreen from './screens/SocialScreen';
import AchievementScreen from './screens/AchievementScreen';
import SettingsScreen from './screens/SettingsScreen';
import DayOverviewScreen from './screens/DayOverviewScreen';
import EditSessionScreen from './screens/EditSession';

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import firebaseConfig from "../firebaseConfig";
import DatabaseContext from './database/DatabaseContext';

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app); // Available automatically after this call

const Stack = createNativeStackNavigator();

const AlcoholTracker = () => {
  return (
    <DatabaseContext.Provider value={db}>
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
            name='Main Screen'
            component={MainScreen}
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
        </Stack.Navigator>
      </NavigationContainer>
    </DatabaseContext.Provider>
  );
};

export default AlcoholTracker;