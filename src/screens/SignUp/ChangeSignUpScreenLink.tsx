import React from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES, {Route} from '@src/ROUTES';
import Navigation from '@libs/Navigation/Navigation';

type ChangeSignUpScreenLinkOnyxProps = {};

type ChangeSignUpScreenLinkProps = ChangeSignUpScreenLinkOnyxProps & {
  /** Whether the link button should redirect to the log in screen */
  shouldPointToLogIn?: boolean;

  /** Whether the link button should redirect to the sign up screen */
  shouldPointToSignUp?: boolean;
};

function ChangeSignUpScreenLink({
  shouldPointToLogIn,
  shouldPointToSignUp,
}: ChangeSignUpScreenLinkProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const helperText = shouldPointToLogIn
    ? translate('login.existingAccount')
    : shouldPointToSignUp
      ? translate('login.noAccount')
      : '';
  const buttonText = shouldPointToLogIn
    ? translate('common.logIn')
    : shouldPointToSignUp
      ? translate('common.signUp')
      : '';

  const handleOnPress = () => {
    if (shouldPointToLogIn) {
      Navigation.navigate(ROUTES.LOG_IN);
    } else if (shouldPointToSignUp) {
      Navigation.navigate(ROUTES.SIGN_UP);
    } else {
      Navigation.resetToHome();
    }
  };

  return (
    <View style={styles.changeSignUpScreenLinkContainer}>
      <Text style={styles.mr1}>{helperText}</Text>
      <PressableWithFeedback
        style={[styles.link]}
        onPress={handleOnPress}
        role={CONST.ROLE.LINK}
        accessibilityLabel={buttonText}>
        <Text style={[styles.link]}>{buttonText}</Text>
      </PressableWithFeedback>
    </View>
  );
}

ChangeSignUpScreenLink.displayName = 'ChangeSignUpScreenLink';

export default ChangeSignUpScreenLink;
