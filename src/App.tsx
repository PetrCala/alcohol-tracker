import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { app } from './services/firebaseConfig';

import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import Stack from './navigation/Stack';
import { ContextProvider } from './context/Context';

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