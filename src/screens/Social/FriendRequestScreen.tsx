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
import { FriendRequestData, FriendRequestDisplayData, FriendRequestStatus, ProfileData, UserData } from '../../types/database';
import { useContext, useEffect, useState } from 'react';
import SearchUsersPopup from '../../components/Popups/SearchUsersPopup';
import DatabaseContext from '../../context/DatabaseContext';
import { fetchUserProfiles } from '../../database/profile';
import { acceptFriendRequest, deleteFriendRequest } from '../../database/friends';
import { getAuth } from 'firebase/auth';

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
        <Text style={styles.friendRequestText}>Friend request ID: {requestId}</Text>
        <Text style={styles.friendRequestText}>Nickname: {profileData.display_name}</Text>
        {/* Include profile picture here too */}
        <Text style={styles.friendRequestText}>Friend request status: {requestStatus}</Text>
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
  const [friendRequests, setFriendRequests] = useState<FriendRequestData>(userData ? userData.friend_requests : {});
  const [displayData, setDisplayData] = useState<FriendRequestDisplayData>({})
  const [searchUsersModalVisible, setSearchUsersModalVisible] = useState<boolean>(false);

  const handleSearchModalClose = () => {
    setSearchUsersModalVisible(false);
  };

  useEffect(() => {
    if (!userData) return;
    setFriendRequests(userData.friend_requests);
  }, [userData]);

  useEffect(() => {
    const fetchDisplayData = async () => {
      if (!db || !friendRequests) return;
      var newDisplayData:FriendRequestDisplayData = {};
      try {
        let requestIds = Object.keys(friendRequests);
        let userProfiles:ProfileData[] = await fetchUserProfiles(db, requestIds);
        for (let i = 0; i < userProfiles.length; i++) {
          let requestId = requestIds[i];
          let profile = userProfiles[i];
          newDisplayData[requestId] = profile;
        };
      } catch (error:any) {
        Alert.alert("Database connection failed", "Could not fetch the profile data associated with the displayed friend requests: " + error.message);
      } finally {
        setDisplayData(newDisplayData);
      };
    };
    fetchDisplayData();
  }, [friendRequests]);

  return (
  <View style={styles.mainContainer}>
    <ScrollView style={styles.scrollViewContainer}>
      {Object.keys(friendRequests).length > 0 ? 
      <View style={styles.friendList}>
        {Object.keys(friendRequests).map((requestId) => (
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
