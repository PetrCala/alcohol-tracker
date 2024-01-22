import React, {useReducer, useState} from 'react';
import {Button, Image, View, Text, Alert} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {FirebaseStorage} from 'firebase/storage';
import {uploadImageToFirebase} from '../storage/storageUpload';
import {handleErrors} from '@src/utils/errorHandling';
import WarningMessage from './Info/WarningMessage';
import SuccessMessage from './Info/SuccessMessage';
import UploadImagePopup from './Popups/UploadImagePopup';

interface State {
  imageSource: string | null;
  uploadModalVisible: boolean;
  uploadProgress: string | null;
  warning: string;
  success: string;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  imageSource: null,
  uploadModalVisible: false,
  uploadProgress: null,
  warning: '',
  success: '',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IMAGE_SOURCE':
      return {...state, imageSource: action.payload};
    case 'SET_UPLOAD_MODAL_VISIBLE':
      return {...state, uploadModalVisible: action.payload};
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
  onSuccess: () => void; // Set the parent component state
};

const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  storage,
  pathToUpload,
  onSuccess,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUpload = async (sourceURI: string | null) => {
    console.log('starting upload...')
    console.log("sourceURI:", sourceURI)
    if (!sourceURI) {
      dispatch({type: 'SET_WARNING', payload: 'No image selected'});
      return;
    }
    dispatch({type: 'SET_UPLOAD_ONGOING', payload: true});
    try {
      await uploadImageToFirebase(
        storage,
        sourceURI,
        pathToUpload,
        dispatch, // Handle errors inside the function
      );
    } catch (error: any) {
      handleErrors(error, 'Error uploading image', error.message, dispatch);
      dispatch({type: 'SET_IMAGE_SOURCE', payload: null})
    } finally {
      dispatch({type: 'SET_UPLOAD_PROGRESS', payload: 0});
      dispatch({type: 'SET_UPLOAD_ONGOING', payload: false});
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
          dispatch({type: 'SET_WARNING', payload: 'Could not fetch the image. Please try again.'})
          return;
        }
        dispatch({type: 'SET_UPLOAD_MODAL_VISIBLE', payload: true});
        dispatch({type: 'SET_IMAGE_SOURCE', payload: source.uri});
      }
    });
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Choose Image" onPress={chooseImage} />

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
          uploadProgress={state.uploadProgress}
          onSuccess={onSuccess}
        />
      )}
      <WarningMessage warningText={state.warning} dispatch={dispatch} />
      <SuccessMessage successText={state.success} dispatch={dispatch} />
    </View>
  );
};

export default UploadImageComponent;
