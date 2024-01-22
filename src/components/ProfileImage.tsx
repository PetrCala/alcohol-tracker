import React, {useEffect, useMemo, useReducer} from 'react';
import {ActivityIndicator, Image} from 'react-native'; // or 'react-native-web' if you're using React for web
import {FirebaseStorage} from 'firebase/storage';
import {getProfilePictureURL} from '../storage/storageProfile';
import {handleErrors} from '../utils/errorHandling';

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
  photoURL: string;
  style: any;
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userId, photoURL, style} = props;
  const [state, dispatch] = useReducer(reducer, initialState);

 useEffect(() => {
    let mounted = true;
    dispatch({ type: 'SET_LOADING_IMAGE', payload: true });

    const fetchImage = async () => {
      try {
        const url = await getProfilePictureURL(storage, userId, photoURL);
        if (mounted && url) {
          dispatch({ type: 'SET_IMAGE_URL', payload: url });
        }
      } catch (error:any) {
        if (mounted) {
          handleErrors(error, 'Error fetching the image', error.message, dispatch);
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_LOADING_IMAGE', payload: false });
        }
      }
    };

    fetchImage();

    return () => {
      mounted = false;
    };
  }, [userId, photoURL]);

  if (state.loadingImage)
    return <ActivityIndicator size="large" color="#0000ff" style={style} />;

  return (
    <Image
      source={
        state.imageUrl
          // ? {uri: state.imageUrl}
          ? {uri: photoURL}
          // : require('../../assets/temp/user.png')
          : {uri: photoURL}
          // Change this so that this points to the correct source
      }
      style={style}
    />
  );
}

export default ProfileImage;
