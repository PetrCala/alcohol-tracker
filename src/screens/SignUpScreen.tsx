import React, { useContext, useEffect, useState } from 'react';
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
import DatabaseContext from '../database/DatabaseContext';
import { SignUpScreenProps } from '../types/screens';
import { pushNewUserInfo } from '../database/users';
import { readDataOnce } from '../database/baseFunctions';
import { BetaKeysData, validateBetaKey } from '../database/beta';
import { useUserConnection } from '../database/UserConnectionContext';

const SignUpScreen = ({ route, navigation }: SignUpScreenProps) => {
  if (!route || ! navigation) return null; // Should never be null
  const { loginEmail } = route.params; // To avoid reduncancy
  const auth = getAuth();
  const db = useContext(DatabaseContext);
  const { isOnline } = useUserConnection();
  const [email, setEmail] = useState(loginEmail);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState< string | null>('');
  const [betaKey, setBetaKey] = useState<string>(''); // Beta feature

  useEffect(() => {
      const stopListening = auth.onAuthStateChanged(user => {
      if (user) {
          navigation.replace("Main Screen") // Redirect to main screen
      };
      });

      return stopListening;
  }, []);

  const handleSignUp = async () => {
    // Validate all hooks on the screen first, return null if invalid
    const userInputValid = validateUserInput();
    if (userInputValid == false){
      return null;
    }
    if (!isOnline){
      setWarning('You are offline');
      return null;
    };
    // Beta feature
    let betaKeysRef = 'beta_keys/'
    let betaKeys: BetaKeysData | null = null;
    try{
      betaKeys = await readDataOnce(db, betaKeysRef);
    } catch (error: any) {
      Alert.alert('Failed to contact the database', 'Beta keys list fetching failed:'+ error.message);
    };
    if (!betaKeys){ 
      return null;
    }
    var betaKeyId = validateBetaKey(betaKeys, betaKey);
    if (!betaKeyId){
      setWarning('Your beta key is either invalid or already in use.');
      return null;
    };
    // Create the user in the authentification database
    try {
        await signUpUserWithEmailAndPassword(
            auth, email, password
            )
    } catch (error: any) {
      return handleInvalidSignUp(error);
    };
    const newUser = auth.currentUser;
    if (newUser == null){
      return Alert.alert('User creation failed', 'The user was not created in the database');
    }
    // Update the user's information with the inputted sign up data
    try {
        await updateProfile(newUser, {
            displayName: username
        });
    } catch (error:any) {
        throw new Error("There was a problem updating the user information: " + error.message);
    }
    // Update the realtime database with the new user's info
    try {
        await pushNewUserInfo(db, newUser.uid, betaKeyId); // Beta feature
    } catch (error:any) {
      return Alert.alert('Could not write into database', 'Writing user info into the database failed: ' + error.message);
    }

    return navigation.navigate("Main Screen");
  };

  /** Check that all user input is valid and return true if it is.
   * Otherwise return false.
   */
  const validateUserInput = (): boolean => {
    if (email == '' || username == '' || password == '' || betaKey == ''){ // Beta feature
      setWarning('You must fill out all fields first');
      return false;
    };
    return true;
  }

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
          source={require('../assets/logo/alcohol-tracker-source-icon.png')}
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
        value={email}
        onChangeText={text => setEmail(text)}
        style={styles.input}
        />
        <TextInput
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)}
        style={styles.input}
        />
        <TextInput
        placeholder="Password"
        value={password}
        onChangeText={text => setPassword(text)}
        style={styles.input}
        secureTextEntry
        />
        <TextInput
        placeholder="Beta key"
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
          <Text style={styles.loginInfoText}>
            Already a user?
          </Text>
          <TouchableOpacity 
            style={styles.loginButtonContainer}
            onPress={() => navigation.navigate('Login Screen')}
            >
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
    borderColor: '#0782F9',
    borderWidth: 2,
    marginTop: 5,
    marginBottom: 5,
  },
  signUpButton: {
    backgroundColor: '#0782F9',
    width: '70%',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  signUpButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  loginContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginInfoText: {
    color: '#000',
  },
  loginButtonContainer: {
    marginLeft: 4,
  },
  loginButtonText: {
    color: '#173bcf',
    fontWeight: 'bold',
    fontSize: 15,
  },
})