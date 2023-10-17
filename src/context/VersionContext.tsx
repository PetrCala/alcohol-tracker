import semver from 'semver';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import { Alert } from 'react-native';

import ForceUpdateScreen from '../screens/ForceUpdateScreen';
import { useUserConnection } from './UserConnectionContext';
import UserOffline from '../components/UserOffline';
import { readDataOnce } from '../database/baseFunctions';
import { version } from '../../package.json';
import WelcomeScreen from '../components/WelcomeScreen';
import LoadingData from '../components/LoadingData';
import { useFirebase } from './FirebaseContext';


const initialState = {
  isLoading: true,
  versionValid: false,
  versionInfoUnavailable: false,
};

const reducer = (state:any, action:any) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_VERSION_VALID':
      return { ...state, versionValid: action.payload };
    case 'SET_VERSION_INFO_UNAVAILABLE':
      return { ...state, versionInfoUnavailable: action.payload };
    default:
      return state;
  }
};

type VersionManagementProviderProps = {
    children: ReactNode;
};

export const VersionManagementProvider: React.FC<VersionManagementProviderProps> = ({ children }) => {
  const { isOnline } = useUserConnection();
  const { db }= useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  async function checkAppVersion() {
    dispatch({ type: 'SET_LOADING', payload: true });
  
    try {
      let minSupportedVersion = null;
  
      if (!isOnline) {
        minSupportedVersion = await getCachedMinVersion();
  
        if (!minSupportedVersion) {
          dispatch({ type: 'SET_VERSION_INFO_UNAVAILABLE', payload: true });
          return;
        }
      } else {
        minSupportedVersion = await fetchAndCacheMinVersion(db);
  
        if (!minSupportedVersion) {
          dispatch({ type: 'SET_VERSION_INFO_UNAVAILABLE', payload: true });
          return;
        }
      }
  
      const versionValid = validateAppVersion(minSupportedVersion);
      dispatch({ type: 'SET_VERSION_VALID', payload: versionValid });
    } catch (error:any) {
      Alert.alert(
        "App version check failed",
        "Could not retrieve the version app information from the database: " + error.message
      );
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  useEffect(() => {
    checkAppVersion();
  }, [isOnline]);

  if (state.isLoading) return <LoadingData/>;
  if (state.versionInfoUnavailable) return <UserOffline />;
  if (!state.versionValid) return <ForceUpdateScreen />;

  return <>{children}</>;
};




// Function to get cached minimum supported version
const getCachedMinVersion = async () => {
    return await AsyncStorage.getItem('min_supported_version');
};

/** Input the minimum supported version of the application and validate that the current version is not older than that one. If it is newer, return true, otherwise return false.
 * 
 * @param minSupportedVersion Version to validate against.
 * @param currentAppVersion Current version of the application. Defaults to the version stored in 'package.json'. Overwrite this value only in testing.
 * @returns True if the current app version is valid, and false otherwise.
 */
export const validateAppVersion = (minSupportedVersion: string, currentAppVersion:string = version):boolean => {
  // Compare versions
  if (semver.lt(currentAppVersion, minSupportedVersion)) {
    return false; // Version is too old
  }
  return true;
};

// Function to fetch and cache minimum supported version
const fetchAndCacheMinVersion = async (db:any) => {
  // Fetch minSupportedVersion from Firebase Realtime Database
  var minSupportedVersion: string | null = null;
  const minVersionRef = '/config/app_settings/min_supported_version';
  try {
    minSupportedVersion = await readDataOnce(db, minVersionRef);
  } catch (error:any){
    Alert.alert("Database connection failed", "Could not fetch version info from the database: "+ error.message);
    return null;
  };
  // Cache the supported version locally
  if (minSupportedVersion){
    try {
      await AsyncStorage.setItem('min_supported_version', minSupportedVersion);
    } catch (error:any){
      Alert.alert("Storage caching failed", "Could not cache the current version: "+ error.message);
    };
  };
  return minSupportedVersion;
};
