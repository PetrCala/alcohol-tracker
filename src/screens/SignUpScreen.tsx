import React, {useReducer, useState} from 'react';
import {
  Dimensions,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {updateProfile} from 'firebase/auth';
import {auth} from '../services/firebaseSetup';
import {signUpUserWithEmailAndPassword} from '../auth/auth';
import {useFirebase} from '../context/global/FirebaseContext';
import {SignUpScreenProps} from '../types/screens';
import {readDataOnce} from '../database/baseFunctions';
import {validateBetaKey} from '../database/beta';
import {useUserConnection} from '../context/global/UserConnectionContext';
import {isValidString, validateAppVersion} from '../utils/validation';
import {deleteUserData, pushNewUserInfo} from '../database/users';
import {ProfileData} from 'src/types/database';
import {handleErrors} from '@src/utils/errorHandling';
import CONST from '@src/CONST';
import WarningMessage from '@components/Info/WarningMessage';

interface State {
  email: string;
  username: string;
  password: string;
  warning: string;
  betaKey: string;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  email: '',
  username: '',
  password: '',
  warning: '',
  betaKey: '',
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
    case 'SET_WARNING':
      return {
        ...state,
        warning: action.payload,
      };
    case 'SET_BETA_KEY':
      return {
        ...state,
        betaKey: action.payload,
      };
    default:
      return state;
  }
};

