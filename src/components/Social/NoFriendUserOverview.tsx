import {auth} from '../../services/firebaseSetup';
import {StyleSheet, Text, View} from 'react-native';
import {useFirebase} from '../../context/FirebaseContext';
import {ProfileData} from '../../types/database';
import ProfileImage from '../ProfileImage';

type NoFriendUserOverviewProps = {
  userId: string; // Other user's ID
  profileData: ProfileData;
  RightSideComponent: React.ReactNode; // Render directly as a ReactNode without JSX syntax
};

const NoFriendUserOverview: React.FC<NoFriendUserOverviewProps> = ({
  userId,
  profileData,
  RightSideComponent,
}) => {
  const {db, storage} = useFirebase();

  if (!db || !profileData) return;

  return (
    <View key={userId + '-container'} style={styles.noFriendUserOverviewContainer}>
      <View key={userId + 'profile'} style={styles.noFriendUserOverviewProfile}>
        <ProfileImage
          key={userId + '-profile-icon'}
          storage={storage}
          userId={userId}
          photoURL={profileData.photo_url}
          style={styles.noFriendUserOverviewImage}
        />
        <Text key={userId + '-nickname'} style={styles.noFriendUserOverviewText}>
          {profileData.display_name}
        </Text>
      </View>
      {RightSideComponent}
    </View>
  );
};

export default NoFriendUserOverview;

const styles = StyleSheet.create({
  noFriendUserOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 5,
  },
  noFriendUserOverviewProfile: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    paddingTop: 7,
  },
  noFriendUserOverviewImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
  noFriendUserOverviewText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
  },
});
