import React from 'react';
import type {Route} from './ROUTES';
import InitialUrlContext from '@libs/InitialUrlContext';
import ColorSchemeWrapper from './components/ColorSchemeWrapper';
import Kiroku from './Kiroku';
import ComposeProviders from '@components/ComposeProviders';
import CustomStatusBarAndBackground from './components/CustomStatusBarAndBackground';
import CustomStatusBarAndBackgroundContextProvider from './components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContextProvider';
import ErrorBoundary from './components/ErrorBoundary';
import OnyxProvider from './components/OnyxProvider';
import {FirebaseProvider} from '@context/global/FirebaseContext';
import {UserConnectionProvider} from '@context/global/UserConnectionContext';
import {ConfigProvider} from '@context/global/ConfigContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {WindowDimensionsProvider} from '@components/withWindowDimensions';
import {KeyboardStateProvider} from '@components/withKeyboardState';
import ThemeProvider from './components/ThemeProvider';
import ThemeStylesProvider from './components/ThemeStylesProvider';
import OnyxUpdateManager from './libs/actions/OnyxUpdateManager';
import SafeArea from '@components/SafeArea';
import {LogBox} from 'react-native';

type KirokuProps = {
  /** true if there is an authToken */
  url?: Route;
};

LogBox.ignoreLogs([
  // Basically it means that if the app goes in the background and back to foreground on Android,
  // the timer is lost. Currently we are using a 30 minutes interval to refresh personal details.
  // More details here: https://git.io/JJYeb
  'Setting a timer for a long period of time',
]);

const App = ({url}: KirokuProps) => {
  // OnyxUpdateManager(); // Untested
  return (
    <InitialUrlContext.Provider value={url}>
      <ComposeProviders
        components={[
          // OnyxProvider, // Untested
          ThemeProvider,
          ThemeStylesProvider,
          FirebaseProvider,
          UserConnectionProvider,
          ConfigProvider,
          SafeAreaProvider,
          SafeArea,
          WindowDimensionsProvider,
          KeyboardStateProvider,
          CustomStatusBarAndBackgroundContextProvider,
        ]}>
        {/* <CustomStatusBarAndBackground /> */}
        {/* <ErrorBoundary errorMessage="Kiroku crash caught by error boundary">
          <ColorSchemeWrapper> */}
        <Kiroku />
        {/* </ColorSchemeWrapper>
        </ErrorBoundary> */}
      </ComposeProviders>
    </InitialUrlContext.Provider>
  );
};

//Untested color scheme wrapper

App.displayName = 'App';

export default App;
