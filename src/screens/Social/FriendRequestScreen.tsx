import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendRequestData, FriendRequestStatus, UserData } from '../../types/database';

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

  const friendRequests:FriendRequestData = userData?.friend_requests ? userData.friend_requests : {};

  // Before sending a request, make sure that the request
  // has not been sent already. If it indeed has not, the
  // sendFriendRequst function can be called as is.
  
  return (
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
        <Text>This is the friend request screen</Text>
      </View>
      }
    </ScrollView>
  );
};

export default FriendRequestScreen;

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
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
});