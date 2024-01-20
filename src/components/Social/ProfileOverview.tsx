import {StyleSheet, Text, View} from 'react-native';
import {ProfileData} from '../../types/database';
import {useFirebase} from '../../context/FirebaseContext';
import ProfileImage from '@components/ProfileImage';

type ProfileOverviewProps = {
  userId: string;
  profileData: ProfileData;
};

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userId,
  profileData,
}) => {
  const {db, storage} = useFirebase();

  if (!db || !profileData) return;

  return (
    <View style={styles.profileOverviewContainer}>
      <ProfileImage
        storage={storage}
        userId={userId}
        photoURL={profileData.photo_url}
        style={styles.profileOverviewImage}
      />
      <View style={styles.userInfoContainer}>
        <Text
          style={styles.profileNameText}
          numberOfLines={1}
          ellipsizeMode="tail">
          {profileData.display_name}
        </Text>
        {/* More text here */}
      </View>
    </View>
  );
};

export default ProfileOverview;

const styles = StyleSheet.create({
  profileOverviewContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
  },
  profileOverviewImage: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 50,
    backgroundColor: 'white',
  },
  userInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 5,
    textAlign: 'center',
  },
  profileNameText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    flexShrink: 1,
  },
});
