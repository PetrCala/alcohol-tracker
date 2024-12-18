import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {View} from 'react-native';

type NoFriendInfoProps = {
  message?: string;
  buttonText?: string;
};

function NoFriendInfo({message, buttonText}: NoFriendInfoProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const defaultMessage = translate('socialScreen.noFriendsYet');

  return (
    <View style={styles.fullScreenCenteredContent}>
      <Text style={[styles.textNormalThemeText, styles.p4]}>
        {message ?? defaultMessage}
      </Text>
      <Button
        text={buttonText ?? translate('socialScreen.addThemHere')}
        onPress={() => Navigation.navigate(ROUTES.SOCIAL_FRIEND_SEARCH)}
        style={[styles.buttonSuccess, styles.ph2]}
        success
      />
    </View>
  );
}

export default NoFriendInfo;
