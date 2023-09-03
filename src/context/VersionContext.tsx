import semver from 'semver';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import ForceUpdateScreen from '../screens/ForceUpdateScreen';
import { useUserConnection } from './UserConnectionContext';
import UserOffline from '../components/UserOffline';
import DatabaseContext from './DatabaseContext';
import { readDataOnce } from '../database/baseFunctions';
import { version } from '../../package.json';

type VersionManagementProviderProps = {
    children: ReactNode;
};

export const VersionManagementProvider: React.FC<VersionManagementProviderProps> = ({ children }) => {
    const { isOnline } = useUserConnection();
    const db = useContext(DatabaseContext);
    const [versionInfoUnavailable, setVersionInfoUnavailable] = useState<boolean>(false);
    const [versionValid, setVersionValid] = useState<boolean>(false);
  
    useEffect(() => {

      const checkAppVersion = async () => {
        try{
          // Atttempt to fetch local cached version to allow offline handling
          let minSupportedVersion: string | null = null;
          if (!isOnline){
            // User offline
            try {
              minSupportedVersion = await getCachedMinVersion();
              if (!minSupportedVersion){
                // User not online, local cache empty, return offline screen
                setVersionInfoUnavailable(true);
                return null;
              };
            } catch (error:any){
              throw new Error("Failed to get local cache");
            };
          } else {
            // User online
            try {
              minSupportedVersion = await fetchAndCacheMinVersion(db);
              if (!minSupportedVersion) return null;
            } catch (error:any) {
              Alert.alert("Database connection failed", "Could not fetch version info from the database: "+ error.message);
              return null;
            };
          };
          let versionValid = validateAppVersion(minSupportedVersion);
          setVersionValid(versionValid);
          setVersionInfoUnavailable(false);
        } catch (error:any){
          Alert.alert("App version check failed", "Could not retrieve the version app information from the database: " + error.message);
          return null;
        };
      };
  
      checkAppVersion();
    }, [isOnline]);

    // Version info unreachable
    if (versionInfoUnavailable){
      return <UserOffline/>;
    }

    // Invalid version
    if (!versionValid){
      return <ForceUpdateScreen/>;
    }
  
    return (
      <>
        {children}
      </>
    );
  };


// Function to get cached minimum supported version
const getCachedMinVersion = async () => {
    return await AsyncStorage.getItem('min_supported_version');
};

export const validateAppVersion = (minSupportedVersion: string):boolean => {
    const currentAppVersion = version;
    // Compare versions
    if (semver.lt(currentAppVersion, minSupportedVersion)) {
      return false;
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
