import React, {useReducer, useRef} from 'react';
import {Alert, Keyboard} from 'react-native';
import {getAuth, updateProfile} from 'firebase/auth';
import {signUpUserWithEmailAndPassword} from '@libs/auth/auth';
import {useFirebase} from '@context/global/FirebaseContext';
import {readDataOnce} from '@database/baseFunctions';
import {useUserConnection} from '@context/global/UserConnectionContext';
import type {ValidationResult} from '@libs/Validation';
import {
  isValidPassword,
  isValidPasswordConfirm,
  validateAppVersion,
  validateSignInInput,
} from '@libs/Validation';
import {deleteUserData, pushNewUserInfo} from '@database/users';
import variables from '@styles/variables';
import type {Profile} from '@src/types/onyx';
import DBPATHS from '@database/DBPATHS';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Account, Credentials, Locale} from '@src/types/onyx';
import {checkAccountCreationLimit} from '@database/protection';
import * as Session from '@userActions/Session';
import useThemeStyles from '@hooks/useThemeStyles';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyleUtils from '@hooks/useStyleUtils';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {InputHandle} from '@libs/InitialForm/types';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import CustomStatusBarAndBackground from '@components/CustomStatusBarAndBackground';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useLocalize from '@hooks/useLocalize';
import InitialForm from '@libs/InitialForm';
import SignUpScreenLayout from '@libs/SignUpScreenLayout';
import WelcomeForm from '@libs/SignUp/WelcomeForm';
import SignUpForm from '@libs/SignUp/SignUpForm';
import {useFocusEffect} from '@react-navigation/native';

type SignUpScreenInnerOnyxProps = {
  /** The details about the account that the user is signing in with */
  account: OnyxEntry<Account>;

  /** The credentials of the person signing in */
  credentials: OnyxEntry<Credentials>;

  /** The user's preferred locale */
  preferredLocale: OnyxEntry<Locale>;
};

type SignUpScreenInnerProps = SignUpScreenInnerOnyxProps & {
  shouldEnableMaxHeight?: boolean;
};

type SignUpScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

type RenderOption = {
  shouldShowInitialForm: boolean;
  shouldShowLoginForm: boolean;
  shouldShowSignUpForm: boolean;
  shouldShowWelcomeHeader: boolean;
  shouldShowWelcomeText: boolean;
};

type GetRenderOptionsParams = {
  hasLogin: boolean;
  loginFormHidden: boolean;
};

/**
 * @param hasLogin
 * @param hasSignUp
 * @param account
 */
function getRenderOptions({
  hasLogin,
  loginFormHidden,
}: GetRenderOptionsParams): RenderOption {
  const shouldShowLoginForm = !loginFormHidden;
  const shouldShowSignUpForm = !shouldShowLoginForm && hasLogin;
  const shouldShowInitialForm =
    !hasLogin && !shouldShowLoginForm && !shouldShowSignUpForm;
  const shouldShowWelcomeHeader =
    shouldShowInitialForm || shouldShowLoginForm || shouldShowSignUpForm;
  const shouldShowWelcomeText =
    shouldShowInitialForm || shouldShowLoginForm || shouldShowSignUpForm;

  return {
    shouldShowInitialForm,
    shouldShowSignUpForm,
    shouldShowWelcomeHeader,
    shouldShowWelcomeText,
    shouldShowLoginForm,
  };
}

