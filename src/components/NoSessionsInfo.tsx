import useThemeStyles from '@hooks/useThemeStyles';
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
        {message ?? translate('homeScreen.startNewSessionByClickingPlus')}
      </Text>
    </View>
  );
};

export default NoSessionsInfo;
