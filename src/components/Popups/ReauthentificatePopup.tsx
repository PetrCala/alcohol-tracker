import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
} from 'react-native';

import { ReauthentificatePopupProps } from '../../types/components';


const ReauthentificatePopup = (props: ReauthentificatePopupProps) => {
    const { 
        visible, 
        transparent, 
        message, 
        confirmationMessage,
        onRequestClose, 
        onSubmit, 
    } = props;
    const [password, setPassword] = useState<string>('');


    return (
        <Modal
        animationType="none"
        transparent={transparent}
        visible={visible}
        onRequestClose={onRequestClose}
        >
        <View style={styles.modalContainer}>
        <View style={styles.modalView}>
            <Text style={styles.modalText}>
            {message}
            </Text>
            <View style={styles.passwordContainer}>
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                style={styles.password}
                secureTextEntry
            />
            </View>
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onRequestClose}>
                <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => onSubmit(password)}>
                <Text style={styles.buttonText}>{confirmationMessage}</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
        </Modal>
    );
};

export default ReauthentificatePopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will fade the background
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
  },
  passwordContainer: {
    width: '95%',
    height: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  password: {
    height: '100%',
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  button: {
    width: '50%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
