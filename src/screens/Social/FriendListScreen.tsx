import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendIds, FriendsData, UserData } from "../../types/database";
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import { useContext, useEffect, useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { isNonEmptyObject } from '../../utils/validation';
import LoadingData from '../../components/LoadingData';

// type FriendOverviewProps = {
//   index: any;
//   friendId: string;
// }

type ScreenProps = {
  userData: UserData | null;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
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
  const {userData, setIndex} = props;
  const { db } = useFirebase();
  const [friends, setFriends] = useState<FriendsData>(userData ? userData?.friends : {});
  const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(false);
  const [displayData, setDisplayData] = useProfileDisplayData({
    data: friends,
    db: db,
    setLoadingDisplayData: setLoadingDisplayData
  });

  useEffect(() => {
    if (!userData) return;
    (userData.friend_requests);
  }, [userData]);

  return (
    <ScrollView style={styles.scrollViewContainer}>
      {isNonEmptyObject(friends) ? 
      <View style={styles.friendList}>
        {Object.keys(friends).map(friendId => (
          loadingDisplayData ?
          <LoadingData key={friendId+'-loading'}/> :
          // <UserOverview
          //   key={friendId+'-user-overview'}
          //   userId={friendId}
          //   RightSideComponent={<></>}
          // />
          <></>
        ))}
      </View>
      :
      <View style={styles.emptyList}>
        <Text style={styles.emptyListText}>You do not have any friends yet</Text>
        <TouchableOpacity 
          onPress={() => setIndex(1)}
          style={styles.navigateToSearchButton}
        >
          <Text style={styles.navigateToSearchText}>Add them here</Text>
        </TouchableOpacity>
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
  emptyList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '400',
    padding: 20,
  },
  navigateToSearchButton: {
    width: 150,
    height: 50,
    backgroundColor: 'white',
    padding: 5,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateToSearchText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});
