import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FriendRequestData,
  FriendRequestStatus,
  UserData,
} from '../../types/database';
import {useEffect, useState} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import {acceptFriendRequest, deleteFriendRequest} from '../../database/friends';
import {auth} from '../../../src/services/firebaseConfig';
import {isNonEmptyObject} from '../../utils/validation';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import LoadingData from '../../components/LoadingData';
import {Database} from 'firebase/database';
import UserOverview from '../../components/UserOverview';

type FriendRequestButtonsProps = {
  requestId: string;
};

type FriendRequestComponentProps = {
  requestStatus: FriendRequestStatus | undefined;
  requestId: string;
};

type ScreenProps = {
  userData: UserData | null;
};

// Component to be shown for a received friend request
const FriendRequestButtons: React.FC<FriendRequestButtonsProps> = ({
  requestId,
}) => {
  const {db} = useFirebase();
  const user = auth.currentUser;

  const handleAcceptFriendRequest = async (
    db: Database,
    userId: string,
    requestId: string,
  ): Promise<void> => {
    try {
      await acceptFriendRequest(db, userId, requestId);
    } catch (error: any) {
      Alert.alert(
        'Friend request accept failed',
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
        'Friend request accept failed',
        'Could not accept the friend request: ' + error.message,
      );
    }
  };

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
const FriendRequestPending: React.FC = () => {
  return (
    <View style={styles.friendRequestPendingContainer}>
      <Text style={styles.handleRequestText}>Pending</Text>
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
    <FriendRequestPending key={requestId + '-friend-request-pending'} />
  ) : (
    <></>
  );
};

const FriendRequestScreen = (props: ScreenProps) => {
  const {userData} = props;
  const {db} = useFirebase();
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestData | undefined
  >(userData?.friend_requests);
  const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(false);
  const [displayData, setDisplayData] = useProfileDisplayData({
    data: friendRequests ?? {},
    db: db,
    setLoadingDisplayData: setLoadingDisplayData,
  });

  useEffect(() => {
    setFriendRequests(userData?.friend_requests);
  }, [userData]);

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled">
        {/* {isNonEmptyObject(friendRequests) ? ( */}
        {friendRequests ? (
          <View style={styles.friendList}>
            {Object.keys(friendRequests).map(requestId => {
              const profileData = displayData[requestId];
              const requestStatus = friendRequests[requestId];

              if (loadingDisplayData)
                return <LoadingData key={requestId + '-loading'} />;

              return (
                <UserOverview
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

const screenWidth = Dimensions.get('window').width;

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
  friendRequestContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 5,
  },
  friendRequestProfile: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    paddingTop: 7,
  },
  friendRequestImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
  friendRequestText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
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
