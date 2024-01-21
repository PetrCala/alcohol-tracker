import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ProfileData} from '../../types/database';
import {useFirebase} from '../../context/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import {auth} from '@src/services/firebaseSetup';
import { profile } from 'console';

type ProfileOverviewProps = {
  userId: string;
  profileData: ProfileData;
};

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userId,
  profileData,
}) => {
  const user = auth.currentUser;
  const {db, storage} = useFirebase();

  if (!db || !profileData) return;

  return (
    <View style={styles.profileOverviewContainer}>
      <View style={styles.profileImageContainer} />
      <ProfileImage
        storage={storage}
        userId={userId}
        photoURL={profileData.photo_url}
        style={styles.profileOverviewImage}
      />
      {user?.uid === userId ? (
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => {
            console.log('Edit profile button pressed');
          }}>
          <Image
            style={styles.editProfileButtonImage}
            source={require('../../../assets/icons/camera.png')}
          />
        </TouchableOpacity>
      ) : null}
      <View />
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

{
  /* <PermissionHandler permissionType="write_photos">
  <UploadImageComponent storage={storage} />
</PermissionHandler> */
}

export default ProfileOverview;

const screenWidth = Dimensions.get('window').width;
const mainContainerPadding = 5;
const profileImageSize = 110;

const styles = StyleSheet.create({
  profileOverviewContainer: {
    width: screenWidth,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: mainContainerPadding,
  },
  profileImageContainer: {
    height: profileImageSize,
    width: profileImageSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileOverviewImage: {
    width: profileImageSize,
    height: profileImageSize,
    borderRadius: profileImageSize / 2,
    backgroundColor: 'white',
    top: mainContainerPadding,
    position: 'absolute',
    zIndex: 0, // Ensure that the profile image is below the edit button
  },
  editProfileButton: {
    height: profileImageSize / 3,
    width: profileImageSize / 3,
    position: 'absolute',
    top: mainContainerPadding + profileImageSize / 2 + profileImageSize / 7, // 7 is a magic number
    left: screenWidth / 2 + profileImageSize / 2 - profileImageSize / 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: profileImageSize / 3,
    borderColor: 'black',
    borderWidth: 2,
    zIndex: 1,
  },
  editProfileButtonImage: {
    height: profileImageSize / 6,
    width: profileImageSize / 6,
    tintColor: 'gray',
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
