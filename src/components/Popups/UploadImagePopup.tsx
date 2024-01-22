import {UploadImagePopupProps} from '@src/types/components';
import {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const UploadImagePopup = (props: UploadImagePopupProps) => {
  const {
    imageSource,
    visible,
    transparent,
    message,
    onRequestClose,
    onSubmit,
    uploadProgress,
  } = props;
  const [uploadOngoing, setUploadOngoing] = useState<boolean>(false);
  const [uploadFinished, setUploadFinished] = useState<boolean>(false);

  const ConfirmationWindow: React.FC = () => {
    return (
      <>
        <Text style={styles.modalText}>{message}</Text>
        {imageSource && (
          <Image source={{uri: imageSource}} style={styles.image} />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onRequestClose}>
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setUploadOngoing(true);
              //   onSubmit;
            }}>
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const UploadWindow: React.FC = () => {
    const handleCancelUpload = () => {
      console.log('cancelling upload...');
      setUploadOngoing(false);
      onRequestClose();
    };

    return (
      <>
        <Text style={styles.modalText}>Upload in progress...</Text>
        {/* {imageSource && (
          <Image source={{uri: imageSource}} style={styles.image} />
        )} */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleCancelUpload}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const UploadFinishedWindow: React.FC = () => {
    return null;
  };

  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          {uploadFinished ? (
            <UploadFinishedWindow />
          ) : uploadOngoing ? (
            <UploadWindow />
          ) : (
            <ConfirmationWindow />
          )}
        </View>
      </View>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const imageSize = screenWidth > screenHeight ? screenHeight : screenWidth;

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
  image: {
    width: imageSize * 0.5,
    height: imageSize * 0.5,
    marginBottom: 10,
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

export default UploadImagePopup;
