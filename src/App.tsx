import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './screens/MainScreen';
import DrinkingSession from './screens/DrinkingSessionScreen';

const Stack = createNativeStackNavigator();

const AlcoholTracker = () => {
  return (
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
  )
};

export default AlcoholTracker;