const SignUpScreen = ({route, navigation}: SignUpScreenProps) => {
  const {loginEmail} = route ? route.params : {loginEmail: ''};
  const {db} = useFirebase();
  const {isOnline} = useUserConnection();
  const [state, dispatch] = useReducer(reducer, initialState);
  if (!db) return null; // Should never be null

  /** Check that all user input is valid and return true if it is.
   * Otherwise return false.
   */
  const validateUserInput = (): boolean => {
    if (
      state.email == '' ||
      state.username == '' ||
      state.password == '' ||
      state.betaKey == ''
    ) {
      // Beta feature
      dispatch({
        type: 'SET_WARNING',
        payload: 'You must fill out all fields first',
      });
      return false;
    }
    if (!isValidString(state.username)) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'Your nickname can not contain ' + CONST.INVALID_CHARS.join(', '),
      });
      return false;
    }
    return true;
  };

  async function rollbackChanges(
    newUserId: string,
    userNickname: string,
    betaKeyId: number,
  ): Promise<void> {
    // Delete the user data from the Realtime Database
    await deleteUserData(
      db,
      newUserId,
      userNickname,
      betaKeyId,
      undefined,
      undefined,
    );

    // Delete the user from Firebase authentication
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
  }

  const handleSignUp = async () => {
    if (!validateUserInput() || !isOnline || !auth) return;
    const currentUser = auth.currentUser;

    if (currentUser) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'You are already authenticated. This is a system bug, please reset the application data.',
      });
      return;
    }

    let newUserId: string | undefined;
    let minSupportedVersion: string | null;
    let betaKeys: any;

    try {
      minSupportedVersion = await readDataOnce(
        db,
        '/config/app_settings/min_user_creation_possible_version',
      );
      betaKeys = await readDataOnce(db, 'beta_keys/');
    } catch (error: any) {
      Alert.alert(
        'Data fetch failed',
        'Could not fetch the sign-up source data: ' + error.message,
      );
      return;
    }

    if (!minSupportedVersion) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'Failed to fetch the minimum supported version. Please try again later.',
      });
      return;
    }
    if (!validateAppVersion(minSupportedVersion)) {
      dispatch({
        type: 'SET_WARNING',
        payload:
          'This version of the application is outdated. Please upgrade to the newest version.',
      });
      return;
    }

    if (!betaKeys) {
      dispatch({
        type: 'SET_WARNING',
        payload: 'Failed to fetch beta keys. Please try again later.',
      });
      return;
    }

    const betaKeyId = validateBetaKey(betaKeys, state.betaKey);
    if (!betaKeyId) {
      dispatch({type: 'SET_WARNING', payload: 'Invalid beta key.'});
      return;
    }

    // Pushing initial user data to Realtime Database
    const newProfileData: ProfileData = {
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
      return;
    }

    if (!auth.currentUser) {
      throw new Error('User creation failed');
    }
    newUserId = auth.currentUser.uid;

    try {
      // Realtime Database updates
      await pushNewUserInfo(db, newUserId, newProfileData, betaKeyId);
    } catch (error: any) {
      const errorHeading = 'Sign-up failed';
      const errorMessage = 'There was an error during sign-up: ';
      handleErrors(error, errorHeading, errorMessage, dispatch);

      // Attempt to rollback any changes made
      try {
        await rollbackChanges(
          newUserId,
          newProfileData.display_name,
          betaKeyId,
        );
      } catch (rollbackError: any) {
        const errorHeading = 'Rollback error';
        const errorMessage = 'Error during sign-up rollback:';
        handleErrors(rollbackError, errorHeading, errorMessage, dispatch);
      }
      return;
    }
    // Update Firebase authentication
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {displayName: state.username});
      } catch (error: any) {
        const errorHeading = 'User profile update failed';
        const errorMessage = 'There was an error during sign-up: ';
        handleErrors(error, errorHeading, errorMessage, dispatch);
        return;
      }
    }
    // Navigate to the main screen with a success message
    navigation.replace('App', {screen: 'Main Screen'});
    return;
  };

  if (!route || !navigation) return null; // Should never be null

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flexGrow: 1, flexShrink: 1}}>
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <WarningMessage warningText={state.warning} dispatch={dispatch} />
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo/alcohol-tracker-source-icon.png')}
            style={styles.logo}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={'#a8a8a8'}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={state.email}
            onChangeText={text =>
              dispatch({type: 'UPDATE_EMAIL', payload: text})
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor={'#a8a8a8'}
            textContentType="username"
            value={state.username}
            onChangeText={text =>
              dispatch({type: 'UPDATE_USERNAME', payload: text})
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={'#a8a8a8'}
            textContentType="password"
            value={state.password}
            onChangeText={text =>
              dispatch({type: 'UPDATE_PASSWORD', payload: text})
            }
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Beta key"
            placeholderTextColor={'#a8a8a8'}
            value={state.betaKey}
            onChangeText={text =>
              dispatch({type: 'SET_BETA_KEY', payload: text})
            }
            style={styles.input}
            secureTextEntry
          />
          <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Create account</Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <TouchableOpacity
              style={styles.loginButtonContainer}
              onPress={() => navigation.navigate('Login Screen')}>
              <Text style={styles.loginInfoText}>Already a user?</Text>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default SignUpScreen;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF99',
  },
  logoContainer: {
    flexShrink: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#FFFF99',
    marginTop: screenHeight * 0.2,
    width: '100%',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  warningContainer: {
    width: '80%',
    position: 'absolute', // Temp
    top: '10%', // Temp
    borderRadius: 5,
    backgroundColor: '#fce3e1',
    borderColor: 'red',
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'center',
  },
  warningButton: {
    flexGrow: 1,
    width: '90%',
  },
  warning: {
    padding: 5,
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexGrow: 1,
    flexShrink: 1,
    marginTop: screenHeight * 0.15,
    width: '80%',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 2,
    marginTop: 5,
    marginBottom: 5,
    color: 'black',
  },
  signUpButton: {
    backgroundColor: '#fcf50f',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginTop: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  signUpButtonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  loginContainer: {
    marginTop: 3,
    width: '100%',
  },
  loginInfoText: {
    color: '#000',
  },
  loginButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#02a109',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
});

// Firebase functions approach to sign-up handling
// try {
//   const createUserFunction = functions().httpsCallable('createUser')
//   const result = await createUserFunction({ email, password, username, betaKey });

//   if (result.data.success) {
//     navigation.replace("App", {screen: "Main Screen"}); // Navigate to main screen
//   } else {
//     setWarning(result.data?.message);
//   }
// } catch (error:any) {
//   // Handle the error
//   setWarning('Error during sign-up: ' + error.message);
// }

// const handleGoBack = async () => {
//   navigation.navigate("Login Screen");
// };
