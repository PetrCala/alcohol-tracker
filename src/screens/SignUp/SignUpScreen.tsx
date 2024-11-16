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
import * as Session from '@userActions/Session';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Browser from '@libs/Browser';
import * as User from '@database/users';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {useUserConnection} from '@context/global/UserConnectionContext';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import {TranslationPaths} from '@src/languages/types';
import {ValueOf} from 'type-fest';
import {View} from 'react-native';
import OrDelimiter from './OrDelimiter';
import {PressableWithFeedback} from '@components/Pressable';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';

type LoginScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function SignUpScreen() {
  const {isOnline} = useUserConnection();
  const {db, auth} = useFirebase();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const [signUpForm] = useOnyx(ONYXKEYS.FORMS.SIGN_UP_FORM_DRAFT);
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<LoginScreenLayoutRef>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [serverErrorMessage, setServerErrorMessage] = React.useState('');

  const headerText = translate('login.hero.header');
  const welcomeHeader = shouldUseNarrowLayout
    ? headerText
    : translate('welcomeText.welcome');
  const welcomeText = shouldUseNarrowLayout
    ? `${translate('welcomeText.welcomeWithoutExclamation')} ${translate('welcomeText.welcomeNewAccount', {login: signUpForm?.email || ''})}`
    : translate('welcomeText.welcomeNewAccount', {
        login: signUpForm?.email || '',
      });

  const navigateFocus = () => {
    currentScreenLayoutRef.current?.scrollPageToTop();
  };

  const onNavigateBack = () => {
    Session.clearSignInData();
    Navigation.resetToHome();
  };

  const onNavigateToLogIn = () => {
    // Stash the email credentials for the login screen
    // TODO
    // Onyx.set(ONYXKEYS.FORMS.LOG_IN_FORM_DRAFT, {
    //   email: signUpForm?.email ?? '',
    // });
    Navigation.navigate(ROUTES.LOG_IN);
  };

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.SIGN_UP_FORM>,
  ) => {
    if (!isOnline || isLoading) {
      return;
    }

    // Check that the user is not authenticated
    if (user) {
      throw new Error(translate('signUpScreen.error.generic'));
    }

    setIsLoading(true);

    const emailTrim = values.email.trim();
    const usernameTrim = values.username.trim();

    try {
      await User.signUp(db, auth, emailTrim, usernameTrim, values.password);
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

      type ErrorDataItem = {
        errorKey: TranslationPaths | null;
        formKey: ValueOf<typeof INPUT_IDS>;
      };

      const errorData: ErrorDataItem[] = [
        {
          errorKey: ValidationUtils.validateEmail(values.email),
          formKey: INPUT_IDS.EMAIL,
        },
        {
          errorKey: ValidationUtils.validateUsername(values.username),
          formKey: INPUT_IDS.USERNAME,
        },
        {
          errorKey: ValidationUtils.validatePassword(values.password),
          formKey: INPUT_IDS.PASSWORD,
        },
        {
          errorKey:
            values.password &&
            values.reEnterPassword &&
            values.password !== values.reEnterPassword
              ? 'password.error.passwordsMustMatch'
              : null,
          formKey: INPUT_IDS.RE_ENTER_PASSWORD,
        },
      ];

      for (const {errorKey, formKey} of errorData) {
        if (errorKey) {
          ErrorUtils.addErrorMessage(errors, formKey, translate(errorKey));
        }
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
        welcomeHeader={''} // use 'welcomeHeader' to show the header
        welcomeText={''}
        ref={currentScreenLayoutRef}
        navigateFocus={navigateFocus}>
        {!!isLoading ? (
          <FlexibleLoadingIndicator
            text={translate('signUpScreen.signingIn')}
          />
        ) : (
          <>
            <FormProvider
              formID={ONYXKEYS.FORMS.SIGN_UP_FORM}
              validate={validate}
              onSubmit={onSubmit}
              shouldValidateOnBlur={false}
              shouldValidateOnChange={true}
              includeSafeAreaPaddingBottom={false}
              submitButtonText={translate('common.signUp')}
              submitButtonStyles={styles.pb5}
              isSubmitButtonVisible={!isLoading}
              shouldUseScrollView={false}
              style={styles.flexGrow1}>
              <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.EMAIL}
                name="email"
                label={translate('login.email')}
                aria-label={translate('login.email')}
                defaultValue={signUpForm?.email ?? ''}
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
            <View>
              {/* Use another sign up method <- a simple link that navigates to the initial screen */}
              <ChangeSignUpScreenLink
                navigatesTo={ROUTES.LOG_IN}
                onPress={onNavigateToLogIn}
              />
              <OrDelimiter />
              <PressableWithFeedback
                style={[styles.link]}
                onPress={onNavigateBack}
                role={CONST.ROLE.LINK}
                accessibilityLabel={translate(
                  'signUpScreen.chooseAnotherMethod',
                )}>
                <Text style={[styles.link, styles.textAlignCenter]}>
                  {translate('signUpScreen.chooseAnotherMethod')}
                </Text>
              </PressableWithFeedback>
            </View>
          </>
        )}
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

SignUpScreen.displayName = 'Login Screen';
export default SignUpScreen;
