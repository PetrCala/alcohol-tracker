import DismissKeyboard from '@components/Keyboard/DismissKeyboard';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {useFirebase} from '@context/global/FirebaseContext';
import {UserID} from '@src/types/onyx';
import {User, sendEmailVerification} from 'firebase/auth';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

export type VerifyEmailPopupProps = {
  visible: boolean;
  onRequestClose: () => void;
};

const VerifyEmailPopup = (props: VerifyEmailPopupProps) => {
  const {visible, onRequestClose} = props;
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const email = user?.email;
  const emailVerified = user?.emailVerified;
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmailPress = async () => {
    if (!email) {
      Alert.alert('Error', 'No email found');
      return;
    }
    if (emailVerified) {
      Alert.alert('Already verified', 'Your email is already verified');
      return;
    }
    try {
      setSendingEmail(true);
      await sendEmailVerification(user);
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCloseModal = () => {
    setEmailSent(false);
    onRequestClose();
  };

  useEffect(() => {
    // Perhaps an animation?
    handleCloseModal();
  }, [user?.emailVerified]);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <View style={styles.buttonsContainer}>
            {emailSent ? (
              <Text
                style={
                  styles.emailSentText
                }>{`A verification email has been sent to\n${email}`}</Text>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.sendButton}
                onPress={handleSendEmailPress}>
                {sendingEmail ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <Text style={styles.sendButtonText}>
                    Send a verification email
                  </Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.cancelButton}
              onPress={handleCloseModal}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    padding: 15,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 5,
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailSentText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifyEmailPopup;
