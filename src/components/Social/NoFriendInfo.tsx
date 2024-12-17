// TODO translate
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {View, Text} from 'react-native';

type NoFriendInfoProps = {
  message?: string;
  buttonText?: string;
};

/** A View that informs the users that they have no friends */
const NoFriendInfo: React.FC<NoFriendInfoProps> = ({message, buttonText}) => {
  const styles = useThemeStyles();
  const defaultMessage = 'You do not have any friends yet';

  return (
    <View style={styles.fullScreenCenteredContent}>
      <Text style={[styles.textNormalThemeText, styles.p4]}>
        {message ?? defaultMessage}
      </Text>
      <Button
        text={buttonText ?? 'Add them here'}
        onPress={() => Navigation.navigate(ROUTES.SOCIAL_FRIEND_SEARCH)}
        style={[styles.buttonSuccess, styles.ph2]}
        success
      />
    </View>
  );
};

export default NoFriendInfo;
