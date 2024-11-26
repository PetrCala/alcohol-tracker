import {Alert, StyleSheet, View} from 'react-native';
import SearchWindow from '@components/Social/SearchWindow';
import type {
  SearchWindowRef,
  UserIDToNicknameMapping,
} from '@src/types/various/Search';
import type GeneralAction from '@src/types/various/GeneralAction';
import React, {useMemo, useReducer, useRef} from 'react';
import {objKeys} from '@libs/DataHandling';
import {getNicknameMapping} from '@libs/SearchUtils';
import {searchArrayByText} from '@libs/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {UserArray} from '@src/types/onyx/OnyxCommon';
import UserListComponent from '@components/Social/UserListComponent';
import useProfileList from '@hooks/useProfileList';
import NoFriendInfo from '@components/Social/NoFriendInfo';

type State = {
  searching: boolean;
  friends: UserArray;
  friendsToDisplay: UserArray;
};

const initialState: State = {
  searching: false,
  friends: [],
  friendsToDisplay: [],
};

const reducer = (state: State, action: GeneralAction): State => {
  switch (action.type) {
    case 'SET_SEARCHING':
      return {...state, searching: action.payload};
    case 'SET_FRIENDS':
      return {...state, friends: action.payload};
    case 'SET_FRIENDS_TO_DISPLAY':
      return {...state, friendsToDisplay: action.payload};
    default:
      return state;
  }
};

type FriendListScreenProps = object; // TODO: Add props

function FriendListScreen({}: FriendListScreenProps) {
  const {userData} = useDatabaseData();
  const friendListInputRef = useRef<SearchWindowRef>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {profileList} = useProfileList(state.friends);

  const localSearch = (searchText: string) => {
    try {
      dispatch({type: 'SET_SEARCHING', payload: true});
      const searchMapping: UserIDToNicknameMapping = getNicknameMapping(
        profileList,
        'display_name',
      );
      const relevantResults = searchArrayByText(
        state.friends,
        searchText,
        searchMapping,
      );
      dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: relevantResults}); // Hide irrelevant
    } catch (error: any) {
      Alert.alert(
        'Database serach failed',
        'Could not search the database: ' + error.message,
      );
      return;
    } finally {
      dispatch({type: 'SET_SEARCHING', payload: false});
    }
  };

  const resetSearch = () => {
    dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: state.friends});
  };

  useMemo(() => {
    const friendsArray = objKeys(userData?.friends);
    dispatch({type: 'SET_FRIENDS', payload: friendsArray});
    dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: friendsArray});
  }, [userData]);

  return (
    <View style={styles.mainContainer}>
      <SearchWindow
        ref={friendListInputRef}
        windowText="Search your friend list"
        onSearch={localSearch}
        onResetSearch={resetSearch}
        searchOnTextChange={true}
      />
      <UserListComponent
        fullUserArray={state.friends}
        initialLoadSize={20}
        emptyListComponent={<NoFriendInfo />}
        userSubset={state.friendsToDisplay}
        orderUsers={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default FriendListScreen;
