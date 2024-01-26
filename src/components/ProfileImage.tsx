import React, {useEffect, useMemo, useReducer} from 'react';
import {ActivityIndicator, Alert, Image} from 'react-native'; // or 'react-native-web' if you're using React for web
import {FirebaseStorage} from 'firebase/storage';
import {getProfilePictureURL} from '../storage/storageProfile';
import {handleErrors} from '../utils/errorHandling';
import {useFirebase} from '@src/context/FirebaseContext';
import {readDataOnce} from '@database/baseFunctions';

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
  style: any;
  localImageSource?: string; // If the user has uploaded a new image, use this instead of the one in the database, so that the user can see the new image immediately without any listeners
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userId, style} = props;
  const db = useFirebase().db;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({type: 'SET_LOADING_IMAGE', payload: true});

    const fetchImage = async () => {
      try {
        const downloadURL = await readDataOnce(
          db,
          `users/${userId}/profile/photo_url`,
        );
        const url = await getProfilePictureURL(storage, userId, downloadURL);
        if (url) {
          dispatch({type: 'SET_IMAGE_URL', payload: url});
        }
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
  }, []);

  useEffect(() => {
    if (props.localImageSource) {
      dispatch({type: 'SET_IMAGE_URL', payload: props.localImageSource});
    }
  }, [props.localImageSource]);

  if (state.loadingImage)
    return <ActivityIndicator size="large" color="#0000ff" style={style} />;

  return (
    <Image
      source={
        state.imageUrl
          ? {uri: state.imageUrl}
          : require('../../assets/temp/user.png')
      }
      style={style}
    />
  );
}

export default ProfileImage;
