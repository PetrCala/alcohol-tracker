import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  FriendRequestStatus,
  ProfileList,
  FriendRequestList,
} from '@src/types/database';
import {useEffect, useMemo, useReducer} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import {auth} from '@src/services/firebaseSetup';
import {isNonEmptyArray} from '@utils/validation';
import LoadingData from '@components/LoadingData';
import {Database} from 'firebase/database';
import {searchArrayByText} from '@src/services/search/search';
import {fetchUserProfiles} from '@database/profile';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import {FriendsFriendsScreenProps} from '@src/types/screens';
import MainHeader from '@components/Header/MainHeader';
import GrayHeader from '@components/Header/GrayHeader';
import {
  getCommonFriends,
  getCommonFriendsCount,
} from '@src/utils/social/friendUtils';
import {
  UserIdToNicknameMapping,
  UserSearchResults,
} from '@src/types/various/Search';
import {objKeys} from '@src/utils/dataHandling';
import {getDatabaseData} from '@src/context/global/DatabaseDataContext';
import SeeProfileButton from '@components/Buttons/SeeProfileButton';
import GeneralAction from '@src/types/various/GeneralAction';
import commonStyles from '@src/styles/commonStyles';
import {getNicknameMapping} from '@src/services/search/searchUtils';
import FillerView from '@components/FillerView';

interface State {
  searching: boolean;
  displayedFriends: UserSearchResults;
  commonFriends: UserSearchResults;
  otherFriends: UserSearchResults;
  requestStatuses: {[userId: string]: FriendRequestStatus | undefined};
  noUsersFound: boolean;
  displayData: ProfileList;
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
  const {userId, friends} = route.params;
  const {db, storage} = useFirebase();
  const {userData} = getDatabaseData();
  const user = auth.currentUser;
  const [state, dispatch] = useReducer(reducer, initialState);

  const localSearch = async (searchText: string): Promise<void> => {
    try {
      let searchMapping: UserIdToNicknameMapping = getNicknameMapping(
        state.displayData,
        'display_name',
      );
      let relevantResults = searchArrayByText(
        objKeys(friends),
        searchText,
        searchMapping,
      );
      dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: relevantResults}); // Hide irrelevant
    } catch (error: any) {
      Alert.alert(
        'Database serach failed',
        'Could not search the database: ' + error.message,
      );
      return;
    }
  };

  const updateDisplayData = async (
    searchResultData: UserSearchResults,
  ): Promise<void> => {
    let newDisplayData: ProfileList = await fetchUserProfiles(
      db,
      searchResultData,
    );
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
  };

  useMemo(() => {
    const updateRequestStatuses = (
      friendRequests: FriendRequestList | undefined,
    ): void => {
      let newRequestStatuses: {
        [userId: string]: FriendRequestStatus;
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
            // renderCommonFriends ? undefined : state.requestStatuses[userId]
            state.requestStatuses[userId]
          }
          alreadyAFriend={userData?.friends ? userData?.friends[userId] : false}
          customButton={
            renderCommonFriends ? (
              <SeeProfileButton
                key={userId + '-button'}
                onPress={() =>
                  navigation.navigate('Profile Screen', {
                    userId: userId,
                    profileData: state.displayData[userId],
                    friends: null, // Fetch on render
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
        objKeys(userData?.friends),
      );
      otherFriends = objKeys(friends).filter(
        friend => !commonFriends.includes(friend),
      );
    }
    dispatch({type: 'SET_COMMON_FRIENDS', payload: commonFriends});
    dispatch({type: 'SET_OTHER_FRIENDS', payload: otherFriends});
  }, [userData, friends, state.requestStatuses]);

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
      <SearchWindow
        windowText="Search this user's friends"
        onSearch={localSearch}
        onResetSearch={resetSearch}
        searchOnTextChange={true}
      />
      <ScrollView
        style={styles.scrollViewContainer}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled">
        <View style={styles.searchResultsContainer}>
          {state.searching ? (
            <LoadingData style={styles.loadingData} />
          ) : isNonEmptyArray(state.displayedFriends) ? (
            <>
              <GrayHeader
                headerText={`Common Friends (${getCommonFriendsCount(
                  state.commonFriends,
                  state.displayedFriends,
                )})`}
              />
              {renderSearchResults(true)}
              <GrayHeader
                headerText={`Other Friends (${getCommonFriendsCount(
                  state.otherFriends,
                  state.displayedFriends,
                )})`}
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
        <FillerView height={100} />
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
  loadingData: {
    width: '100%',
    height: 50,
    margin: 5,
  },
});

export default FriendsFriendsScreen;
