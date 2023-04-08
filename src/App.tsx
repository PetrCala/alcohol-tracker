import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack'

import MainScreen from './screens/MainScreen';
import DrinkingSession from './screens/DrinkingSessionScreen';

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import DatabaseContext from './DatabaseContext';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
            name='Main Screen'
            component={MainScreen}
            options={{}}
          />
          <Stack.Screen 
          name='Drinking Session' 
          component={DrinkingSession}
          options={{}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DatabaseContext.Provider>
  );
};

export default AlcoholTracker;