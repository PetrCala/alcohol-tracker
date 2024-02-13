import {useEffect, useReducer, useCallback} from 'react';
import {useFirebase} from '@src/context/global/FirebaseContext';
import {
  FriendList,
  NicknameToIdList,
  ProfileList,
  UserStatusList,
} from '@src/types/database';
import {objKeys} from '@libs/DataHandling';
import {fetchUserProfiles, fetchUserStatuses} from '@database/profile';
import {Alert} from 'react-native';

interface State {
  loadingDisplayData: boolean;
  profileList: ProfileList;
  userStatusList: UserStatusList;
}

type Action =
  | {type: 'SET_LOADING_DISPLAY_DATA'; payload: boolean}
  | {type: 'SET_PROFILE_LIST'; payload: ProfileList}
  | {type: 'SET_USER_STATUS_LIST'; payload: UserStatusList};

const initialState: State = {
  loadingDisplayData: false,
  profileList: {},
  userStatusList: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PROFILE_LIST':
      return {...state, profileList: action.payload};
    case 'SET_LOADING_DISPLAY_DATA':
      return {...state, loadingDisplayData: action.payload};
    case 'SET_USER_STATUS_LIST':
      return {...state, userStatusList: action.payload};
    default:
      return state;
  }
}

/**
 * Custom hook for fetching and managing list of profiles based on a list of friends.
 *
 * This hook encapsulates the logic for loading profile data from a Firebase database,
 * managing loading states, and updating the component state with the fetched data.
 * It uses the `useFirebase` hook to access the Firebase database and a reducer for state management.
 *
 * @param friends - An object or undefined, where the object keys represent the unique
 *  user IDs of the friends.
 * @returns An object containing the following properties:
 *   - loadingDisplayData: boolean - Represents if the hook is currently loading data.
 *   - displayData: ProfileList - An object holding the fetched profile data,
 *     structured according to the ProfileList interface.
 *
 * Usage:
 * const { loadingDisplayData, displayData } = useProfileList(friends);
 */
const useProfileList = (friends: FriendList | NicknameToIdList | undefined) => {
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateDisplayData = useCallback(async (): Promise<void> => {
    dispatch({type: 'SET_LOADING_DISPLAY_DATA', payload: true});
    try {
      let newProfileList: ProfileList = await fetchUserProfiles(
        db,
        objKeys(friends),
      );
      let newUserStatusList: UserStatusList = await fetchUserStatuses(
        db,
        objKeys(friends),
      );
      dispatch({
        type: 'SET_PROFILE_LIST',
        payload: newProfileList,
      });
      dispatch({
        type: 'SET_USER_STATUS_LIST',
        payload: newUserStatusList,
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

export default useProfileList;
