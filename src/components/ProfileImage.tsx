import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type {FirebaseStorage} from 'firebase/storage';
import getProfilePictureURL from '@src/storage/storageProfile';
import useProfileImageCache from '@hooks/useProfileImageCache';
import CONST from '@src/CONST';
import * as ErrorUtils from '@libs/ErrorUtils';
import ERRORS from '@src/ERRORS';
import useTheme from '@hooks/useTheme';
import Image from './Image';
import * as KirokuIcons from './Icon/KirokuIcons';
import FlexibleLoadingIndicator from './FlexibleLoadingIndicator';
import EnlargableImage from './Buttons/EnlargableImage';

type ProfileImageProps = {
  storage: FirebaseStorage;
  userID: string;
  downloadPath: string | null | undefined;
  style: StyleProp<ImageStyle>;
  refreshTrigger?: number; // Likely a number, used to force a refresh
  enlargable?: boolean;
};

function ProfileImage({
  storage,
  userID,
  downloadPath,
  style,
  refreshTrigger,
  enlargable,
}: ProfileImageProps) {
  const theme = useTheme();
  const {cachedUrl, cacheImage, isCacheChecked} = useProfileImageCache(userID);
  const prevCachedUrl = useRef(cachedUrl); // Likely, the cache won't be available here yet, so we make sure to update it later
  const initialDownloadPath = useRef(downloadPath);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(true);
  const [cacheFound, setCacheFound] = useState<boolean>(false);

  const imageSource: ImageSourcePropType =
    imageUrl && imageUrl !== CONST.NO_IMAGE
      ? {uri: imageUrl}
      : KirokuIcons.UserIcon;
  const iconTint =
    imageSource && typeof imageSource === 'object' && 'uri' in imageSource
      ? undefined // The source is an URI link
      : theme.icon; // No source given, use default

  /**
   * Checks if a cached version is available and still valid.
   * If valid, sets the image URL from cache and ends loading.
   * Returns `true` if a valid cache was used, `false` otherwise.
   */
  const checkAvailableCache = useCallback(
    (url: string | null): boolean => {
      if (cacheFound) {
        // If, during the current render, we've already found a cache, we're done
        return true;
      }

      // If path indicates a local file
      if (downloadPath?.startsWith(CONST.LOCAL_IMAGE_PREFIX)) {
        setImageUrl(downloadPath);
        setLoadingImage(false);
        return true;
      }

      // If we already have a cached URL matching our current state
      if (
        url &&
        url === prevCachedUrl.current &&
        downloadPath === initialDownloadPath.current && // Download path hasn't changed
        !refreshTrigger // Not forcing refresh
      ) {
        setImageUrl(cachedUrl);
        setLoadingImage(false);
        setCacheFound(true);
        return true;
      }

      return false;
    },
    [downloadPath, refreshTrigger, cachedUrl, cacheFound],
  );

  /**
   * Actually downloads the image, then caches and sets it.
   */
  const fetchImage = useCallback(async () => {
    setLoadingImage(true);
    try {
      let downloadUrl: string | null = null;
      if (downloadPath?.includes(CONST.FIREBASE_STORAGE_URL)) {
        // Fetch from Firebase Storage
        downloadUrl = await getProfilePictureURL(storage, userID, downloadPath);
        await cacheImage(downloadUrl);
      }

      setImageUrl(downloadUrl);
    } catch (error) {
      ErrorUtils.raiseAppError(ERRORS.IMAGE_UPLOAD.FETCH_FAILED, error);
    } finally {
      setLoadingImage(false);
    }
  }, [storage, userID, downloadPath, cacheImage]);

  /**
   * Single effect that runs after the cache is known to be checked.
   * 1) Tries to load from cache if valid.
   * 2) If invalid, fetches the image from storage.
   */
  useEffect(() => {
    if (!isCacheChecked) {
      return;
    }

    prevCachedUrl.current = cachedUrl; // Crucial!: This is the moment when the cachedUrl is updated and thus first available, so we set the ref here

    // If cache is valid, we’re done
    const cacheUnchanged = checkAvailableCache(cachedUrl);
    if (!cacheUnchanged) {
      // Cache invalid, fetch from storage
      fetchImage();
    }

    // Update ref once we’ve done our checks
    prevCachedUrl.current = cachedUrl;
  }, [isCacheChecked, cachedUrl, checkAvailableCache, fetchImage]);

  if (loadingImage) {
    return <FlexibleLoadingIndicator style={style as ViewStyle} />;
  }

  if (!enlargable) {
    return (
      <Image source={imageSource} style={[style, {tintColor: iconTint}]} />
    );
  }

  return (
    <EnlargableImage
      imageSource={imageSource}
      imageStyle={[style, {tintColor: iconTint}]}
    />
  );
}

export default ProfileImage;
