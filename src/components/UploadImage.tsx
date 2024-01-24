import React, {useReducer, useState} from 'react';
import {
  Button,
  Image,
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Image as CompressorImage } from 'react-native-compressor';
import {FirebaseStorage} from 'firebase/storage';
import {uploadImageToFirebase} from '../storage/storageUpload';
import {handleErrors} from '@src/utils/errorHandling';
import WarningMessage from './Info/WarningMessage';
import SuccessMessage from './Info/SuccessMessage';
import UploadImagePopup from './Popups/UploadImagePopup';
import { UploadImageState } from '@src/types/components';
import { GeneralAction } from '@src/types/states';


const initialState: UploadImageState = {
  imageSource: null,
  uploadModalVisible: false,
  compressionOngoing: false,
  compressionProgress: null,
  uploadProgress: null,
  uploadOngoing: false,
  warning: '',
  success: '',
};

const reducer = (state: UploadImageState, action: GeneralAction): UploadImageState => {
  switch (action.type) {
    case 'SET_IMAGE_SOURCE':
      return {...state, imageSource: action.payload};
    case 'SET_UPLOAD_MODAL_VISIBLE':
      return {...state, uploadModalVisible: action.payload};
    case 'COMPRESSION_ONGOING':
      return {...state, compressionOngoing: action.payload};
    case 'COMPRESSION_PROGRESS':
      return {...state, compressionProgress: action.payload};
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
  storage: FirebaseStorage;
  pathToUpload: string;
  imageSource: NodeRequire;
  imageStyle: any;
  setImageSource: (newUrl: string) => void;
};

const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  storage,
  pathToUpload,
  imageSource,
  imageStyle,
  setImageSource,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const compressImage = async (sourceURI: string): Promise<string> => {
    dispatch({ type: 'COMPRESSION_ONGOING', payload: true });

    try {
      await CompressorImage.compress(sourceURI, {
        progressDivider: 10,
        downloadProgress: (progress) => {
          dispatch({ type: 'COMPRESSION_PROGRESS', payload: progress });
        },
      });

      dispatch({ type: 'COMPRESSION_ONGOING', payload: false });
      return sourceURI; // Return the compressed image URI
    } catch (error: any) {
      dispatch({ type: 'COMPRESSION_ONGOING', payload: false });
      handleErrors(error, 'Error during image compression', error.message, dispatch);
      throw error; // Rethrow the error to be handled by the caller
    }
  };

  const uploadImage = async (sourceURI: string) => {
    dispatch({ type: 'SET_UPLOAD_ONGOING', payload: true });

    try {
      await uploadImageToFirebase(storage, sourceURI, pathToUpload, dispatch);
    } catch (error: any) {
      handleErrors(error, 'Error uploading image', error.message, dispatch);
      throw error; // Rethrow the error to be handled by the caller
    } finally {
      dispatch({ type: 'SET_UPLOAD_ONGOING', payload: false });
    }
  };

  const handleUpload = async (sourceURI: string | null) => {
    if (!sourceURI) {
      dispatch({ type: 'SET_WARNING', payload: 'No image selected' });
      return;
    }
    
    try {
      const compressedURI = await compressImage(sourceURI);
      await uploadImage(compressedURI);
    } catch (error:any) {
      dispatch({ type: 'SET_IMAGE_SOURCE', payload: null });
      handleErrors(error, 'Error uploading image', error.message, dispatch);
    }
  };

  const chooseImage = () => {
    // Ask for permissions here

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
    };

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

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={chooseImage} style={styles.button}>
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
    backgroundColor: 'blue',
    zIndex: 1,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
