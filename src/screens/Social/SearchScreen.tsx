import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NicknameToIdData,
  FriendRequestStatusState,
  FriendsData,
  FriendRequestDisplayData,
  ProfileDisplayData,
  ProfileData,
} from '../../types/database';
import {useCallback, useEffect, useMemo, useReducer, useState} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import {acceptFriendRequest, sendFriendRequest} from '../../database/friends';
import {auth} from '../../services/firebaseSetup';
import {isNonEmptyObject} from '../../utils/validation';
import LoadingData from '../../components/LoadingData';
import {Database} from 'firebase/database';
import {searchDbByNickname} from '../../database/search';
import {fetchUserProfiles} from '@database/profile';

const statusToTextMap: {[key in FriendRequestStatusState]: string} = {
  self: 'You',
  friend: 'Already a friend',
  sent: 'Awaiting a response',
  received: 'Accept friend request',
  undefined: 'Send a request',
};

type SearchResultProps = {
  userId: string;
  displayData: any;
  db: Database;
  userFrom: string;
  requestStatus: FriendRequestStatusState | undefined;
  // updateRequestStatus: (
  //   userId: string,
  //   newStatus: FriendRequestStatusState,
  // ) => void;
  alreadyAFriend: boolean;
};

const SearchResult: React.FC<SearchResultProps> = ({
  userId,
  displayData,
  db,
  userFrom,
  requestStatus,
  alreadyAFriend,
}) => {
  return (
    <View style={styles.userOverviewContainer}>
      <View style={styles.userInfoContainer}>
        <Image
          style={styles.userProfileImage}
          source={
            displayData[userId]?.photo_url &&
            displayData[userId]?.photo_url !== ''
              ? {uri: displayData[userId].photo_url}
              : require('../../../assets/temp/user.png')
          }
        />
        <Text style={styles.userNicknameText}>
          {displayData[userId]?.display_name
            ? displayData[userId].display_name
            : 'Unknown'}
        </Text>
      </View>
      <SendFriendRequestButton
        db={db}
        userFrom={userFrom}
        userTo={userId}
        requestStatus={requestStatus}
        alreadyAFriend={alreadyAFriend}
      />
    </View>
  );
};

type SendFriendRequestButtonProps = {
  db: Database;
  userFrom: string;
  userTo: string;
  requestStatus: FriendRequestStatusState | undefined;
  // updateRequestStatus: (
  //   userId: string,
  //   newStatus: FriendRequestStatusState,
  // ) => void;
  alreadyAFriend: boolean;
};

