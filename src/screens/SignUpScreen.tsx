import React, {useEffect, useReducer, useRef} from 'react';
import {Dimensions, Alert, StyleSheet, View, Keyboard} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
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
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScrollView from '@components/ScrollView';
import ImageSVG from '@components/ImageSVG';
import useThemeStyles from '@hooks/useThemeStyles';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyleUtils from '@hooks/useStyleUtils';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import LoginForm from '@libs/LoginForm';
import {InputHandle} from '@libs/LoginForm/types';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

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

type State = {
  email: string;
  username: string;
  password: string;
  passwordIsValid: boolean;
  passwordConfirm: string;
  passwordsMatch: boolean;
  warning: string;
  isLoading: boolean;
};

type Action = {
  type: string;
  payload: any;
};

const initialState: State = {
  email: '',
  username: '',
  password: '',
  passwordIsValid: false,
  passwordConfirm: '',
  passwordsMatch: false,
  warning: '',
  isLoading: false,
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_EMAIL':
      return {
        ...state,
        email: action.payload,
      };
    case 'UPDATE_USERNAME':
      return {
        ...state,
        username: action.payload,
      };
    case 'UPDATE_PASSWORD':
      return {
        ...state,
        password: action.payload,
      };
    case 'UPDATE_PASSWORD_VALIDITY':
      return {
        ...state,
        passwordIsValid: action.payload,
      };
    case 'UPDATE_PASSWORD_CONFIRM':
      return {
        ...state,
        passwordConfirm: action.payload,
      };
    case 'UPDATE_PASSWORDS_MATCH':
      return {
        ...state,
        passwordsMatch: action.payload,
      };
    case 'SET_WARNING':
      return {
        ...state,
        warning: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

type SignUpScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function SignUpScreen() {
  const {db} = useFirebase();
  const {isOnline} = useUserConnection();
  const styles = useThemeStyles();
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const StyleUtils = useStyleUtils();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const signUpScreenLayoutRef = useRef<SignUpScreenLayoutRef>(null);
  const loginFormRef = useRef<InputHandle>(null);
  const [login, setLogin] = React.useState('');
  const [state, dispatch] = useReducer(reducer, initialState);
  // const theme = useTheme();

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

  const handleSignUp = async () => {
    Keyboard.dismiss();
    if (!isOnline) {
      return;
    }

    const inputValidation = validateSignInInput(
      state.email,
      state.username,
      state.password,
      state.passwordConfirm,
    );
    if (!inputValidation.success) {
      dispatch({type: 'SET_WARNING', payload: inputValidation.message});
      return;
    }

    let auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'You are already authenticated. This is a system bug, please reset the application data.',
      });
      return;
    }

    let newUserID: string | undefined;
    let minSupportedVersion: string | null;
    const minUserCreationPath =
      DBPATHS.CONFIG_APP_SETTINGS_MIN_USER_CREATION_POSSIBLE_VERSION;

    dispatch({type: 'SET_LOADING', payload: true});
    try {
      minSupportedVersion = await readDataOnce(db, minUserCreationPath);
    } catch (error: any) {
      Alert.alert(
        'Data fetch failed',
        'Could not fetch the sign-up source data: ' + error.message,
      );
      dispatch({type: 'SET_LOADING', payload: false});
      return;
    }

    if (!minSupportedVersion) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'Failed to fetch the minimum supported version. Please try again later.',
      });
      dispatch({type: 'SET_LOADING', payload: false});
      return;
    }
    const validationResult: ValidationResult =
      validateAppVersion(minSupportedVersion);
    if (!validationResult.success) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'This version of the application is outdated. Please upgrade to the newest version.',
      });
      dispatch({type: 'SET_LOADING', payload: false});
      return;
    }

    // Validate that the user is not spamming account creation
    try {
      await checkAccountCreationLimit(db);
    } catch (error: any) {
      dispatch({type: 'SET_WARNING', payload: error.message});
      dispatch({type: 'SET_LOADING', payload: false});
      return;
    }

    // Pushing initial user data to Realtime Database
    const newProfileData: Profile = {
      display_name: state.username,
      photo_url: '',
    };

    // Create the user in the Firebase authentication
    try {
      await signUpUserWithEmailAndPassword(auth, state.email, state.password);
    } catch (error: any) {
      console.log(
        'Sign-up failed when creating a user in firebase authentification: ',
        error,
      );
      Alert.alert(
        'Sign-up failed',
        'There was an error during sign-up: ' + error.message,
      );
      dispatch({type: 'SET_LOADING', payload: false});
      return;
    }

    auth = getAuth(); // Refresh
    if (!auth.currentUser) {
      dispatch({type: 'SET_LOADING', payload: false});
      throw new Error('User creation failed');
    }
    newUserID = auth.currentUser.uid;

    try {
      // Realtime Database updates
      await pushNewUserInfo(db, newUserID, newProfileData);
    } catch (error: any) {
      const errorHeading = 'Sign-up failed';
      const errorMessage = 'There was an error during sign-up: ';
      Alert.alert(errorHeading, errorMessage + error.message);

      // Attempt to rollback any changes made
      try {
        await rollbackChanges(newUserID, newProfileData.display_name);
      } catch (rollbackError: any) {
        const errorHeading = 'Rollback error';
        const errorMessage = 'Error during sign-up rollback:';
        Alert.alert(errorHeading, errorMessage + rollbackError.message);
      }
      return;
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
    // Update Firebase authentication
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {displayName: state.username});
      } catch (error: any) {
        const errorHeading = 'User profile update failed';
        const errorMessage = 'There was an error during sign-up: ';
        Alert.alert(errorHeading, errorMessage + error.message);
        return;
      } finally {
        dispatch({type: 'SET_LOADING', payload: false});
      }
    }
    dispatch({type: 'SET_LOADING', payload: false});
    Navigation.navigate(ROUTES.HOME);
    return;
  };

  // Track password validity
  useEffect(() => {
    if (isValidPassword(state.password)) {
      dispatch({type: 'UPDATE_PASSWORD_VALIDITY', payload: true});
    } else {
      dispatch({type: 'UPDATE_PASSWORD_VALIDITY', payload: false});
    }
  }, [state.password]);

  // Track password matching
  useEffect(() => {
    if (isValidPasswordConfirm(state.password, state.passwordConfirm)) {
      dispatch({type: 'UPDATE_PASSWORDS_MATCH', payload: true});
    } else {
      dispatch({type: 'UPDATE_PASSWORDS_MATCH', payload: false});
    }
  }, [state.password, state.passwordConfirm]);

  if (state.isLoading) {
    return (
      <FullScreenLoadingIndicator loadingText="Creating your account..." />
    );
  }

  return (
    <ScreenWrapper
      shouldShowOfflineIndicator={false}
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
      testID={SignUpScreen.displayName}>
      <ScrollView style={styles.pt8}>
        {/* <SignInPageLayout > */}
        <View style={[styles.alignItemsCenter]}>
          <ImageSVG
            contentFit="contain"
            src={KirokuIcons.Logo}
            width={variables.signInLogoSize}
            height={variables.signInLogoSize}
          />
          <LoginForm
            ref={loginFormRef}
            isVisible={true} // could be shouldShowLoginForm
            login={login}
            onLoginChanged={setLogin}
            blurOnSubmit={false}
            scrollPageToTop={signUpScreenLayoutRef.current?.scrollPageToTop}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

type SignUpScreenProps = SignUpScreenInnerProps;
type SignUpScreenOnyxProps = SignUpScreenInnerOnyxProps;

SignUpScreen.displayName = 'Sign Up Screen';

export default withOnyx<SignUpScreenProps, SignUpScreenOnyxProps>({
  account: {key: ONYXKEYS.ACCOUNT},
  credentials: {key: ONYXKEYS.CREDENTIALS},
  preferredLocale: {
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
  },
})(SignUpScreen);

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
