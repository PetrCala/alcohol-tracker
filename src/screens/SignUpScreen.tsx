import React, { useContext, useEffect, useState } from 'react';
import { 
    Alert,
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
import { SignUpScreenProps } from '../utils/types';
import { pushNewUserInfo } from '../database/users';

const SignUpScreen = ( {navigation }: SignUpScreenProps) => {
    const auth = getAuth();
    const db = useContext(DatabaseContext);
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const stopListening = auth.onAuthStateChanged(user => {
        if (user) {
            navigation.replace("Main Screen") // Redirect to main screen
        };
        });

        return stopListening;
    }, []);

    const handleSignUp = async () => {
        // Create the user in the authentification database
        try {
            await signUpUserWithEmailAndPassword(
                auth, email, password
                )
        } catch (error: any) {
            return Alert.alert("Error Creating User", "There was an error creating a new user: " + error.message);
        };
        const newUser = auth.currentUser;
        if (newUser == null){
            throw new Error("The user was not created in the database");
        }
        // Update the user's information with the inputted sign up data
        try {
            await updateProfile(newUser, {
                displayName: nickname
            });
        } catch (error:any) {
            throw new Error("There was a problem updating the user information: " + error.message);
        }
        // Update the realtime database with the new user's info
        try {
            await pushNewUserInfo(db, newUser.uid);
        } catch (error:any) {
            throw new Error("Could not write the user data into the database: " + error.messsage);
        }

        return navigation.navigate("Main Screen");
    };

    const handleGoBack = async () => {
        navigation.navigate("Login Screen");
    };

    return (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -300}
        >
        <View style={styles.inputContainer}>
            <TextInput
            placeholder="Email"
            value={email}
            onChangeText={text => setEmail(text)}
            style={styles.input}
            />
            <TextInput
            placeholder="Nickname"
            value={nickname}
            onChangeText={text => setNickname(text)}
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
            onPress={handleSignUp}
            style={styles.button}
            >
            <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity
            onPress={handleGoBack}
            style={[styles.button, styles.buttonOutline]}
            >
            <Text style={styles.buttonOutlineText}>Go back</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        </ScrollView>
    );
};

export default SignUpScreen

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