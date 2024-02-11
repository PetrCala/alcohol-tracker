import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FriendRequestList,
  FriendRequestStatus,
  FriendList,
  ProfileList,
} from '@src/types/database';
import {useEffect, useMemo, useReducer} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import {acceptFriendRequest, deleteFriendRequest} from '@database/friends';
import {auth} from '@src/services/firebaseSetup';
import LoadingData from '@components/LoadingData';
import {Database} from 'firebase/database';
import NoFriendUserOverview from '@components/Social/NoFriendUserOverview';
import {fetchUserProfiles} from '@database/profile';
import headerStyles from '@src/styles/headerStyles';
import GrayHeader from '@components/Header/GrayHeader';
import {objKeys} from '@src/utils/dataHandling';
import CONST from '@src/CONST';

type FriendRequestButtonsProps = {
  requestId: string;
};

type FriendRequestPendingProps = {
  requestId: string;
};

type FriendRequestComponentProps = {
  requestStatus: FriendRequestStatus | undefined;
  requestId: string;
};

type FriendRequestItemProps = {
  requestId: string;
  friendRequests: FriendRequestList | undefined;
  displayData: ProfileList;
};

type ScreenProps = {
  friendRequests: FriendRequestList | undefined;
  friends: FriendList | undefined;
};

const handleAcceptFriendRequest = async (
  db: Database,
  userId: string,
  requestId: string,
): Promise<void> => {
  try {
    await acceptFriendRequest(db, userId, requestId);
  } catch (error: any) {
    Alert.alert(
      'User does not exist in the database',
      'Could not accept the friend request: ' + error.message,
    );
  }
};

const handleRejectFriendRequest = async (
  db: Database,
  userId: string,
  requestId: string,
): Promise<void> => {
  try {
    await deleteFriendRequest(db, userId, requestId);
  } catch (error: any) {
    Alert.alert(
      'User does not exist in the database',
      'Could not accept the friend request: ' + error.message,
    );
  }
};

