import React, { useEffect, useState } from 'react';
import { 
  Image,
  KeyboardAvoidingView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { Alert } from 'react-native';
import { getAuth } from 'firebase/auth';

import { signInUserWithEmailAndPassword } from '../auth/auth';
import { LoginScreenProps } from '../types/screens';
import LoadingData from '../components/LoadingData';


const LoginScreen = ( {navigation }: LoginScreenProps) => {
  if (!navigation) return null; // Should never be null
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [warning, setWarning] = useState< string | null>('');

  useEffect(() => {
    const stopListening = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace("Main Screen") // Redirect to main screen
      };
      setLoadingUser(false);
    });

    return stopListening;
  }, []);

  const handleLogin = async () => {
    // Validate all hooks on the screen first, return null if invalid
    // Attempt to login
    try {
        await signInUserWithEmailAndPassword(
            auth, email, password
        );
    } catch (error:any) {
      return handleInvalidLogin(error);
    };
  };

  /** Set the warning hook to include a warning text informing
   * the user of an unsuccessful login. Return an alert
   * in case of an uncaught warning, otherwise return null.
   * 
   * @param error Error thrown by the signInWithUserEmailAndPassword method
   */
  const handleInvalidLogin = (error:any) => {
    const err = error.message;
    // Invalid email error
    if (err.includes('auth/invalid-email')){
      setWarning('Invalid email');
    } else if (err.includes('auth/missing-password')){
      setWarning('Missing password')
    } else if (err.includes('auth/user-not-found')){
      setWarning('User not found')
    } else if (err.includes('auth/wrong-password')){
      setWarning('Incorrect password')
    } else {
      // Uncaught error
      return Alert.alert("Error Creating User", "There was an error creating a new user: " + error.message);
    }
    return null;
  };

  // Wait to see whether there already is an authentificated user
  // Possibly here display the app logo instead of the loading screen
  if (loadingUser) {
    return(
      <LoadingData
      // loadingText="Loading data..."
      />
    );
  };

  return (
      <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      >
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo/alcohol-tracker-source-icon.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.inputContainer}>
          {warning ?
          <TouchableOpacity
            id={'warning'} 
            testID = {'warning'}
            accessibilityRole='button' 
            onPress={() => setWarning('')} 
            style={styles.warningContainer}>
              <Text style={styles.warning}>{warning}</Text> 
          </TouchableOpacity>
          :
          <></>
          } 
          <TextInput
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
          />
          <TextInput
          placeholder="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
          />
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpInfoText}>
              Don't have an account?
            </Text>
            <TouchableOpacity 
              style={styles.signUpButtonContainer}
              onPress={() => navigation.navigate('Sign Up Screen',
                {loginEmail: email}
              )}
              >
              <Text style={styles.signUpButtonText}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
      </View>
      </KeyboardAvoidingView>
  );
};

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF99'
  },
  logoContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  warningContainer: {
    width: '90%',
    marginBottom: 15,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#fce3e1',
    borderColor: 'red',
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'center',
  },
  warning: {
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 100,
    flexGrow: 1,
    height: '30%',
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
  loginButton: {
    backgroundColor: '#0782F9',
    width: '70%',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  signUpContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  signUpInfoText: {
    color: '#000',
  },
  signUpButtonContainer: {
    marginLeft: 4,
  },
  signUpButtonText: {
    color: '#173bcf',
    fontWeight: 'bold',
    fontSize: 15,
  },
})