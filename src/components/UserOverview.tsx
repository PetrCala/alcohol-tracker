import {auth} from '../services/firebaseSetup';
import {StyleSheet, Text, View} from 'react-native';
import {useFirebase} from '../context/FirebaseContext';
import {ProfileData} from '../types/database';
import ProfileImage from './ProfileImage';

type UserOverviewProps = {
  userId: string; // Other user's ID
  profileData: ProfileData;
  RightSideComponent: React.ReactNode; // Render directly as a ReactNode without JSX syntax
};

const UserOverview: React.FC<UserOverviewProps> = ({
  userId,
  profileData,
  RightSideComponent,
}) => {
  const user = auth.currentUser;
  const {db, storage} = useFirebase();

  if (!db || !user || !profileData) return;

  return (
    <View key={userId + '-container'} style={styles.userOverviewContainer}>
      <View key={userId + 'profile'} style={styles.userOverviewProfile}>
        <ProfileImage
          key={userId + '-profile-icon'}
          storage={storage}
          userId={userId}
          photoURL={profileData.photo_url}
          style={styles.userOverviewImage}
        />
        <Text key={userId + '-nickname'} style={styles.userOverviewText}>
          {profileData.display_name}
        </Text>
      </View>
      {RightSideComponent}
    </View>
  );
};

export default UserOverview;

const styles = StyleSheet.create({
  userOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 5,
  },
  userOverviewProfile: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    paddingTop: 7,
  },
  userOverviewImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
  userOverviewText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
  },
});
