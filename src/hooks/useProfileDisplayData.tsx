import {useEffect, useReducer, useCallback} from 'react';
import {useFirebase} from '@src/context/global/FirebaseContext';
import {
  FriendsData,
  NicknameToIdData,
  ProfileDisplayData,
  UserStatusDisplayData,
} from '@src/types/database';
import {objKeys} from '@src/utils/dataHandling';
import {fetchUserProfiles, fetchUserStatuses} from '@database/profile';
import {Alert} from 'react-native';

interface State {
  loadingDisplayData: boolean;
  profileDisplayData: ProfileDisplayData;
  userStatusDisplayData: UserStatusDisplayData;
}

type Action =
  | {type: 'SET_LOADING_DISPLAY_DATA'; payload: boolean}
  | {type: 'SET_PROFILE_DISPLAY_DATA'; payload: ProfileDisplayData}
  | {type: 'SET_USER_STATUS_DISPLAY_DATA'; payload: UserStatusDisplayData};

const initialState: State = {
  loadingDisplayData: false,
  profileDisplayData: {},
  userStatusDisplayData: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PROFILE_DISPLAY_DATA':
      return {...state, profileDisplayData: action.payload};
    case 'SET_LOADING_DISPLAY_DATA':
      return {...state, loadingDisplayData: action.payload};
    case 'SET_USER_STATUS_DISPLAY_DATA':
      return {...state, userStatusDisplayData: action.payload};
    default:
      return state;
  }
}

/**
 * Custom hook for fetching and managing profile display data based on a list of friends.
 *
 * This hook encapsulates the logic for loading profile data from a Firebase database,
 * managing loading states, and updating the component state with the fetched data.
 * It uses the `useFirebase` hook to access the Firebase database and a reducer for state management.
 *
 * @param friends - An object or undefined, where the object keys represent the unique
 *  user IDs of the friends.
 * @returns An object containing the following properties:
 *   - loadingDisplayData: boolean - Represents if the hook is currently loading data.
 *   - displayData: ProfileDisplayData - An object holding the fetched profile data,
 *     structured according to the ProfileDisplayData interface.
 *
 * Usage:
 * const { loadingDisplayData, displayData } = useProfileDisplayData(friends);
 */
const useProfileDisplayData = (
  friends: FriendsData | NicknameToIdData | undefined,
) => {
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateDisplayData = useCallback(async (): Promise<void> => {
    dispatch({type: 'SET_LOADING_DISPLAY_DATA', payload: true});
    try {
      let newProfileDisplayData: ProfileDisplayData = await fetchUserProfiles(
        db,
        objKeys(friends),
      );
      let newUserStatusDisplayData: UserStatusDisplayData =
        await fetchUserStatuses(db, objKeys(friends));
      dispatch({
        type: 'SET_PROFILE_DISPLAY_DATA',
        payload: newProfileDisplayData,
      });
      dispatch({
        type: 'SET_USER_STATUS_DISPLAY_DATA',
        payload: newUserStatusDisplayData,
      });
    } catch (error: any) {
      Alert.alert(
        'Database fetch failed',
        'Could not fetch user display data: ' + error.message,
      );
    } finally {
      dispatch({type: 'SET_LOADING_DISPLAY_DATA', payload: false});
    }
  }, [friends]);

  useEffect(() => {
    updateDisplayData();
  }, [updateDisplayData]);

  return state;
};

export default useProfileDisplayData;
