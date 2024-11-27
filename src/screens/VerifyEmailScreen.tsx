import Button from '@components/Button';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {auth} from '@libs/Firebase/FirebaseApp';
import {AuthScreensParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import * as User from '@database/users';
import SCREENS from '@src/SCREENS';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type VerifyEmailScreenOnyxProps = {};
type VerifyEmailScreenProps = VerifyEmailScreenOnyxProps &
  StackScreenProps<AuthScreensParamList, typeof SCREENS.VERIFY_EMAIL>;

function VerifyEmailScreen({route}: VerifyEmailScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const user = auth.currentUser;

  const onVerifyEmailButtonPress = async () => {
    try {
      setErrorText('');
      setIsLoading(true);
      await User.sendVerifyEmailLink(user);
      setEmailSent(true);
    } catch (error: any) {
      setErrorText(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onDismissVerifyEmail = () => {
    Onyx.set(ONYXKEYS.VERIFY_EMAIL_DISMISSED, new Date().getTime())
      .then(() => {
        Navigation.navigate(ROUTES.HOME);
      })
      .catch(error => {
        setErrorText(error.message);
      });
  };

  // Redirect to home screen if user is verified
  useEffect(() => {
    if (user && user.emailVerified) {
      Navigation.navigate(ROUTES.HOME);
    }
  }, [user]);

  return (
    <ScreenWrapper
      testID={VerifyEmailScreen.displayName}
      style={styles.appContent}>
      <View style={[styles.flex1, styles.ph4]}>
        <View style={[styles.flexGrow1]}>
          <Text>{translate('verifyEmailScreen.youAreNotVerified')}</Text>
          <Text>{translate('verifyEmailScreen.wouldYouLikeToVerify')}</Text>
        </View>
        <View style={styles.pb1}>
          {!!emailSent && !errorText && (
            <DotIndicatorMessage
              style={[styles.mv2]}
              type="success"
              // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/prefer-nullish-coalescing
              messages={{
                0: translate('verifyEmailScreen.emailSent'),
              }}
            />
          )}
          {!!errorText && (
            <DotIndicatorMessage
              style={[styles.mv2]}
              type="error"
              // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/prefer-nullish-coalescing
              messages={{0: errorText || ''}}
            />
          )}
          <Button
            success
            isLoading={isLoading}
            style={styles.mt1}
            text={translate(
              emailSent
                ? 'verifyEmailScreen.resendEmail'
                : 'verifyEmailScreen.verifyEmail',
            )}
            onPress={onVerifyEmailButtonPress}
            large
          />
          <Button
            style={[styles.mt1]}
            text={translate('verifyEmailScreen.changeEmail')}
            onPress={() => {}} // Navigate to change email screen
            large
          />
          <Button
            text={translate('verifyEmailScreen.illDoItLater')}
            style={styles.bgTransparent}
            textStyles={styles.textAppColor}
            onPress={onDismissVerifyEmail}
            large
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

VerifyEmailScreen.displayName = 'VerifyEmailScreen';
export default VerifyEmailScreen;
