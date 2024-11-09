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
    console.log('Submitting login...');
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
        </FormProvider>
        <ChangeSignUpScreenLink shouldPointToSignUp={true} />
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

LogInScreen.displayName = 'Login Screen';
export default LogInScreen;

// {/* <View style={styles.inputContainer}>
//   <TextInput
//     accessibilityLabel="Text input field"
//     placeholder="Email"
//     placeholderTextColor={'#a8a8a8'}
//     selectionColor={'gray'}
//     keyboardType="email-address"
//     textContentType="emailAddress"
//     value={state.email}
//     onChangeText={text => dispatch({type: 'UPDATE_EMAIL', payload: text})}
//     style={styles.input}
//   />
//   <TextInput
//     accessibilityLabel="Text input field"
//     placeholder="Password"
//     placeholderTextColor={'#a8a8a8'}
//     selectionColor={'gray'}
//     textContentType="password"
//     value={state.password}
//     onChangeText={text =>
//       dispatch({type: 'UPDATE_PASSWORD', payload: text})
//     }
//     secureTextEntry
//     style={styles.input}
//   />
//   <TouchableOpacity
//     accessibilityRole="button"
//     onPress={handleLogin}
//     style={styles.loginButton}>
//     <Text style={styles.loginButtonText}>Login</Text>
//   </TouchableOpacity>
//   <TouchableOpacity
//     accessibilityRole="button"
//     onPress={() =>
//       dispatch({
//         type: 'SET_RESET_PASSWORD_MODAL_VISIBLE',
//         payload: true,
//       })
//     }
//     style={styles.forgottenPasswordButton}>
//     <Text style={styles.forgottenPasswordText}>
//       Forgot your password?
//     </Text>
//   </TouchableOpacity>
//   <View style={[commonStyles.horizontalLine, styles.customLineWidth]} />
//   <View style={styles.signUpContainer}>
//     <TouchableOpacity
//       accessibilityRole="button"
//       style={styles.signUpButtonContainer}
//       onPress={() => Navigation.navigate(ROUTES.SIGN_UP)}>
//       <Text style={styles.signUpInfoText}>Don't have an account?</Text>
//       <Text style={styles.signUpButtonText}>Sign up</Text>
//     </TouchableOpacity>
//   </View>
//   <InputTextPopup
//     visible={state.resetPasswordModalVisible}
//     transparent={true}
//     message={'E-mail to send the reset link to:'}
//     confirmationMessage={'Send link'}
//     placeholder={'E-mail'}
//     onRequestClose={() =>
//       dispatch({
//         type: 'SET_RESET_PASSWORD_MODAL_VISIBLE',
//         payload: false,
//       })
//     }
//     onSubmit={mail => handleResetPassword(mail)}
//     keyboardType="email-address"
//     textContentType="emailAddress"
//     secureTextEntry={false}
//   />
// </View> */}

// const handleLogin = async () => {
//   // Validate all hooks on the screen first, return null if invalid
//   // Attempt to login
//   try {
//     dispatch({type: 'SET_LOADING_USER', payload: true});
//     await signInUserWithEmailAndPassword(auth, state.email, state.password);
//   } catch (error: any) {
//     const errorMessage = ErrorUtils.getErrorMessage(error);
//     dispatch({type: 'SET_WARNING', payload: errorMessage});
//   } finally {
//     dispatch({type: 'SET_LOADING_USER', payload: false});
//   }
//   return;
// };
