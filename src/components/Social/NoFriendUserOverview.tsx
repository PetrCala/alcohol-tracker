import {auth} from '../../services/firebaseSetup';
import {StyleSheet, Text, View} from 'react-native';
import {useFirebase} from '../../context/global/FirebaseContext';
import ProfileImage from '../ProfileImage';
import {Profile} from '@src/types/database';

type NoFriendUserOverviewProps = {
  userId: string; // Other user's ID
  profileData: Profile;
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
    <View
      key={userId + '-container'}
      style={styles.noFriendUserOverviewContainer}>
      <View key={userId + 'profile'} style={styles.noFriendUserOverviewProfile}>
        <ProfileImage
          key={userId + '-profile-icon'}
          storage={storage}
          downloadPath={profileData.photo_url}
          userId={userId}
          style={styles.noFriendUserOverviewImage}
        />
        <Text
          key={userId + '-nickname'}
          style={styles.noFriendUserOverviewText}
          numberOfLines={1}
          ellipsizeMode="tail">
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
    width: '55%',
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
    fontWeight: '500',
    marginLeft: 10,
    flexShrink: 1,
  },
});
