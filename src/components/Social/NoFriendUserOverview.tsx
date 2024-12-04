import {StyleSheet, View} from 'react-native';
import type {Profile} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@components/Text';
import {useFirebase} from '@src/context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';

type NoFriendUserOverviewProps = {
  userID: string; // Other user's ID
  profileData: Profile;
  RightSideComponent: React.ReactNode; // Render directly as a ReactNode without JSX syntax
};

const NoFriendUserOverview: React.FC<NoFriendUserOverviewProps> = ({
  userID,
  profileData,
  RightSideComponent,
}) => {
  const {db, storage} = useFirebase();
  const styles = useThemeStyles();

  if (!db || !profileData) {
    return;
  }

  return (
    <View
      key={`${userID}-container`}
      style={localStyles.noFriendUserOverviewContainer}>
      <View
        key={`${userID}profile`}
        style={localStyles.noFriendUserOverviewProfile}>
        <ProfileImage
          key={`${userID}-profile-icon`}
          storage={storage}
          downloadPath={profileData.photo_url}
          userID={userID}
          style={localStyles.noFriendUserOverviewImage}
        />
        <Text
          key={`${userID}-nickname`}
          style={[styles.headerText, styles.ml3, styles.flexShrink1]}
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

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  noFriendUserOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
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
    borderRadius: 35,
  },
});
