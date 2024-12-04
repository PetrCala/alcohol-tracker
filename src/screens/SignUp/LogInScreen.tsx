import React, {useCallback, useRef} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useLocalize from '@hooks/useLocalize';
import INPUT_IDS from '@src/types/form/LogInForm';
import ONYXKEYS from '@src/ONYXKEYS';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import CONST from '@src/CONST';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Browser from '@libs/Browser';
import * as User from '@userActions/User';
import Text from '@components/Text';
import {PressableWithFeedback} from '@components/Pressable';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {useUserConnection} from '@context/global/UserConnectionContext';
import Onyx, {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ChangeSignUpScreenLink from './ChangeSignUpScreenLink';
import SignUpScreenLayout from './SignUpScreenLayout';

type LoginScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function LogInScreen() {
  const {isOnline} = useUserConnection();
  const {auth} = useFirebase();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<LoginScreenLayoutRef>(null);
  const [logInForm] = useOnyx(ONYXKEYS.FORMS.LOG_IN_FORM_DRAFT);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [serverErrorMessage, setServerErrorMessage] = React.useState('');

  const headerText = translate('login.hero.header');
  const welcomeHeader = shouldUseNarrowLayout
    ? headerText
    : translate('welcomeText.welcome');
  const welcomeText = `${translate('welcomeText.welcome')} ${translate('welcomeText.enterCredentials')}`;

  const navigateFocus = () => {
    currentScreenLayoutRef.current?.scrollPageToTop();
  };

  const onNavigateToSignUp = () => {
    // Stash the email credentials for the sign up screen
    Onyx.set(ONYXKEYS.FORMS.SIGN_UP_FORM_DRAFT, {
      email: logInForm?.email ?? '',
    });
    Navigation.navigate(ROUTES.SIGN_UP);
  };

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.LOG_IN_FORM>,
  ) => {
    if (!isOnline || isLoading) {
      return;
    }
    setIsLoading(true);

    const emailTrim = values.email.trim();

    try {
      await User.logIn(auth, emailTrim, values.password);
    } catch (error: any) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      setServerErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.LOG_IN_FORM>): Errors => {
      const errors: FormInputErrors<typeof ONYXKEYS.FORMS.LOG_IN_FORM> = {};

      // Hide the server error message each time the form is validated
      setServerErrorMessage('');

      if (!values.email) {
        ErrorUtils.addErrorMessage(
          errors,
          INPUT_IDS.EMAIL,
          translate('emailForm.error.pleaseEnterEmail'),
        );
      } else if (!ValidationUtils.isValidEmail(values.email)) {
        ErrorUtils.addErrorMessage(
          errors,
          INPUT_IDS.EMAIL,
          translate('emailForm.error.invalidEmail'),
        );
      }

      if (!values.password) {
        ErrorUtils.addErrorMessage(
          errors,
          INPUT_IDS.PASSWORD,
          translate('password.pleaseFillPassword'),
        );
      }

      return errors;
    },
    [translate],
  );

  return (
    <ScreenWrapper
      shouldShowOfflineIndicator={false}
      shouldEnableMaxHeight
      shouldUseCachedViewportHeight
      style={[
        styles.signUpScreen,
        StyleUtils.getSignUpSafeAreaPadding(
          safeAreaInsets,
          isInNarrowPaneModal,
        ),
      ]}
      testID={LogInScreen.displayName}>
      {isLoading ? (
        <FullScreenLoadingIndicator
          loadingText={translate('logInScreen.loggingIn')}
        />
      ) : (
        <SignUpScreenLayout
          welcomeHeader="" // use welcomeHeader to show the header
          welcomeText={welcomeText}
          ref={currentScreenLayoutRef}
          navigateFocus={navigateFocus}>
          <FormProvider
            formID={ONYXKEYS.FORMS.LOG_IN_FORM}
            validate={validate}
            onSubmit={onSubmit}
            shouldValidateOnBlur={false}
            submitButtonText={translate('common.logIn')}
            submitButtonStyles={styles.pb5}
            includeSafeAreaPaddingBottom={false}
            isSubmitButtonVisible={!isLoading}
            shouldUseScrollView={false}
            style={styles.flexGrow1}>
            <InputWrapper
              InputComponent={TextInput}
              inputID={INPUT_IDS.EMAIL}
              name="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              label={translate('login.email')}
              aria-label={translate('login.email')}
              defaultValue={logInForm?.email ?? ''}
              spellCheck={false}
            />
            <InputWrapper
              InputComponent={TextInput}
              inputID={INPUT_IDS.PASSWORD}
              name="password"
              label={translate('common.password')}
              aria-label={translate('common.password')}
              defaultValue=""
              spellCheck={false}
              secureTextEntry
              autoComplete={
                Browser.getBrowser() === CONST.BROWSER.SAFARI
                  ? 'username'
                  : 'off'
              }
            />
            {!!serverErrorMessage && (
              <DotIndicatorMessage
                style={[styles.mv2]}
                type="error"
                // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/prefer-nullish-coalescing
                messages={{0: serverErrorMessage || ''}}
              />
            )}
            <PressableWithFeedback
              style={[styles.link, styles.mt4]}
              onPress={() => Navigation.navigate(ROUTES.FORGOT_PASSWORD)}
              role={CONST.ROLE.LINK}
              accessibilityLabel={translate('password.forgot')}>
              <Text style={styles.link}>{translate('password.forgot')}</Text>
            </PressableWithFeedback>
          </FormProvider>
          <ChangeSignUpScreenLink
            navigatesTo={ROUTES.SIGN_UP}
            onPress={onNavigateToSignUp}
          />
        </SignUpScreenLayout>
      )}
    </ScreenWrapper>
  );
}

LogInScreen.displayName = 'Login Screen';
export default LogInScreen;
