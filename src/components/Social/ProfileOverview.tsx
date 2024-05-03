import type {LayoutChangeEvent} from 'react-native';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useFirebase} from '../../context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import Navigation from '@libs/Navigation/Navigation';
import UploadImageComponent from '@components/UploadImage';
import ROUTES from '@src/ROUTES';
import {useState} from 'react';
import type ImageLayout from '@src/types/various/ImageLayout';
import type {Profile} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';

type ProfileOverviewProps = {
  userID: string;
  profileData: Profile;
};

const screenWidth = Dimensions.get('window').width;
const profileImageSize = 110;
const topOffset = 20; // Profile image offset from main container top

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userID,
  profileData,
}) => {
  const {auth, storage} = useFirebase();
  const styles = useThemeStyles();
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
    <View style={localStyles.profileOverviewContainer}>
      {user?.uid === userID && (
        <TouchableOpacity
          onPress={() =>
            Navigation.navigate(ROUTES.PROFILE_EDIT.getRoute(userID))
          }
          style={localStyles.editProfileButton}>
          <Image
            source={KirokuIcons.Settings}
            style={localStyles.editProfileIcon}
          />
        </TouchableOpacity>
        // <Button
        //     // success
        //     // medium
        //     onPress={() =>
        //       Navigation.navigate(ROUTES.PROFILE_EDIT.getRoute(userID))
        //     }
        //     text={'some text'}
        //     style={styles.mt3}
        //   />
      )}
      <View style={localStyles.profileImageContainer} />
      <ProfileImage
        key={`${userID}-profile-image`}
        storage={storage}
        userID={userID}
        downloadPath={profileData.photo_url}
        style={localStyles.profileOverviewImage}
        enlargable={true}
        layout={layout}
        onLayout={onLayout}
      />
      {user?.uid === userID ? (
        <View style={localStyles.editProfileIconButton}>
          <UploadImageComponent
            pathToUpload={`users/${userID}/profile/profile_image.jpg`}
            imageSource={KirokuIcons.Camera}
            imageStyle={localStyles.editProfileIconButtonImage}
            isProfilePicture={true}
          />
        </View>
      ) : null}
      <View />
      <View style={localStyles.userInfoContainer}>
        <Text
          style={localStyles.profileNameText}
          numberOfLines={1}
          ellipsizeMode="tail">
          {profileData.display_name}
        </Text>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  profileOverviewContainer: {
    width: screenWidth,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    marginTop: topOffset,
  },
  editProfileButton: {
    position: 'absolute',
    top: -topOffset + 8,
    right: 8,
    padding: 8,
    width: 'auto',
    height: 'auto',
  },
  editProfileIcon: {
    width: 24,
    height: 24,
    tintColor: '#1A3D32',
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
  editProfileIconButton: {
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
  editProfileIconButtonImage: {
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
