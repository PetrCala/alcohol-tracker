import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendIds, FriendsData, UserData } from "../../types/database";
import UserOverview from '../../components/UserOverview';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import { useContext, useEffect, useState } from 'react';
import DatabaseContext from '../../context/DatabaseContext';
import { isNonEmptyObject } from '../../utils/validation';
import LoadingData from '../../components/LoadingData';

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
  const db = useContext(DatabaseContext);
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
          <UserOverview
            key={friendId+'-user-overview'}
            userId={friendId}
            RightSideComponent={<></>}
          />
        ))}
      </View>
      :
      <></>
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
