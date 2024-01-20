import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FriendsData, ProfileData} from '../../types/database';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import {useState} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import LoadingData from '../../components/LoadingData';
import UserOverview from '@components/Social/UserOverview';


type ScreenProps = {
  friends: FriendsData | undefined;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

const FriendListScreen = (props: ScreenProps) => {
  const {friends, setIndex} = props;
  const {db} = useFirebase();
  const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(false);
  const [displayData, setDisplayData] = useProfileDisplayData({
    data: friends ?? {},
    db: db,
    setLoadingDisplayData: setLoadingDisplayData,
  });

  return (
    <ScrollView style={styles.scrollViewContainer}>
      {loadingDisplayData ? (
        <LoadingData />
      ) : friends ? (
        <View style={styles.friendList}>
          {Object.keys(friends).map(friendId => {
            const profileData = displayData[friendId];
            const friendName = profileData?.display_name;

            return (
              <UserOverview
                key={friendId + '-user-overview'}
                userId={friendId}
                profileData={profileData}
                RightSideComponent={<></>}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyList}>
          <Text style={styles.emptyListText}>
            You do not have any friends yet
          </Text>
          <TouchableOpacity
            onPress={() => setIndex(1)}
            style={styles.navigateToSearchButton}>
            <Text style={styles.navigateToSearchText}>Add them here</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default FriendListScreen;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    // justifyContent: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: screenHeight * 0.8,
  },
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
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
