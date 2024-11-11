import React, {useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {getAuth} from 'firebase/auth';
import {useFirebase} from '@context/global/FirebaseContext';
import {useUserConnection} from '@context/global/UserConnectionContext';
import {deleteUserData} from '@database/users';
import DBPATHS from '@database/DBPATHS';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import * as Session from '@userActions/Session';
import useThemeStyles from '@hooks/useThemeStyles';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyleUtils from '@hooks/useStyleUtils';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {InputHandle} from '@libs/InitialForm/types';
import useLocalize from '@hooks/useLocalize';
import InitialForm from '@libs/InitialForm';
import SignUpScreenLayout from './SignUpScreenLayout';
import OrDelimiter from './OrDelimiter';

type InitialScreenOnyxProps = {};

type InitialScreenProps = InitialScreenOnyxProps;

type InitialScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

function InitialScreen({}: InitialScreenProps) {
  const {auth, db} = useFirebase();
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
  const safeAreaInsets = useStyledSafeAreaInsets();
  const currentScreenLayoutRef = useRef<InitialScreenLayoutRef>(null);
  const initialFormRef = useRef<InputHandle>(null);

  useFocusEffect(
    // Redirect to main screen if user is already logged in (from sign up screen only)
    React.useCallback(() => {
      // Also clear the sign in data each time the screen is focused
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
          scrollPageToTop={currentScreenLayoutRef.current?.scrollPageToTop}
        />
      </SignUpScreenLayout>
    </ScreenWrapper>
  );
}

InitialScreen.displayName = 'Sign Up Screen';
export default InitialScreen;

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