// Component to be shown for a received friend request
const FriendRequestButtons: React.FC<FriendRequestButtonsProps> = ({
  requestId,
}) => {
  const {db} = useFirebase();
  const user = auth.currentUser;

  if (!db || !user) return;

  return (
    <View style={styles.friendRequestButtonsContainer}>
      <TouchableOpacity
        key={requestId + '-accept-request-button'}
        style={[styles.handleRequestButton, styles.acceptRequestButton]}
        onPress={() => handleAcceptFriendRequest(db, user.uid, requestId)}>
        <Text style={styles.handleRequestButtonText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity
        key={requestId + '-reject-request-button'}
        style={[styles.handleRequestButton, styles.rejectRequestButton]}
        onPress={() => handleRejectFriendRequest(db, user.uid, requestId)}>
        <Text style={styles.handleRequestButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component to be shown when the friend request is pending
const FriendRequestPending: React.FC<FriendRequestPendingProps> = ({
  requestId,
}) => {
  const {db} = useFirebase();
  const user = auth.currentUser;

  if (!db || !user) return;
  return (
    <View style={styles.friendRequestPendingContainer}>
      <TouchableOpacity
        style={[styles.handleRequestButton, styles.rejectRequestButton]}
        onPress={() => handleRejectFriendRequest(db, user.uid, requestId)}>
        <Text style={styles.handleRequestButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component to be rendered on the right hand side of each friend request container
const FriendRequestComponent: React.FC<FriendRequestComponentProps> = ({
  requestStatus,
  requestId,
}) => {
  return requestStatus === CONST.FRIEND_REQUEST_STATUS.RECEIVED ? (
    <FriendRequestButtons
      key={requestId + '-friend-request-buttons'}
      requestId={requestId}
    />
  ) : requestStatus === CONST.FRIEND_REQUEST_STATUS.SENT ? (
    <FriendRequestPending
      key={requestId + '-friend-request-pending'}
      requestId={requestId}
    />
  ) : null;
};

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
  requestId,
  friendRequests,
  displayData,
}) => {
  if (!friendRequests || !displayData) return null;
  const profileData = displayData[requestId];
  const requestStatus = friendRequests[requestId];

  return (
    <NoFriendUserOverview
      key={requestId + '-friend-request'}
      userId={requestId}
      profileData={profileData}
      RightSideComponent={FriendRequestComponent({
        requestId,
        requestStatus,
      })}
    />
  );
};

interface State {
  isLoading: boolean;
  displayData: ProfileList;
  requestsSent: string[];
  requestsReceived: string[];
  requestsSentCount: number;
  requestsReceivedCount: number;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  isLoading: true,
  displayData: {},
  requestsSent: [],
  requestsReceived: [],
  requestsSentCount: 0,
  requestsReceivedCount: 0,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IS_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_DISPLAY_DATA':
      return {...state, displayData: action.payload};
    case 'SET_REQUESTS_SENT':
      return {...state, requestsSent: action.payload};
    case 'SET_REQUESTS_RECEIVED':
      return {...state, requestsReceived: action.payload};
    case 'SET_REQUESTS_SENT_COUNT':
      return {...state, requestsSentCount: action.payload};
    case 'SET_REQUESTS_RECEIVED_COUNT':
      return {...state, requestsReceivedCount: action.payload};
    default:
      return state;
  }
};

const FriendRequestScreen = (props: ScreenProps) => {
  const {friendRequests} = props;
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateDisplayData = async (
    db: Database,
    friendRequests: FriendRequestList | undefined,
  ): Promise<void> => {
    let newDisplayData: ProfileList = await fetchUserProfiles(
      db,
      objKeys(friendRequests),
    );
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
  };

  useEffect(() => {
    const updateLocalHooks = async () => {
      dispatch({type: 'SET_IS_LOADING', payload: true});
      await updateDisplayData(db, friendRequests);
      dispatch({type: 'SET_IS_LOADING', payload: false});
    };
    updateLocalHooks();
  }, [friendRequests]);

  useMemo(() => {
    const newRequestsSent: string[] = [];
    const newRequestsReceived: string[] = [];
    if (friendRequests) {
      Object.keys(friendRequests).forEach(requestId => {
        if (friendRequests[requestId] === CONST.FRIEND_REQUEST_STATUS.SENT) {
          newRequestsSent.push(requestId);
        } else if (
          friendRequests[requestId] === CONST.FRIEND_REQUEST_STATUS.RECEIVED
        ) {
          newRequestsReceived.push(requestId);
        }
      });
    }
    const newRequestsSentCount = newRequestsSent.length;
    const newRequestsReceivedCount = newRequestsReceived.length;

    dispatch({type: 'SET_REQUESTS_SENT', payload: newRequestsSent});
    dispatch({type: 'SET_REQUESTS_RECEIVED', payload: newRequestsReceived});
    dispatch({type: 'SET_REQUESTS_SENT_COUNT', payload: newRequestsSentCount});
    dispatch({
      type: 'SET_REQUESTS_RECEIVED_COUNT',
      payload: newRequestsReceivedCount,
    });
  }, [friendRequests]);

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollViewContainer}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled">
        {state.isLoading ? (
          <LoadingData style={styles.loadingData} />
        ) : (
          <View style={styles.friendList}>
            <GrayHeader
              headerText={`Requests Received (${state.requestsReceivedCount})`}
            />
            <View style={styles.requestsContainer}>
              {state.requestsReceived.map(requestId => (
                <FriendRequestItem
                  key={requestId + '-friend-request-item'}
                  requestId={requestId}
                  friendRequests={friendRequests}
                  displayData={state.displayData}
                />
              ))}
            </View>
            <View style={headerStyles.grayHeaderContainer}>
              <Text style={headerStyles.grayHeaderText}>
                Requests Sent ({state.requestsSentCount})
              </Text>
            </View>
            <View style={styles.requestsContainer}>
              {state.requestsSent.map(requestId => (
                <FriendRequestItem
                  key={requestId + '-friend-request-item'}
                  requestId={requestId}
                  friendRequests={friendRequests}
                  displayData={state.displayData}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FriendRequestScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  loadingData: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    margin: 5,
  },
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'gray',
  },
  requestsInfoText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  requestsContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendRequestButtonsContainer: {
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 5,
  },
  handleRequestButton: {
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    margin: 2,
  },
  acceptRequestButton: {
    backgroundColor: 'green',
  },
  rejectRequestButton: {
    backgroundColor: 'red',
  },
  handleRequestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  handleRequestText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
  },
  cancelRequestImage: {
    height: '110%',
    width: '110%',
    tintColor: 'white',
  },
  friendRequestPendingContainer: {
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  newRequestContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 50,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  },
  newRequestButton: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  newRequestText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  //   newRequestPlusSign: {
  //     width: 50,
  //     height: 50,
  //     tintColor: 'white',
  //   },
});
