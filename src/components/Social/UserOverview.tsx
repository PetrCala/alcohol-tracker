import {StyleSheet, Text, View} from 'react-native';
import {ProfileData} from '../../types/database';
import {useFirebase} from '../../context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';

type UserOverviewProps = {
  userId: string;
  profileData: ProfileData;
  RightSideComponent: React.ReactNode;
};

const UserOverview: React.FC<UserOverviewProps> = ({
  userId,
  profileData,
  RightSideComponent,
}) => {
  const {db, storage} = useFirebase();

  if (!db || !profileData) return;

  return (
    <View key={userId + '-container'} style={styles.userOverviewContainer}>
      <View key={userId + 'profile'} style={styles.userOverviewProfile}>
        <ProfileImage
          key={userId + '-profile-icon'}
          storage={storage}
          userId={userId}
          downloadPath={profileData.photo_url}
          style={styles.userOverviewImage}
        />
        <View key={userId + 'info'} style={styles.userInfoContainer}>
          <Text
            key={userId + '-nickname'}
            style={[styles.userOverviewText, {flexShrink: 1}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {profileData.display_name}
          </Text>
          <Text key={userId + '-sessions'} style={styles.userOverviewText}>
            {/* User details */}
          </Text>
        </View>
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
  userInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 5,
  },
  userOverviewText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});