function SignUpScreen({
  credentials,
  account,
  preferredLocale,
  shouldEnableMaxHeight = true,
}: SignUpScreenInnerProps) {
  const {auth, db} = useFirebase();
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const signUpScreenLayoutRef = useRef<SignUpScreenLayoutRef>(null);
  const loginFormRef = useRef<InputHandle>(null);
  const [loginFormHidden, setLoginFormHidden] = React.useState<boolean>(true);
  const [login, setLogin] = React.useState('');
  // const theme = useTheme();

  useFocusEffect(
    // Redirect to main screen if user is already logged in (from sign up screen only)
    React.useCallback(() => {
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

  async function rollbackChanges(
    newUserID: string,
    userNickname: string,
  ): Promise<void> {
    // Delete the user data from the Realtime Database
    await deleteUserData(db, newUserID, userNickname, undefined, undefined);

    // Delete the user from Firebase authentication
    const auth = getAuth();
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
  }

  const {
    shouldShowInitialForm,
    shouldShowSignUpForm,
    shouldShowWelcomeHeader,
    shouldShowWelcomeText,
    shouldShowLoginForm,
  } = getRenderOptions({
    hasLogin: !!credentials?.login,
    loginFormHidden,
  });

  let welcomeHeader = '';
  let welcomeText = '';
  const headerText = translate('login.hero.header');

  const userLoginToDisplay = credentials?.login ?? '';

  if (shouldShowLoginForm) {
    welcomeHeader = shouldUseNarrowLayout
      ? headerText
      : translate('welcomeText.welcome');
    welcomeText = `${translate('welcomeText.welcome')} ${translate('welcomeText.enterPassword')}`;
  } else if (shouldShowInitialForm) {
    welcomeHeader = shouldUseNarrowLayout
      ? headerText
      : translate('welcomeText.getStarted');
    welcomeText = shouldUseNarrowLayout
      ? translate('welcomeText.getStarted')
      : '';
  } else if (shouldShowSignUpForm) {
    welcomeHeader = shouldUseNarrowLayout
      ? headerText
      : translate('welcomeText.welcome');
    welcomeText = shouldUseNarrowLayout
      ? `${translate('welcomeText.welcomeWithoutExclamation')} ${translate('welcomeText.welcomeNewAccount', {login: userLoginToDisplay})}`
      : translate('welcomeText.welcomeNewAccount', {login: userLoginToDisplay});
  }

  const navigateFocus = () => {
    signUpScreenLayoutRef.current?.scrollPageToTop();
    loginFormRef.current?.clearDataAndFocus();
  };

  const navigateBack = () => {
    if (shouldShowLoginForm || shouldShowSignUpForm) {
      Session.clearSignInData();
      return;
    }

    Navigation.goBack();
  };

  // useImperativeHandle(ref, () => ({
  //   navigateBack,
  // }));

  // if (state.isLoading) {
  //   return (
  //     <FullScreenLoadingIndicator loadingText="Creating your account..." />
  //   );
  // }

  return (
    <ScreenWrapper
      shouldShowOfflineIndicator={false}
      shouldEnableMaxHeight={shouldEnableMaxHeight}
      shouldUseCachedViewportHeight
      style={[
        styles.signUpScreen,
        StyleUtils.getSafeAreaPadding(
          {
            ...safeAreaInsets,
            bottom: 0,
            right: 0,
            left: 0,
            top: isInNarrowPaneModal ? 0 : safeAreaInsets.paddingTop,
          },
          1,
        ),
      ]}
      testID={SignUpScreenThemeWrapper.displayName}>
      <SignUpScreenLayout
        welcomeHeader={welcomeHeader}
        welcomeText={welcomeText}
        shouldShowWelcomeHeader={
          shouldShowWelcomeHeader || !shouldUseNarrowLayout
        }
        shouldShowWelcomeText={shouldShowWelcomeText}
        ref={signUpScreenLayoutRef}
        navigateFocus={navigateFocus}>
        <InitialForm
          ref={loginFormRef}
          isVisible={shouldShowInitialForm}
          login={login}
          onLoginChanged={setLogin}
          setLoginFormHidden={setLoginFormHidden}
          blurOnSubmit={false}
          scrollPageToTop={signUpScreenLayoutRef.current?.scrollPageToTop}
        />
        {/* {shouldShowWelcomeForm && <WelcomeForm />} */}
        {/* // TODO replace with LoginForm */}
        {shouldShowSignUpForm && <SignUpForm />}
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

type SignUpScreenProps = SignUpScreenInnerProps;
type SignUpScreenOnyxProps = SignUpScreenInnerOnyxProps;

function SignUpScreenThemeWrapper(props: SignUpScreenProps) {
  return (
    // <ThemeProvider value={CONST.THEME.LIGHT}>
    <ThemeStylesProvider>
      <ColorSchemeWrapper>
        <CustomStatusBarAndBackground isNested />
        <SignUpScreen
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      </ColorSchemeWrapper>
    </ThemeStylesProvider>
    // </ThemeProvider>
  );
}

SignUpScreenThemeWrapper.displayName = 'Sign Up Screen';

export default withOnyx<SignUpScreenProps, SignUpScreenOnyxProps>({
  account: {key: ONYXKEYS.ACCOUNT},
  credentials: {key: ONYXKEYS.CREDENTIALS},
  preferredLocale: {
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
  },
})(SignUpScreenThemeWrapper);

// <WarningMessage warningText={state.warning} dispatch={dispatch} />
// <View style={styles.logoContainer}>
//   <Image source={KirokuIcons.Logo} style={styles.logo} />
// </View>
// <View style={styles.inputContainer}>
//   <View style={styles.inputItemContainer}>
//     <TextInput
//       accessibilityLabel="Text input field"
//       placeholder="Email"
//       placeholderTextColor={'#a8a8a8'}
//       selectionColor={'gray'}
//       keyboardType="email-address"
//       textContentType="emailAddress"
//       value={state.email}
//       onChangeText={text =>
//         dispatch({type: 'UPDATE_EMAIL', payload: text})
//       }
//       style={styles.inputItemText}
//     />
//   </View>
//   <View style={styles.inputItemContainer}>
//     <TextInput
//       accessibilityLabel="Text input field"
//       placeholder="Username"
//       placeholderTextColor={'#a8a8a8'}
//       selectionColor={'gray'}
//       textContentType="username"
//       value={state.username}
//       onChangeText={text =>
//         dispatch({type: 'UPDATE_USERNAME', payload: text})
//       }
//       style={styles.inputItemText}
//     />
//   </View>
//   <View style={styles.inputItemContainer}>
//     <TextInput
//       accessibilityLabel="Text input field"
//       placeholder="Password"
//       placeholderTextColor={'#a8a8a8'}
//       selectionColor={'gray'}
//       textContentType="password"
//       value={state.password}
//       onChangeText={text =>
//         dispatch({type: 'UPDATE_PASSWORD', payload: text})
//       }
//       style={styles.inputItemText}
//       secureTextEntry
//     />
//     {state.password ? (
//       <ValidityIndicatorIcon isValid={state.passwordIsValid} />
//     ) : null}
//   </View>
//   <View style={styles.inputItemContainer}>
//     <TextInput
//       accessibilityLabel="Text input field"
//       placeholder="Confirm your password"
//       placeholderTextColor={'#a8a8a8'}
//       selectionColor={'grey'}
//       textContentType="password"
//       value={state.passwordConfirm}
//       onChangeText={text =>
//         dispatch({type: 'UPDATE_PASSWORD_CONFIRM', payload: text})
//       }
//       style={styles.inputItemText}
//       secureTextEntry
//     />
//     {state.passwordConfirm && state.password ? (
//       <ValidityIndicatorIcon isValid={state.passwordsMatch} />
//     ) : null}
//   </View>
//   <TouchableOpacity
//     accessibilityRole="button"
//     onPress={handleSignUp}
//     style={styles.signUpButton}>
//     <Text style={styles.signUpButtonText}>Create account</Text>
//   </TouchableOpacity>
//   <View style={styles.loginContainer}>
//     <TouchableOpacity
//       accessibilityRole="button"
//       style={styles.loginButtonContainer}
//       onPress={() => Navigation.navigate(ROUTES.LOGIN)}>
//       <Text style={styles.loginInfoText}>Already a user?</Text>
//       <Text style={styles.loginButtonText}>Log in</Text>
//     </TouchableOpacity>
//   </View>
// </View>

// const handleSignUp = async () => {
//   Keyboard.dismiss();
//   if (!isOnline) {
//     return;
//   }

//   const inputValidation = validateSignInInput(
//     state.email,
//     state.username,
//     state.password,
//     state.passwordConfirm,
//   );
//   if (!inputValidation.success) {
//     dispatch({type: 'SET_WARNING', payload: inputValidation.message});
//     return;
//   }

//   let auth = getAuth();
//   const currentUser = auth.currentUser;

//   if (currentUser) {
//     dispatch({
//       type: 'SET_WARNING',
//       payload:
//         'You are already authenticated. This is a system bug, please reset the application data.',
//     });
//     return;
//   }

//   let newUserID: string | undefined;
//   let minSupportedVersion: string | null;
//   const minUserCreationPath =
//     DBPATHS.CONFIG_APP_SETTINGS_MIN_USER_CREATION_POSSIBLE_VERSION;

//   dispatch({type: 'SET_LOADING', payload: true});
//   try {
//     minSupportedVersion = await readDataOnce(db, minUserCreationPath);
//   } catch (error: any) {
//     Alert.alert(
//       'Data fetch failed',
//       'Could not fetch the sign-up source data: ' + error.message,
//     );
//     dispatch({type: 'SET_LOADING', payload: false});
//     return;
//   }

//   if (!minSupportedVersion) {
//     dispatch({
//       type: 'SET_WARNING',
//       payload:
//         'Failed to fetch the minimum supported version. Please try again later.',
//     });
//     dispatch({type: 'SET_LOADING', payload: false});
//     return;
//   }
//   const validationResult: ValidationResult =
//     validateAppVersion(minSupportedVersion);
//   if (!validationResult.success) {
//     dispatch({
//       type: 'SET_WARNING',
//       payload:
//         'This version of the application is outdated. Please upgrade to the newest version.',
//     });
//     dispatch({type: 'SET_LOADING', payload: false});
//     return;
//   }

//   // Validate that the user is not spamming account creation
//   try {
//     await checkAccountCreationLimit(db);
//   } catch (error: any) {
//     dispatch({type: 'SET_WARNING', payload: error.message});
//     dispatch({type: 'SET_LOADING', payload: false});
//     return;
//   }

//   // Pushing initial user data to Realtime Database
//   const newProfileData: Profile = {
//     display_name: state.username,
//     photo_url: '',
//   };

//   // Create the user in the Firebase authentication
//   try {
//     await signUpUserWithEmailAndPassword(auth, state.email, state.password);
//   } catch (error: any) {
//     console.log(
//       'Sign-up failed when creating a user in firebase authentification: ',
//       error,
//     );
//     Alert.alert(
//       'Sign-up failed',
//       'There was an error during sign-up: ' + error.message,
//     );
//     dispatch({type: 'SET_LOADING', payload: false});
//     return;
//   }

//   auth = getAuth(); // Refresh
//   if (!auth.currentUser) {
//     dispatch({type: 'SET_LOADING', payload: false});
//     throw new Error('User creation failed');
//   }
//   newUserID = auth.currentUser.uid;

//   try {
//     // Realtime Database updates
//     await pushNewUserInfo(db, newUserID, newProfileData);
//   } catch (error: any) {
//     const errorHeading = 'Sign-up failed';
//     const errorMessage = 'There was an error during sign-up: ';
//     Alert.alert(errorHeading, errorMessage + error.message);

//     // Attempt to rollback any changes made
//     try {
//       await rollbackChanges(newUserID, newProfileData.display_name);
//     } catch (rollbackError: any) {
//       const errorHeading = 'Rollback error';
//       const errorMessage = 'Error during sign-up rollback:';
//       Alert.alert(errorHeading, errorMessage + rollbackError.message);
//     }
//     return;
//   } finally {
//     dispatch({type: 'SET_LOADING', payload: false});
//   }
//   // Update Firebase authentication
//   if (auth.currentUser) {
//     try {
//       await updateProfile(auth.currentUser, {displayName: state.username});
//     } catch (error: any) {
//       const errorHeading = 'User profile update failed';
//       const errorMessage = 'There was an error during sign-up: ';
//       Alert.alert(errorHeading, errorMessage + error.message);
//       return;
//     } finally {
//       dispatch({type: 'SET_LOADING', payload: false});
//     }
//   }
//   dispatch({type: 'SET_LOADING', payload: false});
//   Navigation.navigate(ROUTES.HOME);
//   return;
// };

// useEffect(() => Performance.measureTTI(), []);
// useEffect(() => {
//   if (preferredLocale) {
//     return;
//   }
//   App.setLocale(Localize.getDevicePreferredLocale());
// }, [preferredLocale]);
