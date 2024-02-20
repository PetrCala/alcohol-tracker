import React, {useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import InitialUrlContext from '@libs/InitialUrlContext';
import Navigation from '@libs/Navigation/Navigation';
// import PublicScreens from './PublicScreens';
// import AuthNavigator from './OldAuthNavigator';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';

type AppNavigatorProps = {
  /** If we have an authToken this is true */
  authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
  const initUrl = useContext(InitialUrlContext);

  useEffect(() => {
    if (!NativeModules.HybridAppModule || !initUrl) {
      return;
    }

    Navigation.isNavigationReady().then(() => {
      Navigation.navigate(initUrl);
    });
  }, [initUrl]);

  // TODO handle authentication
  // if (authenticated) {
  //   return <AuthScreens />;
  // }
  return <PublicScreens />;
}

AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
