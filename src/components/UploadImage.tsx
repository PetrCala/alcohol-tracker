import React, {useReducer} from 'react';
import {
  Image,
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
// import {
//   ImageLibraryOptions,
//   launchImageLibrary,
// } from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {Image as CompressorImage} from 'react-native-compressor';
import {uploadImageToFirebase} from '../storage/storageUpload';
import WarningMessage from './Info/WarningMessage';
import SuccessMessage from './Info/SuccessMessage';
import UploadImagePopup from './Popups/UploadImagePopup';
import {UploadImageState} from '@src/types/components';
import {GeneralAction} from '@src/types/states';
import checkPermission from '@src/permissions/checkPermission';
import {requestPermission} from '@src/permissions/requestPermission';
import {updateProfileInfo} from '@database/profile';
import {auth} from '@src/services/firebaseSetup';
import {useFirebase} from '@src/context/global/FirebaseContext';

const initialState: UploadImageState = {
  imageSource: null,
  uploadModalVisible: false,
  uploadProgress: null,
  uploadOngoing: false,
  warning: '',
  success: '',
};

const reducer = (
  state: UploadImageState,
  action: GeneralAction,
): UploadImageState => {
  switch (action.type) {
    case 'SET_IMAGE_SOURCE':
      return {...state, imageSource: action.payload};
    case 'SET_UPLOAD_MODAL_VISIBLE':
      return {...state, uploadModalVisible: action.payload};
    case 'SET_UPLOAD_ONGOING':
      return {...state, uploadOngoing: action.payload};
    case 'SET_UPLOAD_PROGRESS':
      return {...state, uploadProgress: action.payload};
    case 'SET_WARNING':
      return {...state, warning: action.payload};
    case 'SET_SUCCESS':
      return {...state, success: action.payload};
    default:
      return state;
  }
};

type UploadImageComponentProps = {
  pathToUpload: string;
  imageSource: ImageSourcePropType;
  imageStyle: any;
  isProfilePicture: boolean;
};

const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  pathToUpload,
  imageSource,
  imageStyle,
  isProfilePicture = false,
}) => {
  const user = auth.currentUser;
  const {db, storage} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUpload = async (sourceURI: string | null) => {
    if (!sourceURI) {
      dispatch({type: 'SET_WARNING', payload: 'No image selected'});
      return;
    }

    try {
      dispatch({type: 'SET_UPLOAD_ONGOING', payload: true});
      const compressedURI = await CompressorImage.compress(sourceURI);
      await uploadImageToFirebase(
        storage,
        compressedURI,
        pathToUpload,
        dispatch,
      ); // Wait for the promise to resolve
      if (isProfilePicture) {
        await updateProfileInfo(pathToUpload, user, auth, db, storage);
      }
    } catch (error: any) {
      dispatch({type: 'SET_UPLOAD_ONGOING', payload: false}); // Otherwise dispatch upon success in child component
      dispatch({type: 'SET_IMAGE_SOURCE', payload: null});
      Alert.alert('Image upload error', error.message);
      // handleErrors(error, 'Error uploading image', error.message, dispatch); // Use after popup alerts have been implemented
    }
  };

  const chooseImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      cropperCircleOverlay: true, // could use isProfilePicture
      cropperToolbarTitle: 'Crop the image',
      compressImageQuality: 0.8,
      writeTempFile: true,
      mediaType: 'photo',
    })
      .then((image: any) => {
        const source = {uri: image.path};
        if (!source) {
          Alert.alert('Error', 'Could not fetch the image. Please try again.');
          // dispatch({
          //   type: 'SET_WARNING',
          //   payload: 'Could not fetch the image. Please try again.',
          // });
          return;
        }
        dispatch({type: 'SET_UPLOAD_MODAL_VISIBLE', payload: true});
        dispatch({type: 'SET_IMAGE_SOURCE', payload: source.uri});
      })
      .catch((error: any) => {
        // TODO add clever error handling
        if ('User cancelled image selection' === error.message) return;
        Alert.alert('Error choosing image', error.message);
        // dispatch({type: 'SET_WARNING', payload: error.message});
      });
  };

  const handleChooseImagePress = async () => {
    try {
      // Check for permissions
      const permissionAllowed = await checkPermission('read_photos');
      if (!permissionAllowed) {
        const permissionGranted = await requestPermission('read_photos');
        if (!permissionGranted) {
          return; // Permission denied - info message automatically handled by requestPermission
        }
      }
      await chooseImage(); // Call automatically
      resetIndicators(); // Clean the indicators for upload
    } catch (error: any) {
      Alert.alert('Error choosing image', error.message);
    }
  };

  const resetIndicators = () => {
    dispatch({type: 'SET_UPLOAD_ONGOING', payload: false});
    dispatch({type: 'SET_UPLOAD_PROGRESS', payload: null});
    dispatch({type: 'SET_WARNING', payload: ''});
    dispatch({type: 'SET_SUCCESS', payload: ''});
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChooseImagePress} style={styles.button}>
        <Image source={imageSource as any} style={imageStyle} />
      </TouchableOpacity>

      {state.imageSource && (
        <UploadImagePopup
          imageSource={state.imageSource}
          visible={state.uploadModalVisible}
          transparent={true}
          message={'Do you want to upload this image?'}
          onRequestClose={() =>
            dispatch({type: 'SET_UPLOAD_MODAL_VISIBLE', payload: false})
          }
          onSubmit={() => handleUpload(state.imageSource)}
          parentState={state}
          parentDispatch={dispatch}
        />
      )}
      <WarningMessage warningText={state.warning} dispatch={dispatch} />
      <SuccessMessage successText={state.success} dispatch={dispatch} />
    </View>
  );
};

export default UploadImageComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
});
