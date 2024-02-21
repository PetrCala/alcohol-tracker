import {ReactNode} from 'react';
import {FirebaseProvider} from './FirebaseContext';
import {UserConnectionProvider} from './UserConnectionContext';
import {ConfigProvider} from './ConfigContext';

type ContextProviderProps = {
  children: ReactNode;
};

export const ContextProvider: React.FC<ContextProviderProps> = ({children}) => (
  <FirebaseProvider>
    <UserConnectionProvider>
      <ConfigProvider>{children}</ConfigProvider>
    </UserConnectionProvider>
  </FirebaseProvider>
);
