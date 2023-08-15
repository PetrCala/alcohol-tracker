import React, { useContext, useEffect, useState } from 'react';
import { 
    KeyboardAvoidingView, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { signInUserWithEmailAndPassword } from '../auth/auth';
import DatabaseContext from '../database/DatabaseContext';
import { LoginScreenProps } from '../types/screens';
import LoadingData from '../components/LoadingData';


const LoginScreen = ( {navigation }: LoginScreenProps) => {
  const auth = getAuth();
  const db = useContext(DatabaseContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ loadingUser, setLoadingUser ] = useState<boolean>(true);

  useEffect(() => {
    const stopListening = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace("Main Screen") // Redirect to main screen
      };
      setLoadingUser(false);
    });

    return stopListening;
  }, []);

  const handleSignUp = () => {
      navigation.replace("Sign Up Screen");
  };

  const handleLogin = async () => {
      try {
          await signInUserWithEmailAndPassword(
              auth, email, password
          );
      } catch (error:any) {
          throw new Error("Failed to sign in: " + error.message);
      };
  };

  // Wait to see whether there already is an authentificated user
  if (loadingUser) {
    return(
      <LoadingData
      loadingText="Loading data..."
      />
    );
  };

  return (
      <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      >
      <View style={styles.inputContainer}>
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
      </View>

      <View style={styles.buttonContainer}>
          <TouchableOpacity
          onPress={handleLogin}
          style={styles.button}
          >
          <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={handleSignUp}
          style={[styles.button, styles.buttonOutline]}
          >
          <Text style={styles.buttonOutlineText}>Don't have an account yet? Sign up instead!</Text>
          </TouchableOpacity>
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
  },
  inputContainer: {
    width: '80%'
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#0782F9',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#0782F9',
    fontWeight: '700',
    fontSize: 16,
  },
})