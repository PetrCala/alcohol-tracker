import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FriendsData} from '../../types/database';
import LoadingData from '../../components/LoadingData';
import UserOverview from '@components/Social/UserOverview';
import useProfileDisplayData from '@hooks/userProfileDisplayData';

type ScreenProps = {
  navigation: any;
  friends: FriendsData | undefined;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

const FriendListScreen = (props: ScreenProps) => {
  const {navigation, friends, setIndex} = props;
  const {loadingDisplayData, displayData} = useProfileDisplayData(friends);

  if (!navigation) return null;

  return (
    <ScrollView style={styles.scrollViewContainer}>
      {loadingDisplayData ? (
        <LoadingData style={styles.loadingContainer} />
      ) : friends ? (
        <View style={styles.friendList}>
          {Object.keys(friends).map(friendId => {
            const profileData = displayData[friendId];

            return (
              <TouchableOpacity
                key={friendId + '-button'}
                style={styles.friendOverviewButton}
                onPress={() =>
                  navigation.navigate('Profile Screen', {
                    userId: friendId,
                    profileData: profileData,
                    friends: null, // Fetch on render
                    currentUserFriends: friends,
                    drinkingSessionData: null, // Fetch on render
                    preferences: null, // Fetch on render
                  })
                }>
                <UserOverview
                  key={friendId + '-user-overview'}
                  userId={friendId}
                  profileData={profileData}
                  RightSideComponent={<></>}
                />
              </TouchableOpacity>
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
    paddingTop: 5,
  },
  friendOverviewButton: {
    width: '100%',
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
