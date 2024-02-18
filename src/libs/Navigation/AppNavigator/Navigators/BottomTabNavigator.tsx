import {useNavigationState} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import ActiveRouteContext from './ActiveRouteContext';
import HomeScreen from '@screens/MainScreen';

// const loadWorkspaceInitialPage = () =>
//   require('../../../../pages/workspace/WorkspaceInitialPage')
//     .default as React.ComponentType;

const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
  headerShown: false,
  animationEnabled: false,
};

function BottomTabNavigator() {
  const activeRoute = useNavigationState(getTopmostCentralPaneRoute);
  return (
    <ActiveRouteContext.Provider value={activeRoute?.name ?? ''}>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name={SCREENS.HOME} component={HomeScreen} />
        {/* <Tab.Screen name={SCREENS.HOME} component={SidebarScreen} />
        <Tab.Screen name={SCREENS.ALL_SETTINGS} component={AllSettingsScreen} />
        <Tab.Screen
          name={SCREENS.WORKSPACE.INITIAL}
          getComponent={loadWorkspaceInitialPage}
        /> */}
      </Tab.Navigator>
    </ActiveRouteContext.Provider>
  );
}

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
