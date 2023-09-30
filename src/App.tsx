import React, { useEffect, useState, version } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import firebaseConfig from "../firebaseConfig";

import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import Stack from './navigation/Stack';
import { ContextProvider } from './context/Context';

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app); // Available automatically after this call

const AlcoholTracker = () => {
  return (
    <ContextProvider db={db}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName='Auth'
          screenOptions={{
            headerShown: false
          }}
          >
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="App" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
};

export default AlcoholTracker;