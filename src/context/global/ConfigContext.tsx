import {ReactNode, useEffect, useReducer} from 'react';

import ForceUpdateScreen from '../../screens/ForceUpdateScreen';
import {useUserConnection} from './UserConnectionContext';
import UserOffline from '../../components/UserOffline';
import {listenForDataChanges} from '../../database/baseFunctions';
import LoadingData from '../../components/LoadingData';
import {useFirebase} from './FirebaseContext';
import {validateAppVersion} from '../../utils/validation';
import {Config} from '@src/types/database';
import UnderMaintenance from '@components/UnderMaintenance';
import DBPATHS from '@database/DBPATHS';

const initialState = {
  isLoading: true,
  versionValid: false,
  config: null,
  underMaintenance: false,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_IS_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_VERSION_VALID':
      return {...state, versionValid: action.payload};
    case 'SET_CONFIG':
      return {...state, config: action.payload};
    case 'SET_UNDER_MAINTENANCE':
      return {...state, underMaintenance: action.payload};
    default:
      return state;
  }
};

type ConfigProviderProps = {
  children: ReactNode;
};

export const ConfigProvider: React.FC<ConfigProviderProps> = ({children}) => {
  const {isOnline} = useUserConnection();
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateLocalHooks = (newConfigData: Config | null) => {
    let underMaintenance: boolean =
      newConfigData?.maintenance.maintenance_mode ?? false;
    let minSupportedVersion = newConfigData?.app_settings.min_supported_version;
    const versionValidationResult = validateAppVersion(minSupportedVersion);

    dispatch({type: 'SET_UNDER_MAINTENANCE', payload: underMaintenance});
    dispatch({
      type: 'SET_VERSION_VALID',
      payload: versionValidationResult.success,
    });
  };

  useEffect(() => {
    if (!db) return;
    const configPath = DBPATHS.CONFIG;
    let stopListening = listenForDataChanges(db, configPath, (data: Config) => {
      dispatch({type: 'SET_IS_LOADING', payload: true});
      dispatch({type: 'SET_CONFIG', payload: data});
      updateLocalHooks(data);
      dispatch({type: 'SET_IS_LOADING', payload: false});
    });

    return () => stopListening();
  }, []);

  // Monitor user preferences
  if (!isOnline) return <UserOffline />;
  if (state.isLoading) return <LoadingData />;
  if (state.underMaintenance) return <UnderMaintenance config={state.config} />;
  if (!state.versionValid) return <ForceUpdateScreen />;

  return <>{children}</>;
};
