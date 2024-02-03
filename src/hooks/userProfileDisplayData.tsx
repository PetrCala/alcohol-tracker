import {useEffect, useReducer, useCallback} from 'react';
import {useFirebase} from '@src/context/FirebaseContext';
import {
  FriendsData,
  NicknameToIdData,
  ProfileDisplayData,
} from '@src/types/database';
import {fetchProfileDisplayData} from '@database/profile';

interface State {
  loadingDisplayData: boolean;
  displayData: ProfileDisplayData;
}

type Action =
  | {type: 'SET_DISPLAY_DATA'; payload: ProfileDisplayData}
  | {type: 'SET_LOADING_DISPLAY_DATA'; payload: boolean};

const initialState: State = {
  loadingDisplayData: false,
  displayData: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DISPLAY_DATA':
      return {...state, displayData: action.payload};
    case 'SET_LOADING_DISPLAY_DATA':
      return {...state, loadingDisplayData: action.payload};
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
    let newDisplayData: ProfileDisplayData = {};
    if (db && friends) {
      newDisplayData = await fetchProfileDisplayData(db, Object.keys(friends));
    }
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
    dispatch({type: 'SET_LOADING_DISPLAY_DATA', payload: false});
  }, [friends]);

  useEffect(() => {
    updateDisplayData();
  }, [updateDisplayData]);

  return state;
};

export default useProfileDisplayData;
