import React from 'react';
import {View} from 'react-native';
import CONST from '@src/CONST';
import * as ErrorUtils from '@libs/ErrorUtils';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@components/Text';
import {acceptFriendRequest, sendFriendRequest} from '@src/database/friends';
import type {TranslationPaths} from '@src/languages/types';
import ERRORS from '@src/ERRORS';
import useLocalize from '@hooks/useLocalize';
import type SendFriendRequestButtonProps from './types';

function SendFriendRequestButton({
  db,
  userFrom,
  userTo,
  requestStatus,
  alreadyAFriend,
}: SendFriendRequestButtonProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {translate} = useLocalize();
  const styles = useThemeStyles();

  const handleSendRequestPress = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await sendFriendRequest(db, userFrom, userTo);
      setIsLoading(false);
    } catch (error) {
      ErrorUtils.raiseAppError(ERRORS.USER.FRIEND_REQUEST_SEND_FAILED, error);
    }
  };

  const handleAcceptFriendRequestPress = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await acceptFriendRequest(db, userFrom, userTo);
      setIsLoading(false);
    } catch (error) {
      ErrorUtils.raiseAppError(ERRORS.USER.FRIEND_REQUEST_SEND_FAILED, error);
    }
  };

  const renderText = (translationKey: TranslationPaths) => {
    return (
      <Text numberOfLines={1} style={styles.textNormalThemeText}>
        {translate(translationKey)}
      </Text>
    );
  };

  const renderButton = (
    translationKey: TranslationPaths,
    onPress: () => Promise<void>,
  ) => {
    return (
      <Button
        add
        onPress={() => onPress}
        text={translate(translationKey)}
        isLoading={isLoading}
      />
    );
  };

  const renderContents = () => {
    switch (true) {
      case userFrom === userTo:
        return renderText('searchResult.self');
      case alreadyAFriend:
        return renderText('searchResult.friend');
      case requestStatus === CONST.FRIEND_REQUEST_STATUS.SENT:
        return renderText('searchResult.sent');
      case requestStatus === CONST.FRIEND_REQUEST_STATUS.RECEIVED:
        return renderButton('searchResult.accept', () =>
          handleAcceptFriendRequestPress(),
        );
      default:
        return renderButton('searchResult.add', () => handleSendRequestPress());
    }
  };

  return (
    <View
      style={[
        styles.flexShrink1,
        styles.justifyContentCenter,
        styles.alignItemsCenter,
        styles.h100,
        // max height 100
      ]}>
      {renderContents()}
    </View>
  );
}

export default SendFriendRequestButton;
