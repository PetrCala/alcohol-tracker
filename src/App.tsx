import React from 'react';
import type {Route} from './ROUTES';
import InitialUrlContext from '@libs/InitialUrlContext';
import Kiroku from './Kiroku';
import ComposeProviders from '@components/ComposeProviders';
import {FirebaseProvider} from '@context/global/FirebaseContext';
import {UserConnectionProvider} from '@context/global/UserConnectionContext';
import {ConfigProvider} from '@context/global/ConfigContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// import {WindowDimensionsProvider} from '@components/withWindowDimensions';
import {KeyboardStateProvider} from '@components/withKeyboardState';
import SafeArea from '@components/SafeArea';

type KirokuProps = {
  /** true if there is an authToken */
  url?: Route;
};

const App = ({url}: KirokuProps) => {
  return (
    <InitialUrlContext.Provider value={url}>
      <ComposeProviders
        components={[
          FirebaseProvider,
          UserConnectionProvider,
          ConfigProvider,
          SafeAreaProvider,
          SafeArea,
          KeyboardStateProvider,
        ]}>
        <Kiroku />
      </ComposeProviders>
    </InitialUrlContext.Provider>
  );
};

App.displayName = 'App';

export default App;
