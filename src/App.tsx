import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {app} from './services/firebaseSetup';

import AuthNavigator from './libs/Navigation/AuthNavigator';
import AppNavigator from './libs/Navigation/AppNavigator';
import Stack from './libs/Navigation/Stack';
import {ContextProvider} from './context/global/Context';

const Kiroku = () => {
  return (
    <ContextProvider app={app}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="App" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
};

export default Kiroku;
