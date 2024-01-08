import React, {useState} from 'react';
import {
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
import {useFirebase} from '../context/FirebaseContext';
import {SignUpScreenProps} from '../types/screens';
import {readDataOnce} from '../database/baseFunctions';
import {BetaKeysData, validateBetaKey} from '../database/beta';
import {useUserConnection} from '../context/UserConnectionContext';
import {handleInvalidInput} from '../utils/errorHandling';
import {isValidString, validateAppVersion} from '../utils/validation';
import {invalidChars} from '../utils/static';
import {deleteUserInfo, pushNewUserInfo} from '../database/users';
import {ProfileData} from 'src/types/database';

const SignUpScreen = ({route, navigation}: SignUpScreenProps) => {
  if (!route || !navigation) return null; // Should never be null
  const {loginEmail} = route.params; // To avoid reduncancy
  const {db} = useFirebase();
  const {isOnline} = useUserConnection();
  const [email, setEmail] = useState(loginEmail);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState<string>('');
  const [betaKey, setBetaKey] = useState<string>(''); // Beta feature
  if (!db) return null; // Should never be null

  /** Check that all user input is valid and return true if it is.
   * Otherwise return false.
   */
  const validateUserInput = (): boolean => {
    if (email == '' || username == '' || password == '' || betaKey == '') {
      // Beta feature
      setWarning('You must fill out all fields first');
      return false;
    }
    if (!isValidString(username)) {
      setWarning('Your nickname can not contain ' + invalidChars.join(', '));
      return false;
    }
    return true;
  };

  async function rollbackChanges(
    newUserId: string,
    userNickname: string,
    betaKeyId: string,
  ): Promise<void> {
    // Delete the user data from the Realtime Database
    await deleteUserInfo(db, newUserId, userNickname, betaKeyId);

    // Delete the user from Firebase authentication
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
  }

  const handleSignUp = async () => {
    if (!validateUserInput() || !isOnline || !auth) return;
    let currentUser = auth.currentUser;

    if (currentUser) {
      setWarning(
        'You are already authenticated. This is a system bug, please reset the application data.',
      );
      return;
    }

    var newUserId: string | undefined;
    var minSupportedVersion: string | null;
    var betaKeys: any;

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
      setWarning(
        'Failed to fetch the minimum supported version. Please try again later.',
      );
      return;
    }
    if (!validateAppVersion(minSupportedVersion)) {
      setWarning(
        'This version of the application is outdated. Please upgrade to the newest version.',
      );
      return;
    }

    if (!betaKeys) {
      setWarning('Failed to fetch beta keys. Please try again later.');
      return;
    }

    const betaKeyId = validateBetaKey(betaKeys, betaKey);
    if (!betaKeyId) {
      setWarning('Your beta key is either invalid or already in use.');
      return;
    }

    // Pushing initial user data to Realtime Database
    const newProfileData: ProfileData = {
      display_name: username,
      photo_url: '',
    };

    // Create the user in the Firebase authentication
    try {
      await signUpUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.log('Sign-up failed when creating a user in firebase authentification: ', error)
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

    try{
      await auth.currentUser.delete();
    } catch (error: any) {
      console.log('Sign-up failed when deleting a user in firebase authentification: ', error)
      Alert.alert(
        'Sign-up failed',
        'There was an error during sign-up: ' + error.message,
      );
      return;
    }

    try {
      // Realtime Database updates
      await pushNewUserInfo(db, newUserId, newProfileData, betaKeyId);

      // Update Firebase authentication
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: username });
      } else {
        throw new Error("Authentication failed");
      }

      // Navigate to the main screen with a success message
      // navigation.replace('App', {screen: 'Main Screen'});
    } catch (error: any) {
      Alert.alert(
        'Sign-up failed',
        'There was an error during sign-up: ' + error.message,
      );

      // Attempt to rollback any changes made
      try {
        await rollbackChanges(
          newUserId,
          newProfileData.display_name,
          betaKeyId,
        );
      } catch (rollbackError:any) {
        console.error("Rollback error: ", rollbackError);
        Alert.alert('Clean-up failed', `Error during sign-up clean-up: ${rollbackError.message}`);
      }
    }
    return;
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flexGrow: 1, flexShrink: 1}}>
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {warning ? (
          <View style={styles.warningContainer}>
            <TouchableOpacity
              id={'warning'}
              testID={'warning'}
              accessibilityRole="button"
              onPress={() => setWarning('')}
              style={styles.warningButton}>
              <Text style={styles.warning}>{warning}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
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
            value={email}
            onChangeText={text => setEmail(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor={'#a8a8a8'}
            textContentType="username"
            value={username}
            onChangeText={text => setUsername(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={'#a8a8a8'}
            textContentType="password"
            value={password}
            onChangeText={text => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Beta key"
            placeholderTextColor={'#a8a8a8'}
            value={betaKey}
            onChangeText={text => setBetaKey(text)}
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
    marginTop: '40%',
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
    marginTop: '25%',
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
