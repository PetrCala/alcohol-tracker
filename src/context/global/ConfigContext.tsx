// ConfigContext.tsx
import type {ReactNode} from 'react';
import React, {createContext, useContext, useMemo} from 'react';
import type {Config} from '@src/types/onyx';
import type {FetchDataKeys} from '@hooks/useFetchData/types';
import useListenToData from '@hooks/useListenToData';

type ConfigContextType = {
  config?: Config;
};

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined,
);

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

type ConfigProviderProps = {
  children: ReactNode;
};

export const ConfigProvider: React.FC<ConfigProviderProps> = ({children}) => {
  const dataTypes: FetchDataKeys = ['config'];

  const {data} = useListenToData(dataTypes);

  const value = useMemo(
    () => ({
      config: data.config,
    }),
    [data],
  );
  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};
