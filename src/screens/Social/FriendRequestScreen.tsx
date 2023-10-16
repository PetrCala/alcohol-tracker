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
import { FriendRequestData, ProfileDisplayData, FriendRequestStatus, ProfileData, UserData } from '../../types/database';
import { useContext, useEffect, useState } from 'react';
import SearchUsersPopup from '../../components/Popups/SearchUsersPopup';
import DatabaseContext from '../../context/DatabaseContext';
import { fetchUserProfiles } from '../../database/profile';
import { acceptFriendRequest, deleteFriendRequest } from '../../database/friends';
import { getAuth } from 'firebase/auth';
import { isNonEmptyObject } from '../../utils/validation';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import LoadingData from '../../components/LoadingData';

type FriendRequestProps = {
  requestId: string; // Other user's ID
  requestStatus: FriendRequestStatus;
  profileData: ProfileData;
};

type ScreenProps = {
  userData: UserData | null;
}

const FriendRequest = (props: FriendRequestProps) => {
  const { requestId, requestStatus, profileData } = props;
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);

  if (!db || !user) return;

  const FriendRequestButtons = () => {
    return(
      <View style={styles.friendRequestButtonsContainer}>
        <TouchableOpacity 
          style={[
            styles.handleRequestButton,
            styles.acceptRequestButton
          ]}
          onPress = {() => acceptFriendRequest(db, user.uid, requestId)}
        >
          <Text style={styles.handleRequestText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.handleRequestButton,
            styles.rejectRequestButton
          ]}
          onPress = {() => deleteFriendRequest(db, user.uid, requestId)}
        >
          <Text style={styles.handleRequestText}>Remove</Text>
        </TouchableOpacity>
      </View>
    )
  };

  const FriendRequestPending = () => {
    return (
      <View style={styles.friendRequestPendingContainer}>
        <Text style={styles.handleRequestText}>Pending</Text>
      </View>
    );
  };

  if (!profileData) return;

  return (
    <View style={styles.friendRequestContainer}>
      <View style={styles.friendRequestProfile}>
        <Text key={'request-id'} style={styles.friendRequestText}>Friend request ID: {requestId}</Text>
        <Text key={'nickname'} style={styles.friendRequestText}>Nickname: {profileData.display_name}</Text>
        {/* Include profile picture here too */}
        <Text key={'status'} style={styles.friendRequestText}>Friend request status: {requestStatus}</Text>
      </View>
      {requestStatus === 'received' ?
      <FriendRequestButtons/>
      : requestStatus === 'sent' ?
      <FriendRequestPending/>
      : 
      <></>
      }
    </View>
  );
};

const FriendRequestScreen = (props:ScreenProps) => {
  const {userData} = props;
  const db = useContext(DatabaseContext);
  const [friendRequests, setFriendRequests] = useState<FriendRequestData>(userData ? userData?.friend_requests : {});
  const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(false);
  const [displayData, setDisplayData] = useProfileDisplayData({
    data: friendRequests,
    db: db,
    setLoadingDisplayData: setLoadingDisplayData
  });
  const [searchUsersModalVisible, setSearchUsersModalVisible] = useState<boolean>(false);

  const handleSearchModalClose = () => {
    setSearchUsersModalVisible(false);
  };

  useEffect(() => {
    if (!userData) return;
    setFriendRequests(userData.friend_requests);
  }, [userData]);

  return (
  <View style={styles.mainContainer}>
    <ScrollView style={styles.scrollViewContainer}>
      {isNonEmptyObject(friendRequests) ?
      <View style={styles.friendList}>
        {Object.keys(friendRequests).map((requestId) => (
          loadingDisplayData ?
          <LoadingData/> :
          <FriendRequest
              requestId={requestId}
              requestStatus={friendRequests[requestId]}
              profileData={displayData[requestId]}
          />
        ))}
      </View>
      :
      <></>
      }
      <SearchUsersPopup
        visible={searchUsersModalVisible}
        transparent={true}
        message={"Send a friend request to:"}
        placeholder={"Nickname"}
        onRequestClose={handleSearchModalClose}
      />
    </ScrollView>
    <View style={styles.newRequestContainer}>
        <TouchableOpacity
            style={styles.newRequestButton}
            onPress={() => setSearchUsersModalVisible(true)}
        >
            <Text style={styles.newRequestText}>
                New Friend Request
            </Text>
            {/* <Image
                source={require('../../../assets/icons/plus.png')}
                style={styles.newRequestPlusSign}
            /> */}
        </TouchableOpacity>
    </View>
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
    padding: 3,
  },
  friendRequestContainer: {
    width: '95%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  friendRequestProfile: {
    width: '70%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 2,
  },
  friendRequestText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400',
  },
  friendRequestButtonsContainer: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 2,
  },
  handleRequestButton: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  acceptRequestButton: {
    backgroundColor: 'green',
  },
  rejectRequestButton: {
    backgroundColor: 'red',
  },
  handleRequestText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  friendRequestPendingContainer: {
    width: '25%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  newRequestContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 50,
    width: 150,
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
    backgroundColor:'white',
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
