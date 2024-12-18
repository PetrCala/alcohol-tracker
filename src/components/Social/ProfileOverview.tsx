import type {LayoutChangeEvent} from 'react-native';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useFirebase} from '@src/context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import Navigation from '@libs/Navigation/Navigation';
import UploadImageComponent from '@components/UploadImage';
import useStyleUtils from '@hooks/useStyleUtils';
import ROUTES from '@src/ROUTES';
import {useState} from 'react';
import type ImageLayout from '@src/types/various/ImageLayout';
import type {Profile} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from '@components/Icon';
import variables from '@src/styles/variables';
import useWindowDimensions from '@hooks/useWindowDimensions';

type ProfileOverviewProps = {
  userID: string;
  profileData: Profile;
};

const topOffset = 20; // Profile image offset from main container top

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  userID,
  profileData,
}) => {
  const {auth, storage} = useFirebase();
  const StyleUtils = useStyleUtils();
  const styles = useThemeStyles();
  const user = auth.currentUser;
  const {windowWidth} = useWindowDimensions();
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
    <View
      style={[
        styles.flexColumn,
        styles.alignItemsCenter,
        styles.p1,
        {marginTop: topOffset},
      ]}>
      {user?.uid === userID && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => Navigation.navigate(ROUTES.SETTINGS_ACCOUNT)}
          style={localStyles.editProfileButton}>
          <Icon src={KirokuIcons.Gear} fill={StyleUtils.getIconFillColor()} />
        </TouchableOpacity>
      )}
      <View style={localStyles.profileImageContainer} />
      <ProfileImage
        key={`${userID}-profile-image`}
        storage={storage}
        userID={userID}
        downloadPath={profileData.photo_url}
        style={localStyles.profileOverviewImage}
        enlargable
        layout={layout}
        onLayout={onLayout}
      />
      {user?.uid === userID && (
        <UploadImageComponent
          pathToUpload={`users/${userID}/profile/profile_image.jpg`}
          src={KirokuIcons.Camera}
          isProfilePicture
          containerStyles={styles.editProfileImageContainer(windowWidth)}
        />
      )}
      <View style={[styles.flexRow, styles.mt2, styles.p1]}>
        <Text
          style={[styles.textLarge, styles.textStrong, styles.textAlignCenter]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {profileData.display_name}
        </Text>
      </View>
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  editProfileButton: {
    position: 'absolute',
    top: -topOffset + 8,
    right: 8,
    padding: 8,
    width: 'auto',
    height: 'auto',
  },
  profileImageContainer: {
    height: variables.avatarSizeXLarge,
    width: variables.avatarSizeXLarge,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  profileOverviewImage: {
    width: variables.avatarSizeXLarge,
    height: variables.avatarSizeXLarge,
    borderRadius: variables.avatarSizeXLarge / 2,
    position: 'absolute',
    top: 0, // Makes layout recognize the position
    zIndex: 1, // Ensure that the profile image is below the edit button
  },
});

export default ProfileOverview;
