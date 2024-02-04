import {ReactNode} from 'react';
import {FirebaseProvider} from './FirebaseContext';
import {UserConnectionProvider} from './UserConnectionContext';
import {ConfigProvider} from './ConfigContext';
import {FirebaseApp} from 'firebase/app';

type ContextProviderProps = {
  app: FirebaseApp;
  children: ReactNode;
};

export const ContextProvider: React.FC<ContextProviderProps> = ({
  app,
  children,
}) => (
  <FirebaseProvider app={app}>
    <UserConnectionProvider>
      <ConfigProvider>{children}</ConfigProvider>
    </UserConnectionProvider>
  </FirebaseProvider>
);
