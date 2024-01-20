import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FriendRequestDisplayData,
  FriendRequestStatusState,
  FriendsData,
  NicknameToIdData,
  ProfileData,
  ProfileDisplayData,
} from '../../types/database';
import {useEffect, useReducer, useState} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import {acceptFriendRequest, deleteFriendRequest} from '../../database/friends';
import {auth} from '../../services/firebaseSetup';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import LoadingData from '../../components/LoadingData';
import {Database} from 'firebase/database';
import NoFriendUserOverview from '@components/Social/NoFriendUserOverview';
import {update} from 'lodash';
import { isNonEmptyObject } from '@src/utils/validation';
import { fetchUserProfiles } from '@database/profile';

type FriendRequestButtonsProps = {
  requestId: string;
};

type FriendRequestPendingProps = {
  requestId: string;
};

type FriendRequestComponentProps = {
  requestStatus: FriendRequestStatusState | undefined;
  requestId: string;
};

type ScreenProps = {
  friendRequests: FriendRequestDisplayData | undefined;
  setFriendRequests: React.Dispatch<
    React.SetStateAction<FriendRequestDisplayData | undefined>
  >;
  friends: FriendsData | undefined;
  setFriends: React.Dispatch<React.SetStateAction<FriendsData | undefined>>;
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
  return requestStatus === 'received' ? (
    <FriendRequestButtons
      key={requestId + '-friend-request-buttons'}
      requestId={requestId}
    />
  ) : requestStatus === 'sent' ? (
    <FriendRequestPending
      key={requestId + '-friend-request-pending'}
      requestId={requestId}
    />
  ) : (
    <></>
  );
};

interface State {
  isLoading: boolean;
  displayData: ProfileDisplayData;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  isLoading: true,
  displayData: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IS_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_DISPLAY_DATA':
      return {...state, displayData: action.payload};
    default:
      return state;
  }
};

const FriendRequestScreen = (props: ScreenProps) => {
  const {friendRequests} = props;
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateDisplayData = async (
    db: Database | undefined,
    friendRequests: FriendRequestDisplayData | undefined,
  ): Promise<void> => {
    const newDisplayData: ProfileDisplayData = {};
    if (db && friendRequests) {
      const dataIds = Object.keys(friendRequests);
      const userProfiles: ProfileData[] = await fetchUserProfiles(db, dataIds);
      dataIds.forEach((id, index) => {
        newDisplayData[id] = userProfiles[index];
      });
    }
    dispatch({type: 'SET_DISPLAY_DATA', payload: newDisplayData});
  };

  useEffect(() => {
    const updateLocalHooks = async () => {
      dispatch({type: 'SET_IS_LOADING', payload: false});
      await updateDisplayData(db, friendRequests);
      dispatch({type: 'SET_IS_LOADING', payload: false});
    };
    updateLocalHooks();
  }, [friendRequests]);

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled">
        {state.isLoading ? (
          <LoadingData />
        ) : friendRequests ? (
          <View style={styles.friendList}>
            {Object.keys(friendRequests).map(requestId => {
              const profileData = state.displayData[requestId];
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
            })}
          </View>
        ) : (
          <></>
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
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendRequestButtonsContainer: {
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  handleRequestButton: {
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 2,
    marginRight: 2,
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
  cancelRequestButton: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  cancelRequestImage: {
    height: '110%',
    width: '110%',
    tintColor: 'white',
  },
  friendRequestPendingContainer: {
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 10,
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
