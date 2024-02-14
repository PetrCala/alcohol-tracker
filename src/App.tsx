import React from 'react';
import {app} from './services/firebaseSetup';

import {ContextProvider} from './context/global/Context';
import type {Route} from './ROUTES';
import InitialUrlContext from '@libs/InitialUrlContext';
import Kiroku from './Kiroku';

type KirokuProps = {
  /** true if there is an authToken */
  url?: Route;
};

const App = ({url}: KirokuProps) => {
  return (
    <InitialUrlContext.Provider value={url}>
      <ContextProvider app={app}>
        <Kiroku />
      </ContextProvider>
    </InitialUrlContext.Provider>
  );
};

App.displayName = 'App';

export default App;
