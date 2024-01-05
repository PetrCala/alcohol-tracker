import AsyncStorage from '@react-native-async-storage/async-storage';
import {ReactNode, useEffect, useReducer} from 'react';
import {Alert} from 'react-native';

import ForceUpdateScreen from '../screens/ForceUpdateScreen';
import {useUserConnection} from './UserConnectionContext';
import UserOffline from '../components/UserOffline';
import {readDataOnce} from '../database/baseFunctions';
import LoadingData from '../components/LoadingData';
import {useFirebase} from './FirebaseContext';
import {Database} from 'firebase/database';
import {validateAppVersion} from '../utils/validation';

const initialState = {
  isLoading: true,
  versionValid: false,
  versionInfoUnavailable: false,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_VERSION_VALID':
      return {...state, versionValid: action.payload};
    case 'SET_VERSION_INFO_UNAVAILABLE':
      return {...state, versionInfoUnavailable: action.payload};
    default:
      return state;
  }
};

type VersionManagementProviderProps = {
  children: ReactNode;
};

export const VersionManagementProvider: React.FC<
  VersionManagementProviderProps
> = ({children}) => {
  const {isOnline} = useUserConnection();
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  async function checkAppVersion() {
    if (!isOnline) return; // Don't check version if offline
    dispatch({type: 'SET_LOADING', payload: true});

    try {
      let minSupportedVersion = null;
      minSupportedVersion = await getCachedMinVersion();
      if (!minSupportedVersion) {
        minSupportedVersion = await fetchAndCacheMinVersion(db);
      }

      if (!minSupportedVersion) {
        dispatch({type: 'SET_VERSION_INFO_UNAVAILABLE', payload: true});
        return;
      }

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
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  }

  useEffect(() => {
    checkAppVersion();
  }, [isOnline]);

  if (!isOnline) return <UserOffline />;
  if (state.isLoading) return <LoadingData />;
  if (state.versionInfoUnavailable) return <UserOffline />;
  if (!state.versionValid) return <ForceUpdateScreen />;

  return <>{children}</>;
};

// Function to get cached minimum supported version
const getCachedMinVersion = async () => {
  return await AsyncStorage.getItem('min_supported_version');
};

// Function to fetch and cache minimum supported version
const fetchAndCacheMinVersion = async (db: Database) => {
  // Fetch minSupportedVersion from Firebase Realtime Database
  var minSupportedVersion: string | null = null;
  try {
    minSupportedVersion = await readDataOnce(
      db,
      'config/app_settings/min_supported_version',
    );
  } catch (error: any) {
    Alert.alert(
      'Database connection failed',
      'Could not fetch version info from the database: ' + error.message,
    );
    return null;
  }
  // Cache the supported version locally
  if (minSupportedVersion) {
    try {
      await AsyncStorage.setItem('min_supported_version', minSupportedVersion);
    } catch (error: any) {
      Alert.alert(
        'Storage caching failed',
        'Could not cache the current version: ' + error.message,
      );
    }
  }
  return minSupportedVersion;
};
