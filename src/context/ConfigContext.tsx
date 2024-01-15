import {ReactNode, useEffect, useReducer} from 'react';
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

const initialState = {
  versionValid: false,
  versionInfoUnavailable: false,
  config: null,
  underMaintenance: false,
  isLoading: true,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_VERSION_VALID':
      return {...state, versionValid: action.payload};
    case 'SET_VERSION_INFO_UNAVAILABLE':
      return {...state, versionInfoUnavailable: action.payload};
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

  // Monitor config
  useEffect(() => {
    if (!db) return;

    let isMounted = true;
    dispatch({type: 'SET_LOADING', payload: true}); // Set loading true initially

    const configRef = `config`;

    const processConfigData = async (configData: ConfigProps) => {
      if (!isMounted) return;

      if (!isEqual(configData, state.config)) {
        dispatch({type: 'SET_CONFIG', payload: configData});
      }
    };

    const stopListening = listenForDataChanges(
      db,
      configRef,
      async (data: ConfigProps) => {
        await processConfigData(data);
        if (isMounted) {
          dispatch({type: 'SET_LOADING', payload: false}); // Set loading false after processing
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
          dispatch({type: 'SET_LOADING', payload: false});
        }
      });

    return () => {
      isMounted = false;
      stopListening(); // Stop listening to data changes when the component unmounts
    };
  }, []);

  // Monitor under maintenance <- somehow ensures up-to-date data
  useEffect(() => {
    let underMaintenance: boolean =
      state.config?.maintenance.maintenance_mode ?? false;
    dispatch({type: 'SET_UNDER_MAINTENANCE', payload: underMaintenance});
  }, [state.config]);

  useEffect(() => {
    function checkAppVersion(config: ConfigProps | null = state.config) {
      try {
        let minSupportedVersion = config?.app_settings.min_supported_version;
        if (!minSupportedVersion) return;
        const versionValidationResult = validateAppVersion(minSupportedVersion);
        dispatch({
          type: 'SET_VERSION_VALID',
          payload: versionValidationResult.success,
        });
      } catch (error: any) {
        Alert.alert(
          'App version check failed',
          'Could not retrieve the version app information from the database: ' +
            error.message,
        );
      }
    }

    checkAppVersion(state.config);
  }, [state.config]);

  // Monitor user preferences
  if (!isOnline) return <UserOffline />;
  if (state.underMaintenance) return <UserOffline />;
  if (state.isLoading) return <LoadingData />;
  if (state.versionInfoUnavailable) return <UserOffline />;
  if (!state.versionValid) return <ForceUpdateScreen />;

  return <>{children}</>;
};
