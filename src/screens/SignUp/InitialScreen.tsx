import React, {useReducer, useRef, useState} from 'react';
import {Alert, Keyboard} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
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
import type {Login, Locale} from '@src/types/onyx';
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
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useLocalize from '@hooks/useLocalize';
import InitialForm from '@libs/InitialForm';
// import InitialScreenLayout from '@libs/InitialScreenLayout';
// import LogInForm from '@screens/SignUp/LogInForm/BaseLogInForm';
import SignUpScreenLayout from './SignUpScreenLayout';
// import SignUpForm from '@screens/SignUp/SignUpForm';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';

type InitialScreenOnyxProps = {
  /** The details about the user that is signing in */
  login: OnyxEntry<Login>;

  /** The user's preferred locale */
  preferredLocale: OnyxEntry<Locale>;
};

type InitialScreenProps = InitialScreenOnyxProps & {};

type InitialScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function InitialScreen({login, preferredLocale}: InitialScreenProps) {
  const {auth, db} = useFirebase();
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<InitialScreenLayoutRef>(null);
  const initialFormRef = useRef<InputHandle>(null);
  const [email, setEmail] = useState(login?.email ?? '');

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

  const headerText = translate('login.hero.header');
  const welcomeHeader = shouldUseNarrowLayout
    ? headerText
    : translate('welcomeText.getStarted');
  const welcomeText = shouldUseNarrowLayout
    ? translate('welcomeText.getStarted')
    : '';

  const navigateFocus = () => {
    currentScreenLayoutRef.current?.scrollPageToTop();
    // initialFormRef.current?.clearDataAndFocus();
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
        <InitialForm
          ref={initialFormRef}
          isVisible={true}
          email={email}
          onEmailChanged={setEmail}
          blurOnSubmit={false}
          scrollPageToTop={currentScreenLayoutRef.current?.scrollPageToTop}
        />
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

InitialScreen.displayName = 'Sign Up Screen';

export default withOnyx<InitialScreenProps, InitialScreenOnyxProps>({
  login: {key: ONYXKEYS.LOGIN},
  preferredLocale: {
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
  },
})(InitialScreen);

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
//       onPress={() => Navigation.navigate(ROUTES.LOG_IN)}>
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
