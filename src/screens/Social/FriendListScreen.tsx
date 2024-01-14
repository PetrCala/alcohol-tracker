import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FriendIds, FriendsData, UserData} from '../../types/database';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import {useContext, useEffect, useState} from 'react';
import {useFirebase} from '../../context/FirebaseContext';
import {isNonEmptyObject} from '../../utils/validation';
import LoadingData from '../../components/LoadingData';

const FriendOverview: React.FC = ({}) => {
  // TODO
  return <></>;
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
      <Text style={styles.friendText}>There are your friends:</Text>
      {friends ? (
        <View style={styles.friendList}>
          {Object.keys(friends).map(friendId => {
            const profileData = displayData[friendId];
            const friendName = profileData?.display_name;

            if (loadingDisplayData)
              return <LoadingData key={friendId + '-loading'} />;

            return (
              <Text key={friendId} style={styles.friendText}>
                {friendName}
              </Text>
              // <UserOverview
              //   key={friendId+'-user-overview'}
              //   userId={friendId}
              //   RightSideComponent={<></>}
              // />
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
