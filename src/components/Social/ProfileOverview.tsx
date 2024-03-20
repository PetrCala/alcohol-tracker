import {
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useFirebase} from '../../context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';

import UploadImageComponent from '@components/UploadImage';
import CONST from '@src/CONST';
import {useState} from 'react';
import ImageLayout from '@src/types/various/ImageLayout';
import {Profile} from '@src/types/database';

type ProfileOverviewProps = {
  userId: string;
  profileData: Profile;
};

const screenWidth = Dimensions.get('window').width;
const profileImageSize = 110;
const topOffset = 20; // Profile image offset from main container top

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userId,
  profileData,
}) => {
  const {auth, storage} = useFirebase();
  const user = auth.currentUser;
  const [layout, setLayout] = useState<ImageLayout>({
    x: 0,
    y: topOffset,
    width: 0,
    height: 0,
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setLayout({
      x: layout.x,
      y: layout.y + topOffset,
      width: layout.width,
      height: layout.height,
    });
  };

  return (
    <View style={styles.profileOverviewContainer}>
      <View style={styles.profileImageContainer} />
      <ProfileImage
        key={`${userId}-profile-image`}
        storage={storage}
        userId={userId}
        downloadPath={profileData.photo_url}
        style={styles.profileOverviewImage}
        enlargable={true}
        layout={layout}
        onLayout={onLayout}
      />
      {user?.uid === userId ? (
        <View style={styles.editProfileButton}>
          <UploadImageComponent
            pathToUpload={`users/${userId}/profile/profile_image.jpg`}
            imageSource={KirokuIcons.Camera}
            imageStyle={styles.editProfileButtonImage}
            isProfilePicture={true}
          />
        </View>
      ) : null}
      <View />
      <View style={styles.userInfoContainer}>
        <Text
          style={styles.profileNameText}
          numberOfLines={1}
          ellipsizeMode="tail">
          {profileData.display_name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileOverviewContainer: {
    width: screenWidth,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    marginTop: topOffset,
  },
  profileImageContainer: {
    height: profileImageSize,
    width: profileImageSize,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  profileOverviewImage: {
    width: profileImageSize,
    height: profileImageSize,
    borderRadius: profileImageSize / 2,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0, // Makes layout recognize the position
    zIndex: 1, // Ensure that the profile image is below the edit button
  },
  editProfileButton: {
    height: profileImageSize / 3,
    width: profileImageSize / 3,
    position: 'absolute',
    top: profileImageSize / 2 + profileImageSize / 7,
    left: screenWidth / 2 + profileImageSize / 2 - profileImageSize / 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: profileImageSize / 3,
    borderColor: 'black',
    borderWidth: 2,
    zIndex: 2,
  },
  editProfileButtonImage: {
    height: profileImageSize / 6,
    width: profileImageSize / 6,
    tintColor: 'gray',
    zIndex: 3, // Always pressable
  },
  userInfoContainer: {
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 5,
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

export default ProfileOverview;
