import DismissKeyboard from '@components/Keyboard/DismissKeyboard';
import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  TextInput,
} from 'react-native';

export type InputTextPopupProps = {
  visible: boolean;
  transparent: boolean;
  message: string;
  confirmationMessage: string;
  placeholder: string;
  onRequestClose: () => void;
  onSubmit: (password: string) => void;
  keyboardType?: KeyboardTypeOptions | undefined;
  textContentType?: any; // Many options
  secureTextEntry?: boolean | undefined;
};

const InputTextPopup = (props: InputTextPopupProps) => {
  const {
    visible,
    transparent,
    message,
    confirmationMessage,
    placeholder,
    onRequestClose,
    onSubmit,
    keyboardType,
    textContentType,
    secureTextEntry,
  } = props;
  const [text, setText] = useState<string>('');

  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <DismissKeyboard>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{message}</Text>
            <View style={styles.textContainer}>
              <TextInput
                placeholder={placeholder}
                placeholderTextColor={'#a8a8a8'}
                value={text}
                onChangeText={text => setText(text)}
                style={styles.password}
                keyboardType={keyboardType}
                textContentType={textContentType}
                secureTextEntry={secureTextEntry}
              />
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => onSubmit(text)}>
                <Text style={styles.confirmButtonText}>
                  {confirmationMessage}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onRequestClose}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </DismissKeyboard>
    </Modal>
  );
};

export default InputTextPopup;

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
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
  },
  textContainer: {
    width: '100%',
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
    color: 'black',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 15,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    padding: 6,
    margin: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
