import AsyncStorage from '@react-native-async-storage/async-storage';
import CONST from '@src/CONST';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
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
import {useFirebase} from '@context/global/FirebaseContext';
import useThemeStyles from '@hooks/useThemeStyles';

type UploadImagePopupProps = {
  visible: boolean;
  transparent: boolean;
  onRequestClose: () => void;
  uploadProgress: string | null;
  uploadOngoing: boolean;
  onUploadFinish: () => void;
};

function UploadImagePopup({
  visible,
  transparent,
  onRequestClose,
  uploadProgress,
  uploadOngoing,
  onUploadFinish,
}: UploadImagePopupProps) {
  const {auth} = useFirebase();
  const styles = useThemeStyles();
  const user = auth.currentUser;
  const [uploadFinished, setUploadFinished] = useState<boolean>(false);

  const UploadWindow: React.FC = () => {
    return (
      <>
        <Text style={localStyles.modalText}>Uploading image...</Text>
        <Text style={localStyles.uploadText}>{uploadProgress}</Text>
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
        <Text style={localStyles.modalText}>Upload finished!</Text>
        <View style={localStyles.uploadFinishedContainer}>
          <Image
            source={KirokuIcons.Check}
            style={localStyles.uploadFinishedImage}
          />
        </View>
        <View style={localStyles.buttonContainer}>
          <TouchableOpacity
            accessibilityRole="button"
            style={localStyles.button}
            onPress={handleUploadFinishConfirm}>
            <Text style={localStyles.buttonText}>Great!</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  useEffect(() => {
    const updateInfoUponUpload = async () => {
      if (uploadProgress && uploadProgress.includes('100') && user) {
        await AsyncStorage.removeItem(
          CONST.CACHE.PROFILE_PICTURE_KEY + user.uid,
        );
        setUploadFinished(true);
        onUploadFinish();
      }
    };

    updateInfoUponUpload();
  }, [uploadProgress]);

  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={localStyles.modalContainer}>
        <View style={[localStyles.modalView, styles.appBG]}>
          {uploadFinished ? (
            <UploadFinishedWindow />
          ) : uploadOngoing ? (
            <UploadWindow />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const imageSize = screenWidth > screenHeight ? screenHeight : screenWidth;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will fade the background
  },
  modalView: {
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
