// The current AuthScreens.tsx
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import type {PublicScreensParamList} from '@navigation/types';
import ForceUpdateScreen from '@components/Modals/ForceUpdateModal';
import LogInScreen from '@screens/SignUp/LogInScreen';
import SignUpScreen from '@screens/SignUp/SignUpScreen';
import InitialScreen from '@screens/SignUp/InitialScreen';
import ForgotPasswordScreen from '@screens/SignUp/ForgotPasswordScreen';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator<PublicScreensParamList>();

function PublicScreens() {
  return (
    <RootStack.Navigator>
      {/* The structure for the HOME route has to be the same in public and auth screens. That's why the name for SignUpScreen is BOTTOM_TAB_NAVIGATOR. */}
      <RootStack.Screen
        name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
        options={defaultScreenOptions}
        component={InitialScreen}
      />
      <RootStack.Screen
        name={SCREENS.LOG_IN}
        options={defaultScreenOptions}
        component={LogInScreen}
      />
      <RootStack.Screen
        name={SCREENS.SIGN_UP}
        options={defaultScreenOptions}
        component={SignUpScreen}
      />
      <RootStack.Screen
        name={SCREENS.FORGOT_PASSWORD}
        options={defaultScreenOptions}
        component={ForgotPasswordScreen}
      />
      <RootStack.Screen
        name={SCREENS.FORCE_UPDATE}
        options={defaultScreenOptions}
        component={ForceUpdateScreen}
      />
    </RootStack.Navigator>
  );
}

PublicScreens.displayName = 'PublicScreens';

export default PublicScreens;
