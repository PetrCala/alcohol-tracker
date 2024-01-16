import React, {useEffect, useState} from 'react';
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
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {sendPasswordResetEmail, signOut} from 'firebase/auth';
import {auth} from '../services/firebaseSetup';
import {signInUserWithEmailAndPassword} from '../auth/auth';

import {LoginScreenProps} from '../types/screens';
import LoadingData from '../components/LoadingData';
import {useUserConnection} from '../context/UserConnectionContext';
import InputTextPopup from '../components/Popups/InputTextPopup';
import {handleInvalidInput} from '../utils/errorHandling';
import CONST from '@src/CONST';

const LoginScreen = ({navigation}: LoginScreenProps) => {
  if (!navigation) return null; // Should never be null
  const {isOnline} = useUserConnection();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [warning, setWarning] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resetPasswordModalVisible, setResetPasswordModalVisible] =
    useState<boolean>(false);

  useFocusEffect(
    // Redirect to main screen if user is already logged in (from login screen only)
    React.useCallback(() => {
      const stopListening = auth.onAuthStateChanged(user => {
        if (user) {
          navigation.replace('App', {screen: 'Main Screen'}); // Redirect to main screen
        }
        setLoadingUser(false);
      });

      return () => {
        stopListening(); // This will be called when the screen loses focus
      };
    }, []),
  );

  const handleLogin = async () => {
    // Validate all hooks on the screen first, return null if invalid
    // Attempt to login
    try {
      await signInUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorHeading = 'Failed to log in';
      const errorMessage = 'There was an error trying to log in: ';
      handleInvalidInput(error, errorHeading, errorMessage, setWarning);
    }
    return;
  };

  const handleResetPassword = async (mail: string) => {
    // reset the user password
    try {
      await sendPasswordResetEmail(auth, mail);
      setSuccess('Password reset link sent');
    } catch (error: any) {
      const errorHeading = 'Error When Resetting Password';
      const errorMessage = 'There was an error when resetting your password: ';
      return handleInvalidInput(error, errorHeading, errorMessage, setWarning);
    } finally {
      setResetPasswordModalVisible(false);
    }
  };

  // Wait to see whether there already is an authentificated user
  // Possibly here display the app logo instead of the loading screen
  if (loadingUser) return <LoadingData />;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flexGrow: 1, flexShrink: 1}}>
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {warning ? (
          <View style={[styles.infoContainer, styles.warningInfoContainer]}>
            <TouchableOpacity
              id={'warning'}
              testID={'warning'}
              accessibilityRole="button"
              onPress={() => setWarning('')}
              style={styles.infoButton}>
              <Text style={[styles.infoText, styles.warningInfoText]}>
                {warning}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
        {success ? (
          <View style={[styles.infoContainer, styles.successInfoContainer]}>
            <TouchableOpacity
              id={'success'}
              testID={'success'}
              accessibilityRole="button"
              onPress={() => setSuccess('')}
              style={styles.infoButton}>
              <Text style={[styles.infoText, styles.successInfoText]}>
                {success}
              </Text>
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
            placeholder="Password"
            placeholderTextColor={'#a8a8a8'}
            textContentType="password"
            value={password}
            onChangeText={text => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setResetPasswordModalVisible(true)}
            style={styles.forgottenPasswordButton}>
            <Text style={styles.forgottenPasswordText}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
          <View style={styles.horizontalLine} />
          <View style={styles.signUpContainer}>
            <TouchableOpacity
              style={styles.signUpButtonContainer}
              onPress={() =>
                navigation.navigate('Sign Up Screen', {loginEmail: email})
              }>
              <Text style={styles.signUpInfoText}>Don't have an account?</Text>
              <Text style={styles.signUpButtonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
          <InputTextPopup
            visible={resetPasswordModalVisible}
            transparent={true}
            message={'E-mail to send the reset link to:'}
            confirmationMessage={'Send link'}
            placeholder={'E-mail'}
            onRequestClose={() => setResetPasswordModalVisible(false)}
            onSubmit={mail => handleResetPassword(mail)}
            keyboardType="email-address"
            textContentType="emailAddress"
            secureTextEntry={false}
          />
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default LoginScreen;

const screenWidth = Dimensions.get('window').width;
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
  infoContainer: {
    width: '80%',
    height: 'auto',
    position: 'absolute', // Temp
    top: '10%', // Temp
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
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  infoText: {
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
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
    fontSize: 14,
  },
  horizontalLine: {
    width: screenWidth * 0.55,
    height: 1,
    backgroundColor: 'grey',
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
    fontSize: 14,
    marginLeft: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
});
