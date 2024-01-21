import React from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';

import {YesNoPopupProps} from '../../types/components';

const YesNoPopup = (props: YesNoPopupProps) => {
  const {visible, transparent, onRequestClose, message, onYes} = props;

  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onRequestClose}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onYes}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default YesNoPopup;

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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '30%',
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
