import Button from '@components/Button';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {auth} from '@libs/Firebase/FirebaseApp';
import {AuthScreensParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
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
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import SuccessAnimation from '@components/SuccessAnimation';
import {sleep} from '@libs/TimeUtils';

type VerifyEmailScreenOnyxProps = {};
type VerifyEmailScreenProps = VerifyEmailScreenOnyxProps &
  StackScreenProps<AuthScreensParamList, typeof SCREENS.VERIFY_EMAIL>;

function VerifyEmailScreen({route}: VerifyEmailScreenProps) {
  const user = auth.currentUser;
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const theme = useTheme();
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

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

  const onChangeEmailButtonPress = () => {
    if (!emailSent) {
      Navigation.navigate(ROUTES.SETTINGS_EMAIL);
      return;
    }
    if (user && user?.emailVerified) {
      setEmailVerified(true);
    } else {
      setErrorText(translate('verifyEmailScreen.error.emailNotVerified'));
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

  const onSuccessAnimationEnd = async () => {
    await sleep(1000).then(() => {
      Navigation.navigate(ROUTES.HOME);
    });
  };

  // Redirect to home screen if user is verified
  useEffect(() => {
    if (user && user.emailVerified) {
      setEmailVerified(true);
    }
  }, [user]);

  return (
    <ScreenWrapper
      testID={VerifyEmailScreen.displayName}
      style={styles.appContent}>
      <View style={[styles.flex1, styles.ph4]}>
        {!emailVerified ? (
          <>
            <View
              style={[
                styles.flexGrow1,
                styles.justifyContentCenter,
                styles.alignItemsCenter,
                styles.mh4,
              ]}>
              <Icon src={KirokuIcons.Mail} fill={theme.appColor} large />
              <Text
                textAlign="center"
                style={[styles.textHeadlineH2, styles.mt3]}>
                {translate('verifyEmailScreen.youAreNotVerified')}
              </Text>
              <Text textAlign="center" style={styles.mt3}>
                {translate(
                  'verifyEmailScreen.wouldYouLikeToVerify',
                  user?.email ?? '',
                )}
              </Text>
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
                text={translate(
                  emailSent
                    ? 'verifyEmailScreen.iHaveVerified'
                    : 'verifyEmailScreen.changeEmail',
                )}
                onPress={onChangeEmailButtonPress}
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
          </>
        ) : (
          <SuccessAnimation
            iconSource={KirokuIcons.Checkmark}
            text={translate('verifyEmailScreen.emailVerified')}
            visible={true}
            onAnimationEnd={onSuccessAnimationEnd}
            style={styles.flexGrow1}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

VerifyEmailScreen.displayName = 'VerifyEmailScreen';
export default VerifyEmailScreen;
