import React, {useEffect, useMemo, useReducer} from 'react';
import {ActivityIndicator, Alert, Image} from 'react-native'; // or 'react-native-web' if you're using React for web
import {FirebaseStorage} from 'firebase/storage';
import {getProfilePictureURL} from '@src/storage/storageProfile';
import useProfileImageCache from '@hooks/useProfileImageCache';
import CONST from '@src/CONST';

interface State {
  imageUrl: string | null;
  loadingImage: boolean;
  warning: string;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  imageUrl: null,
  loadingImage: true,
  warning: '',
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'SET_IMAGE_URL':
      return {...state, imageUrl: action.payload};
    case 'SET_LOADING_IMAGE':
      return {...state, loadingImage: action.payload};
    case 'SET_WARNING':
      return {...state, warning: action.payload};
    default:
      return state;
  }
};

type ProfileImageProps = {
  storage: FirebaseStorage;
  userId: string;
  downloadURL: string | null;
  style: any;
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userId, downloadURL, style} = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchImage = async () => {
      dispatch({type: 'SET_LOADING_IMAGE', payload: true});
      try {
        const url = downloadURL?.includes(CONST.FIREBASE_STORAGE_URL)
          ? await getProfilePictureURL(storage, userId, downloadURL) 
          : downloadURL;
        dispatch({type: 'SET_IMAGE_URL', payload: url});
      } catch (error: any) {
        Alert.alert('Error fetching the image', error.message);
        // handleErrors(
        //   error,
        //   'Error fetching the image',
        //   error.message,
        //   dispatch,
        // );
      } finally {
        dispatch({type: 'SET_LOADING_IMAGE', payload: false});
      }
    };

    fetchImage();
  }, [downloadURL]);

  if (state.loadingImage)
    return <ActivityIndicator size="large" color="#0000ff" style={style} />;

  return (
    <Image
      source={
        state.imageUrl && state.imageUrl !== CONST.NO_IMAGE
          ? {uri: state.imageUrl}
          : require('../../assets/temp/user.png')
      }
      style={style}
    />
  );
}

export default ProfileImage;
