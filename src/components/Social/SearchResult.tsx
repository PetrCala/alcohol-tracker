import {Alert, StyleSheet, View} from 'react-native';
import type {Database} from 'firebase/database';
import ProfileImage from '@components/ProfileImage';
import type {FirebaseStorage} from 'firebase/storage';
import React from 'react';
import type {FriendRequestStatus, Profile} from '@src/types/onyx';
import CONST from '@src/CONST';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@components/Text';
import {acceptFriendRequest, sendFriendRequest} from '@src/database/friends';

const statusToTextMap: {[key in FriendRequestStatus]: string} = {
  self: 'You',
  friend: 'Already a friend',
  sent: 'Awaiting a response',
  received: 'Accept friend request',
  undefined: 'Send a request',
};

type SendFriendRequestButtonProps = {
  db: Database;
  userFrom: string;
  userTo: string;
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
};

const SendFriendRequestButton: React.FC<SendFriendRequestButtonProps> = ({
  db,
  userFrom,
  userTo,
  requestStatus,
  alreadyAFriend,
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const styles = useThemeStyles();

  const handleSendRequestPress = async (
    db: Database,
    userFrom: string,
    userTo: string,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await sendFriendRequest(db, userFrom, userTo);
      setIsLoading(false);
    } catch (error: unknown) {
      Alert.alert(
        'User does not exist in the database',
        `Could not send a friend request: ${error.message}`,
      );
    }
  };

  const handleAcceptFriendRequestPress = async (
    db: Database,
    userFrom: string,
    userTo: string,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await acceptFriendRequest(db, userFrom, userTo);
      setIsLoading(false);
    } catch (error: unknown) {
      Alert.alert(
        'User does not exist in the database',
        `Could not accept a friend request: ${error.message}`,
      );
    }
  };

  return (
    // Refactor this part using AI later
    <View style={localStyles.sendFriendRequestContainer}>
      {userFrom === userTo ? (
        <Text numberOfLines={1} style={styles.textNormalThemeText}>
          {statusToTextMap.self}
        </Text>
      ) : alreadyAFriend ? (
        <Text numberOfLines={1} style={styles.textNormalThemeText}>
          {statusToTextMap.friend}
        </Text>
      ) : requestStatus === CONST.FRIEND_REQUEST_STATUS.SENT ? (
        <Text numberOfLines={1} style={styles.textNormalThemeText}>
          {statusToTextMap.sent}
        </Text>
      ) : requestStatus === CONST.FRIEND_REQUEST_STATUS.RECEIVED ? (
        <Button
          add
          onPress={() => {
            handleAcceptFriendRequestPress(db, userFrom, userTo, setIsLoading);
          }}
          text={statusToTextMap.received}
          isLoading={isLoading}
        />
      ) : (
        <Button
          add
          onPress={() => {
            handleSendRequestPress(db, userFrom, userTo, setIsLoading);
          }}
          text={statusToTextMap.undefined}
          isLoading={isLoading}
        />
      )}
    </View>
  );
};

type SearchResultProps = {
  userID: string;
  userDisplayData: Profile;
  db: Database;
  storage: FirebaseStorage;
  userFrom: string;
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
  customButton?: React.ReactNode;
};

const SearchResult: React.FC<SearchResultProps> = ({
  userID,
  userDisplayData,
  db,
  storage,
  userFrom,
  requestStatus,
  alreadyAFriend,
  customButton,
}) => {
  const styles = useThemeStyles();
  return (
    <View style={localStyles.userOverviewContainer}>
      <View style={localStyles.userInfoContainer}>
        <ProfileImage
          key={`${userID}-profile-icon`}
          storage={storage}
          userID={userID}
          downloadPath={userDisplayData?.photo_url}
          style={localStyles.userProfileImage}
        />
        <Text style={[styles.headerText, styles.ml3]}>
          {userDisplayData?.display_name
            ? userDisplayData.display_name
            : 'Unknown'}
        </Text>
      </View>
      {customButton || (
        <SendFriendRequestButton
          db={db}
          userFrom={userFrom}
          userTo={userID}
          requestStatus={requestStatus}
          alreadyAFriend={alreadyAFriend}
        />
      )}
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  userOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    paddingRight: 12,
  },
  userInfoContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
  },
  userProfileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  sendFriendRequestContainer: {
    flexShrink: 1,
    height: '100%',
    maxHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchResult;
