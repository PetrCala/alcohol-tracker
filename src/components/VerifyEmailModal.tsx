import Button from '@components/Button';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import * as User from '@userActions/User';
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
import {useFirebase} from '@context/global/FirebaseContext';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import CONST from '@src/CONST';

function VerifyEmailModal() {
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(true);
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

  const onChangeEmailButtonPress = async () => {
    if (!emailSent) {
      setIsVisible(false);
      Navigation.navigate(ROUTES.SETTINGS_EMAIL);
      return;
    }
    if (user) {
      await user.reload();
      setEmailVerified(user.emailVerified);
    } else {
      setErrorText(translate('verifyEmailScreen.error.emailNotVerified'));
    }
  };

  const onDismissVerifyEmail = () => {
    Onyx.set(ONYXKEYS.VERIFY_EMAIL_DISMISSED, new Date().getTime())
      .then(() => {
        setIsVisible(false);
      })
      .catch(error => {
        setErrorText(error.message);
      });
  };

  const onSuccessAnimationEnd = async () => {
    await sleep(1000).then(() => {
      setIsVisible(false);
    });
  };

  // Redirect to home screen if user is verified
  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        await user.reload();
        setEmailVerified(user.emailVerified);
      }
    };
    checkStatus();
  }, [user, auth]);

  return (
    <SafeAreaConsumer>
      {({safeAreaPaddingBottomStyle}) => (
        <Modal
          isVisible={isVisible}
          type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
          onClose={() => {}}
          innerContainerStyle={{
            flex: 1,
            boxShadow: 'none',
          }}>
          <View
            style={[
              styles.mh4,
              styles.pb1,
              styles.flex1,
              safeAreaPaddingBottomStyle,
            ]}>
            {!emailVerified ? (
              <>
                <View
                  style={[
                    styles.flexGrow1,
                    styles.justifyContentCenter,
                    styles.alignItemsCenter,
                  ]}>
                  <Icon src={KirokuIcons.Mail} fill={theme.appColor} large />
                  <Text
                    textAlign="center"
                    style={[styles.textHeadlineH2, styles.mt3]}>
                    {translate(
                      emailSent
                        ? 'verifyEmailScreen.oneMoreStep'
                        : 'verifyEmailScreen.youAreNotVerified',
                    )}
                  </Text>
                  <Text textAlign="center" style={styles.mt3}>
                    {emailSent
                      ? translate('verifyEmailScreen.checkYourInbox')
                      : translate(
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
        </Modal>
      )}
    </SafeAreaConsumer>
  );
}

VerifyEmailModal.displayName = 'VerifyEmailModal';
export default VerifyEmailModal;
