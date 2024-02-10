import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import {FirebaseStorage} from 'firebase/storage';
import {getProfilePictureURL} from '@src/storage/storageProfile';
import useProfileImageCache from '@hooks/useProfileImageCache';
import CONST from '@src/CONST';
import EnlargableImage from './Buttons/EnlargableImage';

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
  downloadPath: string | null | undefined;
  style: any;
  refreshTrigger?: number; // Likely a number, used to force a refresh
  enlargable?: boolean;
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userId, downloadPath, style, refreshTrigger} = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const {cachedUrl, cacheImage, isCacheChecked} = useProfileImageCache(userId);
  const prevCachedUrl = useRef(cachedUrl); // Crucial
  const initialDownloadPath = useRef(downloadPath); //

  const imageSource: ImageSourcePropType =
    state.imageUrl && state.imageUrl !== CONST.NO_IMAGE
      ? {uri: state.imageUrl}
      : require('@assets/temp/user.png');

  const checkAvailableCache = async (url: string | null): Promise<boolean> => {
    if (downloadPath?.startsWith(CONST.LOCAL_IMAGE_PREFIX)) {
      // Is a local file
      dispatch({type: 'SET_IMAGE_URL', payload: downloadPath});
      dispatch({type: 'SET_LOADING_IMAGE', payload: false});
      return true;
    }
    if (
      // Do not merge these two if statements (order matters)
      url &&
      url === prevCachedUrl.current &&
      downloadPath === initialDownloadPath.current && // Only if the download path has not changed
      !refreshTrigger // Only if the refresh trigger is not set
    ) {
      // Use cache if available and unchanged
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
          // if (downloadPath === initialDownloadPath.current) // If the input download path has not changed
          downloadUrl = await getProfilePictureURL(
            storage,
            userId,
            downloadPath,
          );
          await cacheImage(downloadUrl);
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
  }, [downloadPath, cachedUrl, isCacheChecked, refreshTrigger]);

  if (state.loadingImage)
    return <ActivityIndicator size="large" color="#0000ff" style={style} />;

  return props.enlargable ? (
    <EnlargableImage imageSource={imageSource} imageStyle={style} />
  ) : (
    <Image source={imageSource} style={style} />
  );
}

export default ProfileImage;
