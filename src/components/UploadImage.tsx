import React, {useReducer} from 'react';
import {
  Image,
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {Image as CompressorImage} from 'react-native-compressor';
import {FirebaseStorage, getDownloadURL, ref} from 'firebase/storage';
import {uploadImageToFirebase} from '../storage/storageUpload';
import {handleErrors} from '@src/utils/errorHandling';
import WarningMessage from './Info/WarningMessage';
import SuccessMessage from './Info/SuccessMessage';
import UploadImagePopup from './Popups/UploadImagePopup';
import {UploadImageState} from '@src/types/components';
import {GeneralAction} from '@src/types/states';
import {checkPermission} from '@src/permissions/checkPermission';
import {requestPermission} from '@src/permissions/requestPermission';
import {setProfilePictureURL, updateProfileInfo} from '@database/profile';
import {auth} from '@src/services/firebaseSetup';
import {useFirebase} from '@src/context/FirebaseContext';
import {updateProfile} from 'firebase/auth';
import path from 'path';

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
  setImageSource: (newUrl: string) => void;
  isProfilePicture: boolean;
};

const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  pathToUpload,
  imageSource,
  imageStyle,
  setImageSource,
  isProfilePicture = false,
}) => {
  const user = auth.currentUser;
  const {db, storage} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const uploadImage = async (sourceURI: string) => {
    try {
      await uploadImageToFirebase(storage, sourceURI, pathToUpload, dispatch);
    } catch (error: any) {
      handleErrors(error, 'Error uploading image', error.message, dispatch);
      throw error; // Rethrow the error to be handled by the caller
    }
  };

  const handleUpload = async (sourceURI: string | null) => {
    if (!sourceURI) {
      dispatch({type: 'SET_WARNING', payload: 'No image selected'});
      return;
    }

    try {
      dispatch({type: 'SET_UPLOAD_ONGOING', payload: true});
      const compressedURI = await CompressorImage.compress(sourceURI);
      await uploadImage(compressedURI);
      if (isProfilePicture) {
        await updateProfileInfo(pathToUpload, user, auth, db, storage);
      }
    } catch (error: any) {
      dispatch({type: 'SET_UPLOAD_ONGOING', payload: false}); // Otherwise dispatch upon success in child component
      dispatch({type: 'SET_IMAGE_SOURCE', payload: null});
      handleErrors(error, 'Error uploading image', error.message, dispatch);
    }
  };

  const chooseImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
    };

    // Assume granted permissions
    launchImageLibrary(options, async (response: any) => {
      if (response.didCancel) {
        // console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('ImagePicker Error', response.errorMessage);
      } else {
        const source = {uri: response.assets[0].uri};
        if (!source) {
          dispatch({
            type: 'SET_WARNING',
            payload: 'Could not fetch the image. Please try again.',
          });
          return;
        }
        dispatch({type: 'SET_UPLOAD_MODAL_VISIBLE', payload: true});
        dispatch({type: 'SET_IMAGE_SOURCE', payload: source.uri});
      }
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
          setImageSource={setImageSource}
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
