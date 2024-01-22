import React, {useReducer, useState} from 'react';
import {Button, Image, View, Text, Alert} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {FirebaseStorage} from 'firebase/storage';
import {uploadImageToFirebase} from '../storage/storageUpload';
import {handleErrors} from '@src/utils/errorHandling';

interface State {
  imageSource: string | null;
  uploadProgress: number | null;
  warning: string;
  success: string;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  imageSource: null,
  uploadProgress: null,
  warning: '',
  success: '',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IMAGE_SOURCE':
      return {...state, imageSource: action.payload};
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
};

const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  storage,
  pathToUpload,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
        await uploadImageToFirebase(
          storage,
          source.uri,
          pathToUpload,
          dispatch, // Handle errors inside the function
        );
        dispatch({type: 'SET_IMAGE_SOURCE', payload: source.uri});
      }
    });
  };

  console.log('Upload progress:', state.uploadProgress);
  // console.log('Warning:', state.warning);
  // console.log('Success:', state.success);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Choose Image" onPress={chooseImage} />

      {state.imageSource && (
        <Image
          source={{uri: state.imageSource}}
          style={{width: 100, height: 100}}
        />
      )}

      {/* {uploadProgress && <Text>Progress: {uploadProgress}%</Text>} */}
    </View>
  );
};

export default UploadImageComponent;
