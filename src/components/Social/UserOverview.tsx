import {StyleSheet, Text, View} from 'react-native';
import {useFirebase} from '../../context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import {getTimestampAge, isRecent} from '@libs/TimeUtils';
import commonStyles from '@src/styles/commonStyles';
import {sumAllDrinks} from '@libs/DataHandling';
import {Profile, UserStatus} from '@src/types/database';

type UserOverviewProps = {
  userId: string;
  profileData: Profile;
  userStatusData: UserStatus;
};

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
  const inSession = latest_session?.ongoing;
  const sessionLength = latest_session?.end_time
    ? getTimestampAge(latest_session.end_time, false)
    : '';
  const drinksThisSession = latest_session
    ? sumAllDrinks(latest_session?.drinks)
    : null;

  return (
    <View key={userId + '-container'} style={styles.userOverviewContainer}>
      <View key={userId + '-left-container'} style={styles.leftContainer}>
        <View key={userId + '-profile'} style={styles.userOverviewProfile}>
          <View style={styles.imageContainer}>
            <ProfileImage
              key={userId + '-profile-icon'}
              storage={storage}
              userId={userId}
              downloadPath={profileData.photo_url}
              style={styles.userOverviewImage}
            />
          </View>
          <View
            key={userId + 'info'}
            style={
              inSession
                ? styles.userInfoContainer
                : [styles.userInfoContainer, styles.centerUserInfo]
            }>
            <Text
              key={userId + '-nickname'}
              style={[styles.userOverviewText, {flexShrink: 1}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {profileData.display_name}
            </Text>
            {inSession && (
              <>
                <Text
                  key={userId + '-sessions'}
                  style={[styles.userDetailsText, styles.leftContainerText]}>
                  Currently in session{/*// for: {sessionLength}*/}
                </Text>
                <Text
                  key={userId + '-units'}
                  style={[styles.userDetailsText, styles.leftContainerText]}>
                  Drinks so far: {drinksThisSession}{' '}
                  {/* TODO should be units */}
                </Text>
              </>
            )}
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
    height: 80,
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
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 5,
  },
  userOverviewProfile: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  imageContainer: {
    width: '30%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userOverviewImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
  userInfoContainer: {
    height: '100%',
    width: '70%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  centerUserInfo: {
    justifyContent: 'center',
    marginTop: -5, // 5 is the margin of the text
  },
  userOverviewText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
    marginBottom: 3,
    marginTop: 5,
  },
  userDetailsText: {
    color: 'black',
    fontSize: 12,
  },
  leftContainerText: {
    marginLeft: 15,
    margin: 1,
  },
  rightContainerText: {
    margin: 5,
    textAlign: 'right',
    color: '#333',
  },
});
