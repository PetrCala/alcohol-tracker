import React, {useEffect, useRef, useState} from 'react';
import type {ImageSourcePropType, LayoutChangeEvent} from 'react-native';
import {Image} from 'react-native';
import type {FirebaseStorage} from 'firebase/storage';
import getProfilePictureURL from '@src/storage/storageProfile';
import useProfileImageCache from '@hooks/useProfileImageCache';
import CONST from '@src/CONST';
import type ImageLayout from '@src/types/various/ImageLayout';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as KirokuIcons from './Icon/KirokuIcons';
import EnlargableImage from './Buttons/EnlargableImage';
import FlexibleLoadingIndicator from './FlexibleLoadingIndicator';
import ERRORS from '@src/ERRORS';

type ProfileImageProps = {
  storage: FirebaseStorage;
  userID: string;
  downloadPath: string | null | undefined;
  style: any;
  refreshTrigger?: number; // Likely a number, used to force a refresh
  enlargable?: boolean;
  layout?: ImageLayout;
  onLayout?: (event: LayoutChangeEvent) => void;
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userID, downloadPath, style} = props;
  const {cachedUrl, cacheImage, isCacheChecked} = useProfileImageCache(userID);
  const prevCachedUrl = useRef(cachedUrl); // Crucial
  const initialDownloadPath = useRef(downloadPath);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(true);
  const [warning, setWarning] = useState<string>('');

  const imageSource: ImageSourcePropType =
    imageUrl && imageUrl !== CONST.NO_IMAGE
      ? {uri: imageUrl}
      : KirokuIcons.UserIcon;

  const checkAvailableCache = async (url: string | null): Promise<boolean> => {
    if (downloadPath?.startsWith(CONST.LOCAL_IMAGE_PREFIX)) {
      // Is a local file
      setImageUrl(downloadPath);
      setLoadingImage(false);
      return true;
    }
    if (
      // Do not merge these two if statements (order matters)
      url &&
      url === prevCachedUrl.current &&
      downloadPath === initialDownloadPath.current && // Only if the download path has not changed
      !props.refreshTrigger // Only if the refresh trigger is not set
    ) {
      // Use cache if available and unchanged
      setImageUrl(cachedUrl);
      setLoadingImage(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchImage = async () => {
      if (!isCacheChecked) {
        return;
      } // Only proceed if cache has been checked

      const cacheUnchanged = await checkAvailableCache(cachedUrl);
      if (cacheUnchanged) {
        return;
      } // Use cache if available and unchanged

      setLoadingImage(true);
      try {
        let downloadUrl: string | null = null;
        if (downloadPath?.includes(CONST.FIREBASE_STORAGE_URL)) {
          // if (downloadPath === initialDownloadPath.current) // If the input download path has not changed
          downloadUrl = await getProfilePictureURL(
            storage,
            userID,
            downloadPath,
          );
          await cacheImage(downloadUrl);
        }

        setImageUrl(downloadUrl);
      } catch (error) {
        ErrorUtils.raiseAppError(ERRORS.IMAGE_UPLOAD.FETCH_FAILED, error);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
    prevCachedUrl.current = cachedUrl;
  }, [downloadPath, cachedUrl, isCacheChecked]); // add props.refreshTrigger if necessary

  if (loadingImage) {
    return <FlexibleLoadingIndicator style={[style, {flex: 0}]} />;
  }
  if (!props.enlargable) {
    return <Image source={imageSource} style={style} />;
  }
  if (!props.layout || !props.onLayout) {
    return;
  }

  return (
    <EnlargableImage
      imageSource={imageSource}
      imageStyle={style}
      imageLayout={props.layout}
      onImageLayout={props.onLayout}
    />
  );
}

export default ProfileImage;
