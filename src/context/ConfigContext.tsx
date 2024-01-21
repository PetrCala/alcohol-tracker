import {ReactNode, useEffect, useMemo, useReducer} from 'react';
import {Alert} from 'react-native';

import ForceUpdateScreen from '../screens/ForceUpdateScreen';
import {useUserConnection} from './UserConnectionContext';
import UserOffline from '../components/UserOffline';
import {listenForDataChanges, readDataOnce} from '../database/baseFunctions';
import LoadingData from '../components/LoadingData';
import {useFirebase} from './FirebaseContext';
import {validateAppVersion} from '../utils/validation';
import {ConfigProps} from '@src/types/database';
import {isEqual} from 'lodash';
import UnderMaintenance from '@components/UnderMaintenance';

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

  const updateLocalHooks = (newConfigData: ConfigProps) => {
    let underMaintenance: boolean =
      newConfigData.maintenance.maintenance_mode ?? false;
    let minSupportedVersion = newConfigData.app_settings.min_supported_version;
    const versionValidationResult = validateAppVersion(minSupportedVersion);

    dispatch({type: 'SET_UNDER_MAINTENANCE', payload: underMaintenance});
    dispatch({
      type: 'SET_VERSION_VALID',
      payload: versionValidationResult.success,
    });
  };

  // Monitor config
  useEffect(() => {
    if (!db) return;

    let isMounted = true;
    dispatch({type: 'SET_IS_LOADING', payload: true}); // Set loading true initially

    const configRef = `config`;

    const processConfigData = async (configData: ConfigProps) => {
      if (!isMounted) return;

      if (!isEqual(configData, state.config)) {
        dispatch({type: 'SET_CONFIG', payload: configData});
        updateLocalHooks(configData);
      }
    };

    const stopListening = listenForDataChanges(
      db,
      configRef,
      async (data: ConfigProps) => {
        await processConfigData(data);
        if (isMounted) {
          dispatch({type: 'SET_IS_LOADING', payload: false}); // Set loading false after processing
        }
      },
    );

    // Initial fetch and process
    readDataOnce(db, configRef)
      .then(processConfigData)
      .catch(error => {
        Alert.alert(
          'Error fetching data',
          'Could not fetch config data: ' + error.message,
        );
        // Handle initial load error
        if (isMounted) {
          dispatch({type: 'SET_IS_LOADING', payload: false});
        }
      });

    return () => {
      isMounted = false;
      stopListening(); // Stop listening to data changes when the component unmounts
    };
  }, []);

  useMemo(() => {
    updateLocalHooks(state.config); // Explicit for live propagation
  }, [state.config]);

  // Monitor user preferences
  if (!isOnline) return <UserOffline />;
  if (state.underMaintenance) return <UnderMaintenance config={state.config} />;
  if (state.isLoading) return <LoadingData />;
  if (!state.versionValid) return <ForceUpdateScreen />;

  return <>{children}</>;
};
