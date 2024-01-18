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
import ProfileImage from '@components/ProfileImage';

type FriendOverviewProps = {
  friendId: string;
  profileData: ProfileData;
  RightSideComponent: React.ReactNode;
};

const FriendOverview: React.FC<FriendOverviewProps> = ({
  friendId,
  profileData,
  RightSideComponent,
}) => {
  const {db, storage} = useFirebase();

  if (!db || !profileData) return;

  return (
    <View key={friendId + '-container'} style={styles.friendOverviewContainer}>
      <View key={friendId + 'profile'} style={styles.friendOverviewProfile}>
        <ProfileImage
          key={friendId + '-profile-icon'}
          storage={storage}
          userId={friendId}
          photoURL={profileData.photo_url}
          style={styles.friendOverviewImage}
        />
        <View key={friendId + 'info'} style={styles.friendInfoContainer}>
          <Text key={friendId + '-nickname'} style={styles.friendOverviewText}>
            {profileData.display_name}
          </Text>
          <Text key={friendId + '-sessions'} style={styles.friendOverviewText}>
            {/* User details */}
          </Text>
        </View>
      </View>
      {RightSideComponent}
    </View>
  );
};

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
              <FriendOverview
                key={friendId + '-user-overview'}
                friendId={friendId}
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
  },
  friendOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 5,
  },
  friendOverviewProfile: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    paddingTop: 7,
  },
  friendOverviewImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
  friendInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 5
  },
  friendOverviewText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
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
