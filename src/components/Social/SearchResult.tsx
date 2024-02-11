import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {acceptFriendRequest, sendFriendRequest} from '../../database/friends';
import {Database} from 'firebase/database';
import ProfileImage from '@components/ProfileImage';
import {FirebaseStorage} from 'firebase/storage';
import React from 'react';
import {FriendRequestStatus, Profile} from '@src/types/database';

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
  const handleSendRequestPress = async (
    db: Database,
    userFrom: string,
    userTo: string,
  ): Promise<void> => {
    try {
      await sendFriendRequest(db, userFrom, userTo);
    } catch (error: any) {
      Alert.alert(
        'User does not exist in the database',
        'Could not send a friend request: ' + error.message,
      );
      return;
    }
  };

  const handleAcceptFriendRequestPress = async (
    db: Database,
    userFrom: string,
    userTo: string,
  ): Promise<void> => {
    try {
      await acceptFriendRequest(db, userFrom, userTo);
    } catch (error: any) {
      Alert.alert(
        'User does not exist in the database',
        'Could not accept a friend request: ' + error.message,
      );
      return;
    }
  };

  return (
    // Refactor this part using AI later
    <View style={styles.sendFriendRequestContainer}>
      {userFrom === userTo ? (
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.self}</Text>
      ) : alreadyAFriend ? (
        <Text style={styles.sendFriendRequestText}>
          {statusToTextMap.friend}
        </Text>
      ) : requestStatus === 'sent' ? (
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.sent}</Text>
      ) : requestStatus === 'received' ? (
        <TouchableOpacity
          style={styles.sendFriendRequestButton}
          onPress={() => handleAcceptFriendRequestPress(db, userFrom, userTo)}>
          <Text style={styles.sendFriendRequestText}>
            {statusToTextMap.received}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.sendFriendRequestButton}
          onPress={() => handleSendRequestPress(db, userFrom, userTo)}>
          <Text style={styles.sendFriendRequestText}>
            {statusToTextMap.undefined}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

type SearchResultProps = {
  userId: string;
  userDisplayData: Profile;
  db: Database;
  storage: FirebaseStorage;
  userFrom: string;
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
  customButton?: React.ReactNode;
};

const SearchResult: React.FC<SearchResultProps> = ({
  userId,
  userDisplayData,
  db,
  storage,
  userFrom,
  requestStatus,
  alreadyAFriend,
  customButton,
}) => {
  return (
    <View style={styles.userOverviewContainer}>
      <View style={styles.userInfoContainer}>
        <ProfileImage
          key={userId + '-profile-icon'}
          storage={storage}
          userId={userId}
          downloadPath={userDisplayData?.photo_url}
          style={styles.userProfileImage}
        />
        <Text style={styles.userNicknameText}>
          {userDisplayData?.display_name
            ? userDisplayData.display_name
            : 'Unknown'}
        </Text>
      </View>
      {customButton ? (
        customButton
      ) : (
        <SendFriendRequestButton
          db={db}
          userFrom={userFrom}
          userTo={userId}
          requestStatus={requestStatus}
          alreadyAFriend={alreadyAFriend}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  userNicknameText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  userProfileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 5,
  },
  sendFriendRequestContainer: {
    width: 'auto',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  sendFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  sendFriendRequestText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
});

export default SearchResult;
