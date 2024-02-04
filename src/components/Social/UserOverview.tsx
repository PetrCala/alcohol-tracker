import {StyleSheet, Text, View} from 'react-native';
import {ProfileData, UserStatusData} from '../../types/database';
import {useFirebase} from '../../context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import {getTimestampAge, isRecent} from '@src/utils/timeUtils';
import SuccessIndicator from '@components/SuccessIndicator';
import commonStyles from '@src/styles/commonStyles';

type UserOverviewProps = {
  userId: string;
  profileData: ProfileData;
  userStatusData: UserStatusData;
};

/**
 * Should always be rendered inside a button
 */
const UserOverview: React.FC<UserOverviewProps> = ({
  userId,
  profileData,
  userStatusData,
}) => {
  const {storage} = useFirebase();
  if (!profileData || !userStatusData) return null;
  const {last_online, latest_session, latest_session_id} = userStatusData;
  const activeNow = isRecent(last_online);
  const lastSeen = getTimestampAge(last_online);

  return (
    <View key={userId + '-container'} style={styles.userOverviewContainer}>
      <View key={userId + '-left-container'} style={styles.leftContainer}>
        <View key={userId + '-profile'} style={styles.userOverviewProfile}>
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
            <Text
              key={userId + '-sessions'}
              style={[styles.userDetailsText, styles.leftContainerText]}>
              some info
            </Text>
          </View>
        </View>
      </View>
      <View key={userId + '-right-container'} style={styles.rightContainer}>
        {activeNow ? (
          <View style={commonStyles.successIndicator} />
        ) : (
          <Text
            key={userId + '-status'}
            style={[styles.userDetailsText, styles.rightContainerText]}>
            {`Last seen:\n${lastSeen}`}
          </Text>
        )}
      </View>
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
  leftContainer: {
    flexDirection: 'column',
    width: '70%',
    height: '100%',
  },
  rightContainer: {
    flexDirection: 'column',
    width: '30%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 5,
    // backgroundColor: 'pink',
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
  userDetailsText: {
    color: 'black',
    fontSize: 12,
  },
  leftContainerText: {
    marginLeft: 20,
    marginTop: 5,
  },
  rightContainerText: {
    margin: 5,
    textAlign: 'right',
  },
});
