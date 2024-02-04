import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  FriendRequestStatusState,
  ProfileDisplayData,
  ProfileData,
  FriendRequestData,
} from '../../types/database';
import {useEffect, useMemo, useReducer} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import {auth} from '../../services/firebaseSetup';
import {isNonEmptyArray, isNonEmptyObject} from '../../utils/validation';
import LoadingData from '../../components/LoadingData';
import {Database} from 'firebase/database';
import {searchDatabaseForUsers} from '../../database/search';
import {fetchUserProfiles} from '@database/profile';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import {FriendsFriendsScreenProps} from '@src/types/screens';
import MainHeader from '@components/Header/MainHeader';
import GrayHeader from '@components/Header/GrayHeader';
import {getCommonFriends} from '@src/utils/social/friendUtils';
import {UserSearchResults} from '@src/types/search';
import {objKeys} from '@src/utils/dataHandling';
import {getDatabaseData} from '@src/context/DatabaseDataContext';
import SeeProfileButton from '@components/Buttons/SeeProfileButton';
import {GeneralAction} from '@src/types/states';
import commonStyles from '@src/styles/commonStyles';

interface State {
  searching: boolean;
  displayedFriends: UserSearchResults;
  commonFriends: UserSearchResults;
  otherFriends: UserSearchResults;
  requestStatuses: {[userId: string]: FriendRequestStatusState | undefined};
  noUsersFound: boolean;
  displayData: ProfileDisplayData;
}

const initialState: State = {
  searching: false,
  displayedFriends: [],
  commonFriends: [],
  otherFriends: [],
  requestStatuses: {},
  noUsersFound: false,
  displayData: {},
};

const reducer = (state: State, action: GeneralAction): State => {
  switch (action.type) {
    case 'SET_SEARCHING':
      return {...state, searching: action.payload};
    case 'SET_DISPLAYED_FRIENDS':
      return {...state, displayedFriends: action.payload};
    case 'SET_COMMON_FRIENDS':
      return {...state, commonFriends: action.payload};
    case 'SET_OTHER_FRIENDS':
      return {...state, otherFriends: action.payload};
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
  const {userId, friends, currentUserFriends} = route.params;
  const {db, storage} = useFirebase();
  const {userData} = getDatabaseData();
  const user = auth.currentUser;
  const [state, dispatch] = useReducer(reducer, initialState);

  const doSearch = async (db: Database, searchText: string): Promise<void> => {
    try {
      dispatch({type: 'SET_SEARCHING', payload: true});
      let searchResultData: UserSearchResults = await searchDatabaseForUsers(
        db,
        searchText,
      );
      let relevantResults = searchResultData.filter(userId =>
        objKeys(friends).includes(userId),
      );
      dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: relevantResults}); // Hide irrelevant
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
    const newDisplayData: ProfileDisplayData = {};
    const userProfiles: ProfileData[] = await fetchUserProfiles(
      db,
      searchResultData,
    );
    searchResultData.forEach((id, index) => {
      newDisplayData[id] = userProfiles[index];
    });
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
  };

  useMemo(() => {
    const updateRequestStatuses = (
      friendRequests: FriendRequestData | undefined,
    ): void => {
      let newRequestStatuses: {
        [userId: string]: FriendRequestStatusState;
      } = {};
      if (friendRequests) {
        Object.keys(friendRequests).forEach(userId => {
          newRequestStatuses[userId] = friendRequests[userId];
        });
      }
      dispatch({type: 'SET_REQUEST_STATUSES', payload: newRequestStatuses});
    };
    updateRequestStatuses(userData?.friend_requests);
  }, [userData?.friend_requests, friends]);

  const updateHooksBasedOnSearchResults = async (
    searchResults: UserSearchResults,
  ): Promise<void> => {
    // updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const noUsersFound = !isNonEmptyArray(searchResults);
    dispatch({type: 'SET_NO_USERS_FOUND', payload: noUsersFound});
  };

  const renderSearchResults = (renderCommonFriends: boolean): JSX.Element[] => {
    return state.displayedFriends
      .filter(
        userId => state.commonFriends.includes(userId) === renderCommonFriends,
      )
      .map(userId => (
        <SearchResult
          key={userId + '-container'}
          userId={userId}
          userDisplayData={state.displayData[userId]}
          db={db}
          storage={storage}
          //@ts-ignore
          userFrom={user.uid}
          requestStatus={
            renderCommonFriends ? undefined : state.requestStatuses[userId]
          }
          alreadyAFriend={
            currentUserFriends ? currentUserFriends[userId] : false
          }
          customButton={
            renderCommonFriends ? (
              <SeeProfileButton
                key={userId + '-button'}
                onPress={() =>
                  navigation.navigate('Profile Screen', {
                    userId: userId,
                    profileData: state.displayData[userId],
                    friends: null, // Fetch on render
                    currentUserFriends: currentUserFriends,
                    drinkingSessionData: null, // Fetch on render
                    preferences: null, // Fetch on render
                  })
                }
              />
            ) : null
          }
        />
      ));
  };

  // Monitor friend groups
  useMemo(() => {
    let commonFriends: string[] = [];
    let otherFriends: string[] = [];
    if (friends) {
      commonFriends = getCommonFriends(
        objKeys(friends),
        objKeys(currentUserFriends),
      );
      otherFriends = objKeys(friends).filter(
        friend => !commonFriends.includes(friend),
      );
    }
    dispatch({type: 'SET_COMMON_FRIENDS', payload: commonFriends});
    dispatch({type: 'SET_OTHER_FRIENDS', payload: otherFriends});
  }, [currentUserFriends, friends]);

  useMemo(() => {
    let noUsersFound: boolean = true;
    if (isNonEmptyArray(state.displayedFriends)) {
      noUsersFound = false;
    }
    dispatch({type: 'SET_NO_USERS_FOUND', payload: noUsersFound});
  }, [state.displayedFriends]);

  useEffect(() => {
    const initialSearch = async (): Promise<void> => {
      dispatch({type: 'SET_SEARCHING', payload: true});
      const friendIds = objKeys(friends);
      await updateHooksBasedOnSearchResults(friendIds);
      dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: friendIds});
      dispatch({type: 'SET_SEARCHING', payload: false});
    };
    initialSearch();
  }, []);

  const resetSearch = (): void => {
    // Reset all values displayed on screen
    const friendIds = objKeys(friends);
    dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: friendIds});
    dispatch({type: 'SET_SEARCHING', payload: false});
    dispatch({type: 'SET_NO_USERS_FOUND', payload: false});
  };

  if (!user || !storage) return;

  return (
    <View style={styles.mainContainer}>
      <MainHeader
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
          ) : isNonEmptyArray(state.displayedFriends) ? (
            <>
              <GrayHeader
                headerText={`Common Friends (${state.commonFriends.length})`}
              />
              {renderSearchResults(true)}
              <GrayHeader
                headerText={`Other Friends (${state.otherFriends.length})`}
              />
              {renderSearchResults(false)}
            </>
          ) : state.noUsersFound ? (
            <Text style={commonStyles.noUsersFoundText}>
              {objKeys(friends).length > 0
                ? 'No friends found.\n\nTry searching for other users.'
                : 'This user has not added any friends yet.'}
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
});

export default FriendsFriendsScreen;
