import React, {useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useFirebase} from '@context/global/FirebaseContext';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import * as CloseAccount from '@userActions/CloseAccount';
import * as Session from '@userActions/Session';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyleUtils from '@hooks/useStyleUtils';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import INPUT_IDS from '@src/types/form/SignUpForm';
import useLocalize from '@hooks/useLocalize';
import SignUpScreenLayout from './SignUpScreenLayout';
import Onyx, {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {Errors} from '@src/types/onyx/OnyxCommon';
import ChangeSignUpScreenLink from './ChangeSignUpScreenLink';
import DotIndicatorMessage from '@components/DotIndicatorMessage';

type InitialScreenOnyxProps = {};

type InitialScreenProps = InitialScreenOnyxProps;

type InitialScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function InitialScreen({}: InitialScreenProps) {
  const {auth} = useFirebase();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const [signUpForm] = useOnyx(ONYXKEYS.FORMS.SIGN_UP_FORM);
  const [closeAccount] = useOnyx(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM);
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<InitialScreenLayoutRef>(null);

  const headerText = translate('login.hero.header');
  const welcomeHeader = shouldUseNarrowLayout
    ? headerText
    : translate('welcomeText.getStarted');
  const welcomeText = shouldUseNarrowLayout
    ? translate('welcomeText.getStarted')
    : '';

  const onSubmit = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.EMAIL_FORM>,
  ) => {
    Onyx.set(ONYXKEYS.FORMS.SIGN_UP_FORM_DRAFT, {email: values.email.trim()});
    Navigation.navigate(ROUTES.SIGN_UP);
  };

  /**
   * Validate the input value and set the error for formError
   */
  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SIGN_UP_FORM>): Errors => {
      const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SIGN_UP_FORM> = {};
      const loginTrim = values.email.trim();

      if (closeAccount?.success) {
        CloseAccount.setDefaultData();
      }

      const errorKey = ValidationUtils.validateEmail(loginTrim);

      if (errorKey) {
        ErrorUtils.addErrorMessage(
          errors,
          INPUT_IDS.EMAIL,
          translate(errorKey),
        );
      }
      return errors;
    },
    [],
  );

  function getSignInWithStyles() {
    return shouldUseNarrowLayout ? [styles.mt1] : [styles.mt5, styles.mb5];
  }

  // const isSigningWithAppleOrGoogle = useRef(false);
  // const setIsSigningWithAppleOrGoogle = useCallback(
  //   (isPressed: boolean) => (isSigningWithAppleOrGoogle.current = isPressed),
  //   [],
  // );

  useFocusEffect(
    // Redirect to main screen if user is already logged in (from sign up screen only)
    React.useCallback(() => {
      Session.clearSignInData();
      const stopListening = auth.onAuthStateChanged(user => {
        if (user) {
          Navigation.navigate(ROUTES.HOME);
        }
      });

      return () => {
        stopListening(); // This will be called when the screen loses focus
      };
    }, []),
  );

  const navigateFocus = () => {
    currentScreenLayoutRef.current?.scrollPageToTop();
  };

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
      testID={InitialScreen.displayName}>
      <SignUpScreenLayout
        welcomeHeader={welcomeHeader}
        welcomeText={welcomeText}
        ref={currentScreenLayoutRef}
        navigateFocus={navigateFocus}>
        <FormProvider
          formID={ONYXKEYS.FORMS.SIGN_UP_FORM}
          validate={validate}
          onSubmit={onSubmit}
          submitButtonText={translate('common.continue')}
          includeSafeAreaPaddingBottom={false}
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
          {!!closeAccount?.success && (
            <DotIndicatorMessage
              style={[styles.mv2]}
              type="success"
              // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/prefer-nullish-coalescing
              messages={{
                0: closeAccount?.success || '',
              }}
            />
          )}
        </FormProvider>
        <ChangeSignUpScreenLink navigatesTo={ROUTES.LOG_IN} />
        {/* --- OR --- */}
        {/* {
          // This feature has a few behavioral differences in development mode. To prevent confusion
          // for developers about possible regressions, we won't render buttons in development mode.
          // For more information about these differences and how to test in development mode,
          // see`Expensify/App/contributingGuides/APPLE_GOOGLE_SIGNIN.md`
          CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV && (
              <View style={[getSignInWithStyles()]}>
                  <Text
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mb3, styles.mt2]}
                  >
                      {translate('common.signInWith')}
                  </Text>

                  <View style={shouldUseNarrowLayout ? styles.loginButtonRowSmallScreen : styles.loginButtonRow}>
                      <View>
                          <AppleSignIn onPress={() => setIsSigningWithAppleOrGoogle(true)} />
                      </View>
                      <View>
                          <GoogleSignIn onPress={() => setIsSigningWithAppleOrGoogle(true)} />
                      </View>
                  </View>
              </View>
          )
      } */}
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

InitialScreen.displayName = 'Sign Up Screen';
export default InitialScreen;
