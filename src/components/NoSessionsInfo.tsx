import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useStyleUtils from '@hooks/useStyleUtils';
import {View, Text} from 'react-native';
import variables from '@src/styles/variables';
import useLocalize from '@hooks/useLocalize';

type NoSessionsInfoProps = {
  message?: string;
  buttonText?: string;
};

/** A View that informs the users that they have no friends */
const NoSessionsInfo: React.FC<NoSessionsInfoProps> = ({
  message,
  buttonText,
}) => {
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {translate} = useLocalize();
  const defaultMessage =
    'Start a new session by clicking the plus button at the bottom of your screen';

  return (
    <View
      style={[styles.fullScreenCenteredContent, styles.mnh100, styles.pb40]}>
      <Text
        style={[
          styles.loginHeroHeader,
          StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroXSmall),
        ]}>
        {translate('homeScreen.welcomeToKiroku')}
      </Text>
      <Text style={styles.textHomeScreenNoSessions}>
        {message ?? defaultMessage}
      </Text>
    </View>
  );
};

export default NoSessionsInfo;
