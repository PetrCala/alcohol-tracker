import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from "firebase/storage"
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import firebaseConfig from "../firebaseConfig";

import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import Stack from './navigation/Stack';
import { ContextProvider } from './context/Context';

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

const db = getDatabase(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

const Kiroku = () => {
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

export default Kiroku;