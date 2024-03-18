// The current AuthScreens.tsx
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import type {PublicScreensParamList} from '@navigation/types';
import ForceUpdateScreen from '@screens/ForceUpdateScreen';
import LoginScreen from '@screens/LoginScreen';
import SignUpScreen from '@screens/SignUpScreen';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator<PublicScreensParamList>();

function PublicScreens() {
  return (
    <RootStack.Navigator>
      {/* The structure for the HOME route has to be the same in public and auth screens. That's why the name for LoginScreen is BOTTOM_TAB_NAVIGATOR. */}
      <RootStack.Screen
        name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
        options={defaultScreenOptions}
        component={LoginScreen}
      />
      <RootStack.Screen
        name={SCREENS.FORCE_UPDATE}
        options={defaultScreenOptions}
        component={ForceUpdateScreen}
      />
      <RootStack.Screen
        name={SCREENS.SIGNUP}
        options={defaultScreenOptions}
        component={SignUpScreen}
      />
    </RootStack.Navigator>
  );
}

PublicScreens.displayName = 'PublicScreens';

export default PublicScreens;
