import React, { useContext, useEffect, useState, version } from 'react';
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
    View 
} from 'react-native';
import { getAuth, updateProfile } from 'firebase/auth';
import { signUpUserWithEmailAndPassword } from '../auth/auth';
import { useFirebase } from '../context/FirebaseContext';
import { SignUpScreenProps } from '../types/screens';
import { pushNewUserInfo } from '../database/users';
import { readDataOnce } from '../database/baseFunctions';
import { BetaKeysData, validateBetaKey } from '../database/beta';
import { useUserConnection } from '../context/UserConnectionContext';
import { ProfileData } from '../types/database';
import { validateAppVersion } from '../context/VersionContext';
import { handleInvalidInput } from '../utils/errorHandling';
import { isValidString } from '../utils/validation';
import { invalidChars } from '../utils/static';

const SignUpScreen = ({ route, navigation }: SignUpScreenProps) => {
  if (!route || ! navigation) return null; // Should never be null
  const { loginEmail } = route.params; // To avoid reduncancy
  const auth = getAuth();
  const { db } = useFirebase();
  const { isOnline } = useUserConnection();
  const [email, setEmail] = useState(loginEmail);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState<string>('');
  const [betaKey, setBetaKey] = useState<string>(''); // Beta feature
  if (!db) return null; // Should never be null

  useEffect(() => {
      const stopListening = auth.onAuthStateChanged(user => {
      if (user) {
          navigation.replace("App", {screen: "Main Screen"}) // Redirect to main screen
      };
      });

      return stopListening;
  }, []);


 /** Check that all user input is valid and return true if it is.
   * Otherwise return false.
   */
  const validateUserInput = (): boolean => {
    if (email == '' || username == '' || password == '' || betaKey == ''){ // Beta feature
      setWarning('You must fill out all fields first');
      return false;
    };
    if (!isValidString(username)){
      setWarning('Your nickname can not contain ' + invalidChars.join(', '));
      return false;
    }
    return true;
  }

  const fetchMinSupportedVersion = async (): Promise<string | null> => {
    try {
      return await readDataOnce(db, '/config/app_settings/min_user_creation_possible_version');
    } catch (error:any) {
      Alert.alert("Database connection failed", "Could not fetch version info from the database: " + error.message);
      return null;
    }
  };

  const fetchBetaKeys = async (): Promise<BetaKeysData | null> => {
    try {
      return await readDataOnce(db, 'beta_keys/');
    } catch (error:any) {
      Alert.alert('Failed to contact the database', 'Beta keys list fetching failed:' + error.message);
      return null;
    }
  };

  const createUserAuth = async () => {
    try {
      await signUpUserWithEmailAndPassword(auth, email, password);
    } catch (error:any) {
      const errorHeading = "Error Creating User";
      const errorMessage = "There was an error creating a new user: ";
      handleInvalidInput(error, errorHeading, errorMessage, setWarning);
    }
  };

  const updateUserProfile = async (newUser: any) => {
    try {
      await updateProfile(newUser, { displayName: username });
    } catch (error:any) {
      throw new Error("There was a problem updating the user information: " + error.message);
    }
  };

  const handleSignUp = async () => {
    if (!validateUserInput() || !isOnline) return;

    const minSupportedVersion = await fetchMinSupportedVersion();
    if (!minSupportedVersion) {
      setWarning('Failed to fetch the minimum supported version. Please try again later.');
      return;
    }
    if (!validateAppVersion(minSupportedVersion)) {
      setWarning('This version of the application is outdated. Please upgrade to the newest version.');
      return;
    }

    const betaKeys = await fetchBetaKeys();
    if (!betaKeys) {
      setWarning('Failed to fetch beta keys. Please try again later.');
      return;
    }
    const betaKeyId = validateBetaKey(betaKeys, betaKey);
    if (!betaKeyId) {
      setWarning('Your beta key is either invalid or already in use.');
      return;
    }

    await createUserAuth();

    const newUser = auth.currentUser;
    if (!newUser) {
      Alert.alert('User creation failed', 'The user was not created in the database');
      return;
    }

    await updateUserProfile(newUser);

    // Pushing initial user data to Realtime Database
    const newProfileData: ProfileData = {
      display_name: username,
      photo_url: "",
    };
    try {
      await pushNewUserInfo(db, newUser.uid, newProfileData, betaKeyId);
    } catch (error:any) {
      Alert.alert('Could not write into database', 'Writing user info into the database failed: ' + error.message);
    }

    navigation.navigate("Main Screen");
  };

 

  /** Set the warning hook to include a warning text informing
   * the user of an unsuccessful account creation. Return an alert
   * in case of an uncaught warning, otherwise return null.
   * 
   * @param error Error thrown by the signUpWithUserEmailAndPassword method
   */
  const handleInvalidSignUp = (error:any) => {
    const err = error.message;
    if (err.includes('auth/invalid-email')){
      setWarning('Invalid email');
    } else if (err.includes('auth/missing-password')){
      setWarning('Choose a password first');
    } else if (err.includes('auth/weak-password')){
      setWarning('Your password is too weak - password should be at least 6 characters')
    } else if (err.includes('auth/email-already-in-use')){
      setWarning('This email is already in use')
    } else if (err.includes('auth/network-request-failed')){
        setWarning('You are offline');
    } else {
      // Uncaught error
      return Alert.alert("Error Creating User", "There was an error creating a new user: " + error.message);
    }
    return null;
  };

  // const handleGoBack = async () => {
  //   navigation.navigate("Login Screen");
  // };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, flexShrink: 1 }}>
      <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -300}
      >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo/alcohol-tracker-source-icon.png')}
          style={styles.logo}
        />
      </View>
      {warning ?
        <View style={styles.warningContainer}>
            <TouchableOpacity
              id={'warning'} 
              testID = {'warning'}
              accessibilityRole='button' 
              onPress={() => setWarning('')} 
              style={styles.warningButton}>
                <Text style={styles.warning}>{warning}</Text> 
            </TouchableOpacity>
        </View>
        :
        <></>
      } 
      <View style={styles.inputContainer}>
        <TextInput
        placeholder="Email"
        placeholderTextColor={"#a8a8a8"}
        keyboardType='email-address'
        textContentType='emailAddress'
        value={email}
        onChangeText={text => setEmail(text)}
        style={styles.input}
        />
        <TextInput
        placeholder="Username"
        placeholderTextColor={"#a8a8a8"}
        textContentType='username'
        value={username}
        onChangeText={text => setUsername(text)}
        style={styles.input}
        />
        <TextInput
        placeholder="Password"
        placeholderTextColor={"#a8a8a8"}
        textContentType='password'
        value={password}
        onChangeText={text => setPassword(text)}
        style={styles.input}
        secureTextEntry
        />
        <TextInput
        placeholder="Beta key"
        placeholderTextColor={"#a8a8a8"}
        value={betaKey}
        onChangeText={text => setBetaKey(text)}
        style={styles.input}
        secureTextEntry
        />
        <TouchableOpacity
        onPress={handleSignUp}
        style={styles.signUpButton}
        >
        <Text style={styles.signUpButtonText}>Create account</Text>
        </TouchableOpacity>
        <View style={styles.loginContainer}>
          <TouchableOpacity 
            style={styles.loginButtonContainer}
            onPress={() => navigation.navigate('Login Screen')}
            >
            <Text style={styles.loginInfoText}>
              Already a user?
            </Text>
            <Text style={styles.loginButtonText}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default SignUpScreen

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
    height: '20%',
    width: '100%',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  warningContainer: {
    width: '90%',
    position: 'absolute', // Temp
    top: 10, // Temp
    paddingHorizontal: 5,
    paddingVertical: 5,
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
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexGrow: 1,
    flexShrink: 1,
    marginTop: '20%',
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
    color: 'black'
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
})