import {StyleSheet, View} from 'react-native';
import ProfileImage from '@components/ProfileImage';
import {getTimestampAge} from '@libs/TimeUtils';
import commonStyles from '@src/styles/commonStyles';
import type {Profile, UserStatus} from '@src/types/onyx';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import DrinkData from '@libs/DrinkData';
import _, {get} from 'lodash';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {Timezone} from '@src/types/onyx/UserData';
import Text from '@components/Text';
import Icon from '@components/Icon';
import {useFirebase} from '@src/context/global/FirebaseContext';

type UserOverviewProps = {
  userID: string;
  profileData: Profile;
  userStatusData: UserStatus;
  timezone?: Timezone;
};

const UserOverview: React.FC<UserOverviewProps> = ({
  userID,
  profileData,
  userStatusData,
  timezone,
}) => {
  const {storage} = useFirebase();
  const styles = useThemeStyles();
  const {last_online, latest_session, latest_session_id} = userStatusData;
  // const activeNow = isRecent(last_online);
  const inSession = latest_session?.ongoing;
  const lastSessionEndTime = get(latest_session, 'end_time', null);
  const sessionEndTimeVerbose = getTimestampAge(
    lastSessionEndTime,
    false,
    true,
  );
  const shouldDisplaySessionInfo =
    inSession && !DSUtils.sessionIsExpired(latest_session);
  // const sessionLength = calculateSessionLength(latest_session, true);
  const sessionStartTime = latest_session?.start_time
    ? DateUtils.getLocalizedTime(latest_session.start_time, timezone?.selected)
    : null; // Show the time in the current user's timezone
  const mostCommonDrink =
    DSUtils.determineSessionMostCommonDrink(latest_session);
  const mostCommonDrinkIcon = DrinkData.find(
    drink => drink.key === mostCommonDrink,
  )?.icon;

  return (
    <View key={`${userID}-container`} style={styles.userOverviewContainer}>
      <View
        key={`${userID}-left-container`}
        style={styles.userOverviewLeftContent}>
        <ProfileImage
          key={`${userID}-profile-icon`}
          storage={storage}
          userID={userID}
          downloadPath={profileData.photo_url}
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
      <View
        key={`${userID}-right-container`}
        style={[styles.flexRow, styles.alignItemsCenter]}>
        {/* ? `In session:\n${drinksThisSession} ${mostCommonDrink}` */}
        {inSession && shouldDisplaySessionInfo ? (
          <>
            <View style={commonStyles.flexRow}>
              <Text
                key={`${userID}-status-info`}
                style={[styles.textLabelSupporting, styles.textAlignCenter]}>
                {`In session${mostCommonDrinkIcon ? ':' : ''}`}
              </Text>
              {mostCommonDrinkIcon && <Icon small src={mostCommonDrinkIcon} />}
            </View>
            <Text
              key={`${userID}-status-time`}
              style={[styles.textLabel, styles.textAlignCenter]}>
              {`From: ${sessionStartTime}`}
            </Text>
          </>
        ) : (
          <Text
            key={`${userID}-status`}
            style={[styles.textLabelSupporting, styles.textAlignCenter]}>
            {!_.isEmpty(sessionEndTimeVerbose)
              ? `${sessionEndTimeVerbose}\nsober`
              : inSession
                ? `Session started:\n${sessionStartTime}`
                : 'No sessions yet'}
          </Text>
        )}
      </View>
    </View>
  );
};

export default UserOverview;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  userDetailsText: {
    color: 'black',
    fontSize: 12,
  },
  rightContainerText: {
    textAlign: 'center',
    color: '#333',
  },
});
