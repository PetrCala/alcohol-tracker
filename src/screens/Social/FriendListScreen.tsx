import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendIds, UserData } from "../../types/database";
import UserOverview from '../../components/UserOverview';

// type FriendOverviewProps = {
//   index: any;
//   friendId: string;
// }

type ScreenProps = {
  userData: UserData | null;
}

// export const FriendOverview = (props: FriendOverviewProps) => {
//   const { index, friendId } = props;

//   return (
//     <View style={styles.friendOverviewContainer}>
//       <Text key={index} style={styles.friendText}>{friendId}</Text>
//       {/* <Image></Image> friend icon*/}
//       {/* <Text></Text> friend nickname*/}
//     </View>
//   );
// };

const FriendListScreen = (props:ScreenProps) => {
  const {userData} = props;
  const friends = userData?.friends ? userData?.friends : {};

  return (
    <ScrollView style={styles.scrollViewContainer}>
      {friends ? 
      <View style={styles.friendList}>
        {Object.keys(friends).map((friendId, index) => (
          <UserOverview
            index={index}
            userId={friendId}
            RightSideComponent={<></>}
          />
        ))}
      </View>
      :
      <View style={{
        flex:1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'cyan',
        height: Dimensions.get('screen').height,
        }}>
        <Text>This is the friend list screen</Text>
      </View>
      }
    </ScrollView>
  );
};

export default FriendListScreen;

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
  friendOverviewContainer: {
    width: '80%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  friendText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400',
  },
});
