import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import firebaseConfig from '../firebaseConfig';

import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import Stack from './navigation/Stack';
import { ContextProvider } from './context/Context';

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

const Kiroku = () => {
  return (
    <ContextProvider app={app}>
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