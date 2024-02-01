import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
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
  downloadPath: string | null;
  style: any;
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userId, downloadPath, style} = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const {cachedUrl, cacheImage, isCacheChecked} = useProfileImageCache(userId);
  const prevCachedUrl = useRef(cachedUrl); // Crucial

  const checkAvailableCache = async (url: string | null): Promise<boolean> => {
    if (downloadPath?.startsWith(CONST.LOCAL_IMAGE_PREFIX)) {
      // Is a local file
      dispatch({type: 'SET_IMAGE_URL', payload: downloadPath});
      dispatch({type: 'SET_LOADING_IMAGE', payload: false});
      return true;
    }
    if (url && url === prevCachedUrl.current) {
      dispatch({type: 'SET_IMAGE_URL', payload: cachedUrl});
      dispatch({type: 'SET_LOADING_IMAGE', payload: false});
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchImage = async () => {
      if (!isCacheChecked) return; // Only proceed if cache has been checked

      const cacheUnchanged = await checkAvailableCache(cachedUrl);
      if (cacheUnchanged) return; // Use cache if available and unchanged

      dispatch({type: 'SET_LOADING_IMAGE', payload: true});
      try {
        let downloadUrl: string | null = null;
        if (downloadPath?.includes(CONST.FIREBASE_STORAGE_URL)) {
          downloadUrl = await getProfilePictureURL(
            storage,
            userId,
            downloadPath,
          );
          if (downloadUrl !== downloadPath) {
            await cacheImage(downloadUrl);
          }
        }

        dispatch({type: 'SET_IMAGE_URL', payload: downloadUrl});
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
    prevCachedUrl.current = cachedUrl;
  }, [downloadPath, cachedUrl, isCacheChecked]);

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
