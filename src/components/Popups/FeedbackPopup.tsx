import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import DismissKeyboard from '@components/Keyboard/DismissKeyboard';

type FeedbackPopupProps = {
  visible: boolean;
  transparent: boolean;
  message: string;
  onRequestClose: () => void;
  onSubmit: (feedback: string) => void;
};

const FeedbackPopup = (props: FeedbackPopupProps) => {
  const {visible, transparent, message, onRequestClose, onSubmit} = props;
  const [feedbackText, setFeedbackText] = useState<string>('');

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
            <View style={styles.feedbackWindowContainer}>
              <TextInput
                style={styles.feedbackWindowText}
                onChangeText={setFeedbackText}
                placeholder={'Write your feedback here'}
                placeholderTextColor={'#a8a8a8'}
                keyboardType="default"
                maxLength={1000}
                multiline={true}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => onSubmit(feedbackText)}>
                <Text style={styles.confirmButtonText}>Submit</Text>
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will fade the background
  },
  modalView: {
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    elevation: 5,
    paddingTop: 15,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
  },
  feedbackWindowContainer: {
    height: 300,
    width: 250,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    backgroundColor: 'white',
    margin: 15,
  },
  feedbackWindowText: {
    height: '100%',
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    textAlignVertical: 'top',
    margin: 12,
    color: 'black',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  confirmButton: {
    width: 150,
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: 150,
    backgroundColor: '#ffff99',
    padding: 6,
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedbackPopup;
