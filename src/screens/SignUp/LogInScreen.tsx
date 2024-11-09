import React, {useCallback, useReducer, useRef} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useTheme from '@hooks/useTheme';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import SignUpScreenLayout from './SignUpScreenLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useLocalize from '@hooks/useLocalize';
import ChangeSignUpScreenLink from './ChangeSignUpScreenLink';
import INPUT_IDS from '@src/types/form/LogInForm';
import ONYXKEYS from '@src/ONYXKEYS';
import FormProvider from '@components/Form/FormProvider';
import {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {Errors} from '@src/types/onyx/OnyxCommon';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Browser from '@libs/Browser';
import {signInWithEmailAndPassword} from 'firebase/auth';
import Text from '@components/Text';
import {PressableWithFeedback} from '@components/Pressable';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type LoginScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function LogInScreen() {
  // const {isOnline} = useUserConnection();
  const {auth} = useFirebase();
  const theme = useTheme();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<LoginScreenLayoutRef>(null);
  const [login] = useOnyx(ONYXKEYS.LOGIN);

  const headerText = translate('login.hero.header');
  const welcomeHeader = shouldUseNarrowLayout
    ? headerText
    : translate('welcomeText.welcome');
  const welcomeText = `${translate('welcomeText.welcome')} ${translate('welcomeText.enterCredentials')}`;

  const navigateFocus = () => {
    currentScreenLayoutRef.current?.scrollPageToTop();
  };

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.LOG_IN_FORM>,
  ) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error: any) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      console.log(errorMessage);
    }
    return;
  };

  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.LOG_IN_FORM>): Errors => {
      const errors: FormInputErrors<typeof ONYXKEYS.FORMS.LOG_IN_FORM> = {};

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
          translate('passwordForm.pleaseFillPassword'),
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
      testID={LogInScreen.displayName}>
      <SignUpScreenLayout
        welcomeHeader={welcomeHeader}
        welcomeText={welcomeText}
        ref={currentScreenLayoutRef}
        navigateFocus={navigateFocus}>
        <FormProvider
          formID={ONYXKEYS.FORMS.LOG_IN_FORM}
          validate={validate}
          onSubmit={onSubmit}
          shouldValidateOnChange={false}
          shouldValidateOnBlur={false}
          submitButtonText={translate('common.logIn')}
          includeSafeAreaPaddingBottom={false}
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
            inputID={INPUT_IDS.PASSWORD}
            name="password"
            label={translate('common.password')}
            aria-label={translate('common.password')}
            defaultValue={login?.password ?? ''}
            spellCheck={false}
            secureTextEntry
            autoComplete={
              Browser.getBrowser() === CONST.BROWSER.SAFARI ? 'username' : 'off'
            }
          />
          <PressableWithFeedback
            style={[styles.link, styles.mt3]}
            onPress={() => Navigation.navigate(ROUTES.FORGOT_PASSWORD)}
            role={CONST.ROLE.LINK}
            accessibilityLabel={translate('passwordForm.forgot')}>
            <Text style={styles.link}>{translate('passwordForm.forgot')}</Text>
          </PressableWithFeedback>
        </FormProvider>
        <ChangeSignUpScreenLink shouldPointToSignUp={true} />
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

LogInScreen.displayName = 'Login Screen';
export default LogInScreen;
