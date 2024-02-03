import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  NicknameToIdData,
  FriendRequestStatusState,
  FriendsData,
  FriendRequestDisplayData,
  ProfileDisplayData,
  ProfileData,
} from '../../types/database';
import {useMemo, useReducer} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import {auth} from '../../services/firebaseSetup';
import {isNonEmptyObject} from '../../utils/validation';
import LoadingData from '../../components/LoadingData';
import {Database} from 'firebase/database';
import {searchDbByNickname} from '../../database/search';
import {fetchUserProfiles} from '@database/profile';
import {QUIRKY_NICKNAMES} from '../../utils/QuirkyNicknames';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import {FriendsFriendsScreenProps} from '@src/types/screens';
import Header from '@components/Header/Header';

interface State {
  searchResultData: NicknameToIdData;
  searching: boolean;
  requestStatuses: {[userId: string]: FriendRequestStatusState | undefined};
  noUsersFound: boolean;
  displayData: ProfileDisplayData;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  searchResultData: {},
  searching: false,
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

const FriendsFriendsScreen = ({
  route,
  navigation,
}: FriendsFriendsScreenProps) => {
  if (!route || !navigation) return null;
  const {userId, friends} = route.params;
  const {db, storage} = useFirebase();
  const user = auth.currentUser;
  const [state, dispatch] = useReducer(reducer, initialState);

  const doSearch = async (db: Database, searchText: string): Promise<void> => {
    if (!db || !searchText) {
      // Add an 'input a value first' alert later
      dispatch({type: 'SET_SEARCH_RESULT_DATA', payload: {}});
      await updateHooksBasedOnSearchResults({});
      return;
    }

    let searchResultData: NicknameToIdData = {};
    dispatch({type: 'SET_SEARCHING', payload: true});
    try {
      const newResults = await searchDbByNickname(db, searchText); // Nickname is cleaned in the function
      if (newResults) {
        searchResultData = newResults;
      }
      if (QUIRKY_NICKNAMES[searchText]) {
        searchResultData[QUIRKY_NICKNAMES[searchText]] = searchText;
      }
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
    searchResultData: NicknameToIdData,
  ): Promise<void> => {
    const newDisplayData: ProfileDisplayData = {};
    if (db || isNonEmptyObject(searchResultData)) {
      const dataIds = Object.keys(searchResultData);
      const userProfiles: ProfileData[] = await fetchUserProfiles(db, dataIds);
      dataIds.forEach((id, index) => {
        newDisplayData[id] = userProfiles[index];
      });
    }
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
  };

  //   /** Having a list of users returned by the search,
  //    * determine the request status for each and update
  //    * the RequestStatuses hook.
  //    */
  //   const updateRequestStatuses = (
  //     searchResultData: NicknameToIdData = state.searchResultData,
  //   ): void => {
  //     let newRequestStatuses: {
  //       [userId: string]: FriendRequestStatusState;
  //     } = {};
  //     if (isNonEmptyObject(searchResultData)) {
  //       Object.keys(searchResultData).forEach(userId => {
  //         if (friendRequests && friendRequests[userId]) {
  //           newRequestStatuses[userId] = friendRequests[userId];
  //         }
  //       });
  //     }
  //     dispatch({type: 'SET_REQUEST_STATUSES', payload: newRequestStatuses});
  //   };

  const updateHooksBasedOnSearchResults = async (
    searchResults: NicknameToIdData,
  ): Promise<void> => {
    // updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const noUsersFound = !isNonEmptyObject(searchResults);
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

  //   useMemo(() => {
  //     updateRequestStatuses();
  //   }, [friendRequests]); // When updated in the database, not locally

  if (!db || !user || !storage) return;

  return (
    <View style={styles.mainContainer}>
      <Header
        headerText="Find Friends of Friends"
        onGoBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled">
        <SearchWindow doSearch={doSearch} onResetSearch={resetSearch} />
        <View style={styles.searchResultsContainer}>
          {state.searching ? (
            <LoadingData style={styles.loadingData} />
          ) : isNonEmptyObject(state.searchResultData) ? (
            Object.keys(state.searchResultData).map(userId => (
              <SearchResult
                key={userId + '-container'}
                userId={userId}
                displayData={state.displayData}
                db={db}
                storage={storage}
                userFrom={user.uid}
                requestStatus={state.requestStatuses[userId]}
                alreadyAFriend={friends ? friends[userId] : false}
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
  );
};

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

export default FriendsFriendsScreen;
