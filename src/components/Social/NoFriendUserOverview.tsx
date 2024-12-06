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
    <View key={`${userID}-container`} style={styles.userOverviewContainer}>
      <View key={`${userID}profile`} style={styles.userOverviewLeftContent}>
        <ProfileImage
          key={`${userID}-profile-icon`}
          storage={storage}
          downloadPath={profileData.photo_url}
          userID={userID}
          style={styles.avatarLarge}
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
