import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendRequestData, FriendRequestStatus, UserData } from '../../types/database';
import { useState } from 'react';
import SearchUsersPopup from '../../components/Popups/SearchUsersPopup';

type FriendRequestProps = {
  index: any;
  requestId: string; // Other user's ID
  requestStatus: FriendRequestStatus;
};

type ScreenProps = {
  userData: UserData | null;
}

const FriendRequest = (props: FriendRequestProps) => {
  const { index, requestId, requestStatus } = props;

  return (
    <View style={styles.friendRequestContainer}>
      <Text key={index} style={styles.friendRequestText}>Friend request ID: {requestId}</Text>
      <Text key={index} style={styles.friendRequestText}>Friend request status: {requestStatus}</Text>
    </View>
  );
};

const FriendRequestScreen = (props:ScreenProps) => {
  const {userData} = props;
  const [searchUsersModalVisible, setSearchUsersModalVisible] = useState<boolean>(false);

  const friendRequests:FriendRequestData = userData?.friend_requests ? userData.friend_requests : {};

  const handleSearchModalClose = () => {
    setSearchUsersModalVisible(false);
  };

  return (
  <View style={styles.mainContainer}>
    <ScrollView style={styles.scrollViewContainer}>
      {friendRequests ? 
      <View style={styles.friendList}>
        {Object.keys(friendRequests).map((requestId, index) => (
            <FriendRequest
                index={index}
                requestId={requestId}
                requestStatus={friendRequests[index]}
            />
        ))}
      </View>
      :
      <View style={{
        flex:1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'pink',
        height: Dimensions.get('screen').height,
        }}>
        <Text>There are no friend requests to display</Text>
      </View>
      }
      <SearchUsersPopup
        visible={searchUsersModalVisible}
        transparent={true}
        message={"Input the nickname of the user you\nwould like to send a friend request to:"}
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
    // justifyContent: 'center',
  },
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 3,
  },
  friendRequestContainer: {
    width: '80%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  friendRequestText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400',
  },
  newRequestContainer: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    height: 50,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  },
  newRequestButton: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newRequestText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
//   newRequestPlusSign: {
//     width: 50,
//     height: 50,
//     tintColor: 'white',
//   },
});
