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
import { useFirebase } from '../../context/FirebaseContext';
import { fetchUserProfiles } from '../../database/profile';
import { acceptFriendRequest, deleteFriendRequest } from '../../database/friends';
import { getAuth } from 'firebase/auth';
import { isNonEmptyObject } from '../../utils/validation';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import LoadingData from '../../components/LoadingData';
import { Database } from 'firebase/database';
import FillerView from '../../components/FillerView';

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
  const { db } = useFirebase();

  const handleAcceptFriendRequest = async (db:Database, userId:string, requestId: string):Promise<void> => {
    try {
      await acceptFriendRequest(db, userId, requestId);
    } catch (error:any){
      Alert.alert("Friend request accept failed", "Could not accept the friend request: " + error.message);
    };
  };

  const handleRejectFriendRequest = async (db:Database, userId:string, requestId: string):Promise<void> => {
    try {
      await deleteFriendRequest(db, userId, requestId);
    } catch (error:any){
      Alert.alert("Friend request accept failed", "Could not accept the friend request: " + error.message);
    };
  };

  if (!db || !user) return;

  const FriendRequestButtons = () => {
    return(
      <View style={styles.friendRequestButtonsContainer}>
        <TouchableOpacity 
          key={requestId+'-accept-request-button'}
          style={[
            styles.handleRequestButton,
            styles.acceptRequestButton
          ]}
          onPress = {() => handleAcceptFriendRequest(db, user.uid, requestId)}
        >
          <Text style={styles.handleRequestButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          key={requestId+'-reject-request-button'}
          style={[
            styles.handleRequestButton,
            styles.rejectRequestButton
          ]}
          onPress = {() => handleRejectFriendRequest(db, user.uid, requestId)}
        >
          <Text style={styles.handleRequestButtonText}>Remove</Text>
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
    <View key={requestId+'-container'} style={styles.friendRequestContainer}>
      <View key={requestId+'profile'} style={styles.friendRequestProfile}>
        <Image
          key={requestId+'-profile-icon'}
          style={styles.friendRequestImage}
          source={
            profileData?.photo_url && profileData?.photo_url !== '' ?
            {uri: profileData.photo_url}:
            require('../../../assets/temp/user.png')
          }
        />
        <Text key={requestId+'-nickname'} style={styles.friendRequestText}>{profileData.display_name}</Text>
      </View>
      {requestStatus === 'received' ?
      <FriendRequestButtons key={requestId+'-friend-request-buttons'}/>
      : requestStatus === 'sent' ?
      <FriendRequestPending key={requestId+'-friend-request-pending'}/>
      : 
      <></>
      }
    </View>
  );
};

const FriendRequestScreen = (props:ScreenProps) => {
  const {userData} = props;
  const { db } = useFirebase();
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
    <ScrollView 
      style={styles.scrollViewContainer}
      keyboardShouldPersistTaps="handled"
    >
      {isNonEmptyObject(friendRequests) ?
      <View style={styles.friendList}>
        {Object.keys(friendRequests).map(requestId => (
          loadingDisplayData ?
          <LoadingData key={requestId+'-loading'}/> :
          <FriendRequest
              key={requestId+'-friend-request'}
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
        message={"Search users"}
        placeholder={"Nickname"}
        onRequestClose={handleSearchModalClose}
      />
      <FillerView/>
    </ScrollView>
    <View style={styles.newRequestContainer}>
        <TouchableOpacity
            style={styles.newRequestButton}
            onPress={() => setSearchUsersModalVisible(true)}
        >
            <Text style={styles.newRequestText}>
                Add A Friend
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
    paddingTop: 7
  },
  friendRequestImage: {
    width: 70,
    height: 70,
    padding: 5,
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
