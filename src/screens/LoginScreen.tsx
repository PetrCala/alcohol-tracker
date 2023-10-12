import React, { useEffect, useState } from 'react';
import { 
  Dimensions,
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
import { Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { signInUserWithEmailAndPassword } from '../auth/auth';

import { LoginScreenProps } from '../types/screens';
import LoadingData from '../components/LoadingData';
import { useUserConnection } from '../context/UserConnectionContext';
import InputTextPopup from '../components/Popups/InputTextPopup';


const LoginScreen = ( {navigation }: LoginScreenProps) => {
  if (!navigation) return null; // Should never be null
  const auth = getAuth();
  const { isOnline } = useUserConnection();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [warning, setWarning] = useState< string | null>('warning');
  const [success, setSuccess] = useState< string | null>('');
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const stopListening = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace("App", {screen: "Main Screen"}) // Redirect to main screen
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
      const errorHeading = "Error Creating User";
      const errorMessage = "There was an error creating a new user: ";
      return handleInvalidInput(error, errorHeading, errorMessage);
    };
  };

  const handleResetPassword = async (mail:string) => {
    // reset the user password
    try {
      await sendPasswordResetEmail(auth, mail);
      setSuccess("Password reset link sent");
    } catch (error:any) {
      const errorHeading = "Error When Resetting Password";
      const errorMessage = "There was an error when resetting your password: ";
      return handleInvalidInput(error, errorHeading, errorMessage);
    } finally {
      setResetPasswordModalVisible(false);
    };
  };

  /** Set the warning hook to include a warning text informing
   * the user of an unsuccessful firebase request. Return an alert
   * in case of an uncaught warning, otherwise return null.
   * 
   * @param {any} error Error thrown by the signInWithUserEmailAndPassword method
   * @param {string} alertHeading Error heading message
   * @param {string} alertMessage Error explanation message
   */
  const handleInvalidInput = (
    error:any, 
    alertHeading:string, 
    alertMessage:string,
    ) => {
    const err = error.message;
    if (err.includes('auth/missing-email')){
      setWarning('Missing email');
    } else if (err.includes('auth/invalid-email')){
      setWarning('Invalid email');
    } else if (err.includes('auth/missing-password')){
      setWarning('Missing password')
    } else if (err.includes('auth/user-not-found')){
      setWarning('User not found')
    } else if (err.includes('auth/wrong-password')){
      setWarning('Incorrect password')
    } else if (err.includes('auth/network-request-failed')){
        setWarning('You are offline');
    } else {
      // Uncaught error
      return Alert.alert(alertHeading, alertMessage + error.message);
    }
    return null;
  };

  // Wait to see whether there already is an authentificated user
  // Possibly here display the app logo instead of the loading screen
  if (loadingUser) {
    return(
      <LoadingData
      loadingText=""
      />
    );
  };

  return (    
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, flexShrink: 1 }}>
      <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo/alcohol-tracker-source-icon.png')}
          style={styles.logo}
        />
      </View>
      {warning ?
        <View style={[styles.infoContainer, styles.warningInfoContainer]}>
            <TouchableOpacity
              id={'warning'} 
              testID = {'warning'}
              accessibilityRole='button' 
              onPress={() => setWarning('')} 
              style={styles.infoButton}>
                <Text style={[
                  styles.infoText,
                  styles.warningInfoText
                ]}>{warning}</Text> 
            </TouchableOpacity>
        </View>
        :
        <></>
      } 
      {success ?
        <View style={[styles.infoContainer, styles.successInfoContainer]}>
            <TouchableOpacity
              id={'success'} 
              testID = {'success'}
              accessibilityRole='button' 
              onPress={() => setSuccess('')} 
              style={styles.infoButton}>
                <Text style={[
                  styles.infoText,
                  styles.successInfoText
                ]}>{success}</Text> 
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
        placeholder="Password"
        placeholderTextColor={"#a8a8a8"}
        textContentType='password'
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
        <TouchableOpacity 
          onPress={() => setResetPasswordModalVisible(true)}
          style={styles.forgottenPasswordButton}
        >
          <Text style={styles.forgottenPasswordText}>Forgot your password?</Text>
        </TouchableOpacity>
        <View style={styles.horizontalLine}/>
        <View style={styles.signUpContainer}>
          <TouchableOpacity 
            style={styles.signUpButtonContainer}
            onPress={() => navigation.navigate('Sign Up Screen',
              {loginEmail: email}
            )}
            >
            <Text style={styles.signUpInfoText}>
              Don't have an account?
            </Text>
            <Text style={styles.signUpButtonText}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
        <InputTextPopup
          visible={resetPasswordModalVisible}
          transparent={true}
          message={"E-mail to send the reset link to:"}
          confirmationMessage={"Send link"}
          placeholder={"E-mail"}
          onRequestClose={() => setResetPasswordModalVisible(false)}
          onSubmit={(mail) => handleResetPassword(mail)}
          keyboardType='email-address'
          textContentType='emailAddress'
          secureTextEntry={false}
        />
      </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default LoginScreen

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF99'
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
  infoContainer: {
    width: '80%',
    position: 'absolute', // Temp
    top: 15, // Temp
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'center',
  },
  warningInfoContainer: {
    backgroundColor: '#fce3e1',
    borderColor: 'red',
  },
  successInfoContainer: {
    backgroundColor: '#e3f0d5',
    borderColor: 'green',
  },
  infoButton: {
    width: '100%',
    height: '100%',
  },
  infoText: {
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  warningInfoText: {
    color: 'red',
  },
  successInfoText: {
    color: 'green',
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
  loginButton: {
    backgroundColor: '#fcf50f',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 10,
    borderColor: '#000',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  forgottenPasswordButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 3,
    padding: 10,
  },
  forgottenPasswordText: {
    color: '#02a109',
    fontWeight: 'bold',
    fontSize: 15,
  },
  horizontalLine: {
    width: screenWidth * 0.8,
    height: 1,
    backgroundColor: 'black',
    alignSelf: 'center',
  },
  signUpContainer: {
    width: '100%',
    marginTop: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  signUpButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpInfoText: {
    color: '#000',
  },
  signUpButtonText: {
    color: '#02a109',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
})