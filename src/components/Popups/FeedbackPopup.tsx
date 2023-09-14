import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
} from 'react-native';

import { FeedbackPopupProps } from '../../types/components';


const FeedbackPopup = (props: FeedbackPopupProps) => {
  const { 
    visible, 
    transparent, 
    message, 
    onRequestClose, 
    onSubmit
} = props;
  const [feedbackText, setFeedbackText] = useState<string>('');

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
        <View style={styles.feedbackWindowContainer}>
            <TextInput
                style={styles.feedbackWindowText}
                onChangeText={setFeedbackText}
                placeholder={"Write your feedback here"}
                placeholderTextColor={"grey"}
                keyboardType="default"
                maxLength={1000}
                multiline={true}
            />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onRequestClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => onSubmit(feedbackText)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </Modal>
  );
};

export default FeedbackPopup;

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
  feedbackWindowContainer: {
    height: 300,
    width: 250,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  feedbackWindowText: {
    height: '100%',
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    textAlignVertical: 'top',
    margin: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  button: {
    width: '40%',
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
