import React from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import Navigation from '@libs/Navigation/Navigation';

type ChangeSignUpScreenLinkProps = {
  /** The route this link navigates to */
  navigatesTo?: Route;

  /** Custom on press functionality */
  onPress?: () => void;
};

function ChangeSignUpScreenLink({
  navigatesTo = ROUTES.LOG_IN,
  onPress,
}: ChangeSignUpScreenLinkProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const handleOnPress = () => {
    if (onPress) {
      onPress();
      return;
    }
    Navigation.navigate(navigatesTo);
  };

  const helperText =
    navigatesTo === ROUTES.LOG_IN
      ? translate('login.existingAccount')
      : translate('login.noAccount');
  const buttonText =
    navigatesTo === ROUTES.LOG_IN
      ? translate('common.logIn')
      : translate('common.signUp');

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
