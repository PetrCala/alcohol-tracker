import AsyncStorage from '@react-native-async-storage/async-storage';
import CONST from '@src/CONST';
import {auth} from '@src/services/firebaseSetup';
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
  const {visible, transparent, onRequestClose, parentState, parentDispatch} =
    props;
  const user = auth.currentUser;
  const [uploadFinished, setUploadFinished] = useState<boolean>(false);

  const UploadWindow: React.FC = () => {
    return (
      <>
        <Text style={styles.modalText}>Uploading image...</Text>
        <Text style={styles.uploadText}>{parentState.uploadProgress}</Text>
      </>
    );
  };

  const UploadFinishedWindow: React.FC = () => {
    const handleUploadFinishConfirm = () => {
      setUploadFinished(false);
      onRequestClose();
    };

    return (
      <>
        <Text style={styles.modalText}>Upload finished!</Text>
        <View style={styles.uploadFinishedContainer}>
          <Image
            source={CONST.ICONS.CHECK}
            style={styles.uploadFinishedImage}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleUploadFinishConfirm}>
            <Text style={styles.buttonText}>Great!</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  useEffect(() => {
    const updateInfoUponUpload = async () => {
      if (
        parentState.uploadProgress &&
        parentState.uploadProgress.includes('100') &&
        user
      ) {
        await AsyncStorage.removeItem(
          CONST.CACHE.PROFILE_PICTURE_KEY + user.uid,
        );
        setUploadFinished(true);
        parentDispatch({type: 'SET_UPLOAD_ONGOING', payload: false});
      }
    };

    updateInfoUponUpload();
  }, [parentState.uploadProgress]);

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
          ) : parentState.uploadOngoing ? (
            <UploadWindow />
          ) : null}
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
    borderRadius: imageSize * 0.25,
    marginBottom: 10,
  },
  uploadText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 23,
    fontWeight: 'bold',
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
  cancelButton: {
    width: 140, // For cancel upload text
  },
  uploadFinishedContainer: {
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadFinishedImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
});

export default UploadImagePopup;