const SendFriendRequestButton: React.FC<SendFriendRequestButtonProps> = ({
  db,
  userFrom,
  userTo,
  requestStatus,
  // updateRequestStatus,
  alreadyAFriend,
}) => {
  const handleSendRequestPress = async (
    db: Database,
    userFrom: string,
    userTo: string,
    // updateRequestStatus: (
    //   userId: string,
    //   newStatus: FriendRequestStatusState,
    // ) => void,
  ): Promise<void> => {
    try {
      await sendFriendRequest(db, userFrom, userTo);
    } catch (error: any) {
      Alert.alert(
        'User does not exist in the database',
        'Could not send a friend request: ' + error.message,
      );
      return;
    }
    // updateRequestStatus(userTo, 'sent');
  };

  const handleAcceptFriendRequestPress = async (
    db: Database,
    userFrom: string,
    userTo: string,
    // updateRequestStatus: (
    //   userId: string,
    //   newStatus: FriendRequestStatusState,
    // ) => void,
  ): Promise<void> => {
    try {
      await acceptFriendRequest(db, userFrom, userTo);
    } catch (error: any) {
      Alert.alert(
        'User does not exist in the database',
        'Could not accept a friend request: ' + error.message,
      );
      return;
    }
    // updateRequestStatus(userTo, 'friend');
  };

  return (
    // Refactor this part using AI later
    <View style={styles.sendFriendRequestContainer}>
      {userFrom === userTo ? (
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.self}</Text>
      ) : alreadyAFriend ? (
        <Text style={styles.sendFriendRequestText}>
          {statusToTextMap.friend}
        </Text>
      ) : requestStatus === 'sent' ? (
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.sent}</Text>
      ) : requestStatus === 'received' ? (
        <TouchableOpacity
          style={styles.acceptFriendRequestButton}
          onPress={() =>
            handleAcceptFriendRequestPress(
              db,
              userFrom,
              userTo,
              // updateRequestStatus,
            )
          }>
          <Text style={styles.sendFriendRequestText}>
            {statusToTextMap.received}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.sendFriendRequestButton}
          onPress={() => handleSendRequestPress(db, userFrom, userTo)}>
          <Text style={styles.sendFriendRequestText}>
            {statusToTextMap.undefined}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface State {
  searchText: string;
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
  searchText: '',
  searchResultData: {},
  searching: false,
  requestStatuses: {},
  noUsersFound: false,
  displayData: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SEARCH_TEXT':
      return {...state, searchText: action.payload};
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

type ScreenProps = {
  friendRequests: FriendRequestDisplayData | undefined;
  setFriendRequests: React.Dispatch<
    React.SetStateAction<FriendRequestDisplayData | undefined>
  >;
  friends: FriendsData | undefined;
  setFriends: React.Dispatch<React.SetStateAction<FriendsData | undefined>>;
};

const SearchScreen = (props: ScreenProps) => {
  const {friendRequests, friends} = props;
  const {db} = useFirebase();
  const user = auth.currentUser;
  const [state, dispatch] = useReducer(reducer, initialState);

  const doSearch = async (db: Database, nickname: string): Promise<void> => {
    if (!db || !nickname) return; // Input a value first alert
    let searchResultData: NicknameToIdData = {};
    dispatch({type: 'SET_SEARCHING', payload: true});
    try {
      const newResults = await searchDbByNickname(db, nickname); // Nicknam cleaned within the function
      if (newResults) {
        searchResultData = newResults;
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

  /** Having a list of users returned by the search,
   * determine the request status for each and update
   * the RequestStatuses hook.
   */
  const updateRequestStatuses = (searchResultData: NicknameToIdData = state.searchResultData): void => {
    let newRequestStatuses: {
      [userId: string]: FriendRequestStatusState;
    } = {};
    if (isNonEmptyObject(searchResultData)) {
      Object.keys(searchResultData).forEach(userId => {
        if (friendRequests && friendRequests[userId]) {
          newRequestStatuses[userId] = friendRequests[userId];
        }
      });
    }
    dispatch({type: 'SET_REQUEST_STATUSES', payload: newRequestStatuses});
  };

  const updateHooksBasedOnSearchResults = async (
    searchResults: NicknameToIdData,
  ): Promise<void> => {
    updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const noUsersFound = !isNonEmptyObject(searchResults);
    dispatch({type: 'SET_NO_USERS_FOUND', payload: noUsersFound});
  };

  const resetSearch = () => {
    // Reset all values displayed on screen
    dispatch({type: 'SET_SEARCHING', payload: false});
    dispatch({type: 'SET_SEARCH_TEXT', payload: ''});
    dispatch({type: 'SET_SEARCH_RESULT_DATA', payload: {}});
    dispatch({type: 'SET_REQUEST_STATUSES', payload: {}});
    dispatch({type: 'SET_DISPLAY_DATA', payload: {}});
    dispatch({type: 'SET_NO_USERS_FOUND', payload: false});
  };

  useMemo(() => {
    updateRequestStatuses();
  }, [friendRequests]); // When updated in the database, not locally

  if (!db || !user) return;

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.searchInfoText}>Search users</Text>
        <View style={styles.textContainer}>
          <TextInput
            placeholder="Nickname"
            value={state.searchText}
            onChangeText={text =>
              dispatch({type: 'SET_SEARCH_TEXT', payload: text})
            }
            style={styles.searchText}
            keyboardType="default"
            textContentType="nickname"
          />
          {state.searchText !== '' ? (
            <TouchableOpacity
              onPress={() => resetSearch()}
              style={styles.searchTextResetContainer}>
              <Image
                style={styles.searchTextResetImage}
                source={require('../../../assets/icons/thin_x.png')}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => doSearch(db, state.searchText)}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
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
                userFrom={user.uid}
                requestStatus={state.requestStatuses[userId]}
                alreadyAFriend={friends ? friends[userId] : false}
              />
            ))
          ) : state.noUsersFound ? (
            <Text style={styles.noUsersFoundText}>
              There are no users with this nickname.
            </Text>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  searchResultsView: {
    width: '90%',
    flexDirection: 'column',
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    padding: 15,
    alignItems: 'center',
    elevation: 5,
  },
  searchInfoText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    marginTop: 10,
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
  cancelButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 5,
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
  cancelButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    padding: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  userNicknameText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  userProfileImage: {
    width: 70,
    height: 70,
    padding: 5,
  },
  sendFriendRequestContainer: {
    width: 'auto',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  sendFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  acceptFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  sendFriendRequestText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
});
