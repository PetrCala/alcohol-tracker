import React, {lazy, memo, Suspense, useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import InitialUrlContext from '@libs/InitialUrlContext';
import Navigation from '@navigation/Navigation';
import lazyRetry from '@src/utils/lazyRetry';

const AuthScreens = lazy(() => lazyRetry(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));

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

  if (authenticated) {
    // These are the protected screens and only accessible when an authToken is present
    return (
      <Suspense fallback={null}>
        <AuthScreens />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <PublicScreens />
    </Suspense>
  );
}

AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
