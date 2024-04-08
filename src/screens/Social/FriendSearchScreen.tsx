import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  FriendRequestList,
  FriendRequestStatus,
  ProfileList,
  UserList,
} from '@src/types/onyx';
import React, {useEffect, useMemo, useReducer, useRef} from 'react';
import {useFirebase} from '@src/context/global/FirebaseContext';

import {isNonEmptyArray} from '@libs/Validation';
import LoadingData from '@components/LoadingData';
import type {Database} from 'firebase/database';
import {searchDatabaseForUsers} from '@libs/Search';
import {fetchUserProfiles} from '@database/profile';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import type {
  SearchWindowRef,
  UserSearchResults,
} from '@src/types/various/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import useRefresh from '@hooks/useRefresh';
import {useFocusEffect} from '@react-navigation/native';
import MainHeader from '@components/Header/MainHeader';
import Navigation from '@libs/Navigation/Navigation';
import DismissKeyboard from '@components/Keyboard/DismissKeyboard';
import ScreenWrapper from '@components/ScreenWrapper';

type State = {
  searchResultData: UserSearchResults;
  searching: boolean;
  friends: UserList | undefined;
  friendRequests: FriendRequestList | undefined;
  requestStatuses: Record<string, FriendRequestStatus | undefined>;
  noUsersFound: boolean;
  displayData: ProfileList;
};

type Action = {
  type: string;
  payload: any;
};

const initialState: State = {
  searchResultData: [],
  searching: false,
  friends: undefined,
  friendRequests: undefined,
  requestStatuses: {},
  noUsersFound: false,
  displayData: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SEARCH_RESULT_DATA':
      return {...state, searchResultData: action.payload};
    case 'SET_SEARCHING':
      return {...state, searching: action.payload};
    case 'SET_FRIENDS':
      return {...state, friends: action.payload};
    case 'SET_FRIEND_REQUESTS':
      return {...state, friendRequests: action.payload};
    case 'SET_REQUEST_STATUSES':
      return {...state, requestStatuses: action.payload};
    case 'SET_NO_USERS_FOUND':
      return {...state, noUsersFound: action.payload};
    case 'SET_DISPLAY_DATA':
      return {...state, displayData: action.payload};
    default:
      return state;
  }
};

function FriendSearchScreen() {
  const {auth, db, storage} = useFirebase();
  const {userData} = useDatabaseData();
  const searchInputRef = useRef<SearchWindowRef>(null);
  const user = auth.currentUser;
  const [state, dispatch] = useReducer(reducer, initialState);

  const dbSearch = async (searchText: string, db?: Database): Promise<void> => {
    try {
      dispatch({type: 'SET_SEARCHING', payload: true});
      const searchResultData: UserSearchResults = await searchDatabaseForUsers(
        db,
        searchText,
      );
      await updateHooksBasedOnSearchResults(searchResultData);
      dispatch({type: 'SET_SEARCH_RESULT_DATA', payload: searchResultData});
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

  const updateDisplayData = async (
    searchResultData: UserSearchResults,
  ): Promise<void> => {
    const newDisplayData: ProfileList = await fetchUserProfiles(
      db,
      searchResultData,
    );
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
  };

  /** Having a list of users returned by the search,
   * determine the request status for each and update
   * the RequestStatuses hook.
   */
  const updateRequestStatuses = (
    searchResultData: UserSearchResults = state.searchResultData,
  ): void => {
    const newRequestStatuses: Record<string, FriendRequestStatus> = {};
    searchResultData.forEach(userId => {
      if (state.friendRequests?.[userId]) {
        newRequestStatuses[userId] = state.friendRequests[userId];
      }
    });
    dispatch({type: 'SET_REQUEST_STATUSES', payload: newRequestStatuses});
  };

  const updateHooksBasedOnSearchResults = async (
    searchResults: UserSearchResults,
  ): Promise<void> => {
    updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const noUsersFound = !isNonEmptyArray(searchResults);
    dispatch({type: 'SET_NO_USERS_FOUND', payload: noUsersFound});
  };

  const resetSearch = (): void => {
    // Reset all values displayed on screen
    dispatch({type: 'SET_SEARCHING', payload: false});
    dispatch({type: 'SET_SEARCH_RESULT_DATA', payload: {}});
    dispatch({type: 'SET_REQUEST_STATUSES', payload: {}});
    dispatch({type: 'SET_DISPLAY_DATA', payload: {}});
    dispatch({type: 'SET_NO_USERS_FOUND', payload: false});
  };

  useMemo(() => {
    if (userData) {
      dispatch({type: 'SET_FRIENDS', payload: userData?.friends});
      dispatch({
        type: 'SET_FRIEND_REQUESTS',
        payload: userData?.friend_requests,
      });
    }
  }, [userData]);

  useMemo(() => {
    updateRequestStatuses();
  }, [state.friendRequests]); // When updated in the database, not locally

  if (!user) {
    return;
  }

  return (
    <ScreenWrapper testID={FriendSearchScreen.displayName}>
      <View style={styles.mainContainer}>
        <MainHeader
          headerText="Search For New Friends"
          onGoBack={() => Navigation.goBack()}
        />
        <SearchWindow
          ref={searchInputRef}
          windowText="Search for new friends"
          onSearch={dbSearch}
          onResetSearch={resetSearch}
        />
        <ScrollView
          style={styles.scrollViewContainer}
          onScrollBeginDrag={Keyboard.dismiss}
          keyboardShouldPersistTaps="handled">
          <View style={styles.searchResultsContainer}>
            {state.searching ? (
              <LoadingData style={styles.loadingData} />
            ) : isNonEmptyArray(state.searchResultData) ? (
              state.searchResultData.map(userId => (
                <SearchResult
                  key={userId + '-container'}
                  userId={userId}
                  userDisplayData={state.displayData[userId]}
                  db={db}
                  storage={storage}
                  userFrom={user.uid}
                  requestStatus={state.requestStatuses[userId]}
                  alreadyAFriend={state.friends ? state.friends[userId] : false}
                />
              ))
            ) : state.noUsersFound ? (
              <Text style={styles.noUsersFoundText}>
                There are no users with this nickname.
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  textContainer: {
    width: '95%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'center',
  },
  searchText: {
    height: '100%',
    width: '90%',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  searchTextResetContainer: {
    width: '10%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTextResetImage: {
    width: 15,
    height: 15,
    tintColor: 'gray',
  },
  searchButtonContainer: {
    width: '95%',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 5,
  },
  searchResultsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  searchButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingData: {
    width: '100%',
    height: 50,
    margin: 5,
  },
  noUsersFoundText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
});

FriendSearchScreen.displayName = 'Friend Search Screen';
export default FriendSearchScreen;
