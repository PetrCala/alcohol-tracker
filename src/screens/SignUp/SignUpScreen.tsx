import React, {useCallback, useRef} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import ScreenWrapper from '@components/ScreenWrapper';
import SignUpScreenLayout from './SignUpScreenLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useLocalize from '@hooks/useLocalize';
import ChangeSignUpScreenLink from './ChangeSignUpScreenLink';
import INPUT_IDS from '@src/types/form/SignUpForm';
import ONYXKEYS from '@src/ONYXKEYS';
import FormProvider from '@components/Form/FormProvider';
import {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {Errors} from '@src/types/onyx/OnyxCommon';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import CONST from '@src/CONST';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Browser from '@libs/Browser';
import {signInWithEmailAndPassword} from 'firebase/auth';
import Text from '@components/Text';
import {PressableWithFeedback} from '@components/Pressable';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {useUserConnection} from '@context/global/UserConnectionContext';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import {useOnyx} from 'react-native-onyx';

type LoginScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function SignUpScreen() {
  const {isOnline} = useUserConnection();
  const {auth} = useFirebase();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const [login] = useOnyx(ONYXKEYS.LOGIN);
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<LoginScreenLayoutRef>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [serverErrorMessage, setServerErrorMessage] = React.useState('');

  const userLoginToDisplay = login?.email ?? '';
  const headerText = translate('login.hero.header');
  const welcomeHeader = shouldUseNarrowLayout
    ? headerText
    : translate('welcomeText.welcome');
  const welcomeText = shouldUseNarrowLayout
    ? `${translate('welcomeText.welcomeWithoutExclamation')} ${translate('welcomeText.welcomeNewAccount', {login: userLoginToDisplay})}`
    : translate('welcomeText.welcomeNewAccount', {login: userLoginToDisplay});

  const navigateFocus = () => {
    currentScreenLayoutRef.current?.scrollPageToTop();
  };

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.SIGN_UP_FORM>,
  ) => {
    if (!isOnline || isLoading) {
      return;
    }
    setIsLoading(true);

    const emailTrim = values.email.trim();

    try {
      await signInWithEmailAndPassword(auth, emailTrim, values.password);
    } catch (error: any) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      setServerErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SIGN_UP_FORM>): Errors => {
      const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SIGN_UP_FORM> = {};

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
      shouldEnableMaxHeight={true}
      shouldUseCachedViewportHeight
      style={[
        styles.signUpScreen,
        StyleUtils.getSignUpSafeAreaPadding(
          safeAreaInsets,
          isInNarrowPaneModal,
        ),
      ]}
      testID={SignUpScreen.displayName}>
      <SignUpScreenLayout
        welcomeHeader={welcomeHeader}
        welcomeText={welcomeText}
        ref={currentScreenLayoutRef}
        navigateFocus={navigateFocus}>
        {!!isLoading ? (
          <FlexibleLoadingIndicator />
        ) : (
          <>
            <FormProvider
              formID={ONYXKEYS.FORMS.SIGN_UP_FORM}
              validate={validate}
              onSubmit={onSubmit}
              shouldValidateOnBlur={false}
              submitButtonText={translate('common.signUp')}
              includeSafeAreaPaddingBottom={false}
              isSubmitButtonVisible={!isLoading}
              shouldUseScrollView={false}
              style={[styles.flexGrow1]}>
              <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.EMAIL}
                name="email"
                label={translate('login.email')}
                aria-label={translate('login.email')}
                defaultValue={login?.email ?? ''}
                spellCheck={false}
              />
              <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.USERNAME}
                name="username"
                label={translate('common.username')}
                aria-label={translate('common.username')}
                defaultValue={''}
                spellCheck={false}
              />
              <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.PASSWORD}
                name="password"
                label={translate('common.password')}
                aria-label={translate('common.password')}
                defaultValue={''}
                spellCheck={false}
                secureTextEntry
                autoComplete={
                  Browser.getBrowser() === CONST.BROWSER.SAFARI
                    ? 'username'
                    : 'off'
                }
              />
              <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.RE_ENTER_PASSWORD}
                name="re-enter-password"
                label={translate('password.reEnter')}
                aria-label={translate('password.reEnter')}
                defaultValue={''}
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
            </FormProvider>
            <ChangeSignUpScreenLink shouldPointToLogIn={true} />
          </>
        )}
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

SignUpScreen.displayName = 'Login Screen';
export default SignUpScreen;
