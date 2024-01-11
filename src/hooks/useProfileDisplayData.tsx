import {useState, useEffect} from 'react';
import {Alert} from 'react-native';

import {ProfileData, ProfileDisplayData} from '../types/database';
import {isNonEmptyObject} from '../utils/validation';
import {Database} from 'firebase/database';
import {fetchUserProfiles} from '../database/profile';

type Options = {
  data: {[id: string]: any};
  db: Database | null;
  setLoadingDisplayData: (value: boolean) => void;
};

/**
 * useProfileDisplayData - A React hook to fetch and manage user profile data for display.
 *
 * This hook abstracts the logic of fetching user profile data from a Firebase database
 * and provides an interface to manage the fetched data's state. It also manages loading
 * state for any associated UI components.
 *
 * @param data - A mapping from user IDs or request IDs to their associated data.
 * @param db - The Firebase database instance used to fetch user profiles.
 * @param setLoadingDisplayData - An optional function to update the UI's loading state.
 *
 * @returns A tuple where the first element is
 * the fetched profile display data, and the second element is a setter function for that data.
 *
 * @example
 * const [displayData, setDisplayData] = useProfileDisplayData({
 *   data: friendRequests,
 *   db: firebase.database(),
 *   setLoadingDisplayData: setLoading
 * });
 *
 * @throws Will throw an error if fetching user profile data from the database fails.
 */
const useProfileDisplayData = ({
  data,
  db,
  setLoadingDisplayData,
}: Options): [ProfileDisplayData, (profileData: ProfileDisplayData) => void] => {
  const [displayData, setDisplayData] = useState<ProfileDisplayData>({});

  useEffect(() => {
    const fetchDisplayData = async () => {
      if (!db || !isNonEmptyObject(data)) {
        setDisplayData({});
        return;
      }

      const newDisplayData: ProfileDisplayData = {};
      setLoadingDisplayData && setLoadingDisplayData(true);

      try {
        const dataIds = Object.keys(data);
        const userProfiles: ProfileData[] = await fetchUserProfiles(
          db,
          dataIds,
        );
        dataIds.forEach((id, index) => {
          newDisplayData[id] = userProfiles[index];
        });
      } catch (error: any) {
        Alert.alert(
          'Database connection failed',
          'Could not fetch the profile data: ' + error.message,
        );
      } finally {
        setDisplayData(newDisplayData);
        setLoadingDisplayData && setLoadingDisplayData(false);
      }
    };

    fetchDisplayData();
  }, []);

  return [displayData, setDisplayData];
};

export default useProfileDisplayData;
