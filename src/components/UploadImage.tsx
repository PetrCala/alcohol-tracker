import React, {useEffect, useState} from 'react';
import type {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {Image as CompressorImage} from 'react-native-compressor';
import checkPermission from '@libs/Permissions/checkPermission';
import requestPermission from '@libs/Permissions/requestPermission';
import * as Profile from '@userActions/Profile';
import * as ErrorUtils from '@libs/ErrorUtils';
import {useFirebase} from '@src/context/global/FirebaseContext';
import uploadImageToFirebase from '@src/storage/storageUpload';
import ERRORS from '@src/ERRORS';
import useThemeStyles from '@hooks/useThemeStyles';
import UploadImagePopup from './Popups/UploadImagePopup';
import Button from './Button';

type UploadImageComponentProps = {
  pathToUpload: string;
  src: ImageSourcePropType;
  isProfilePicture: boolean;
  containerStyles?: StyleProp<ViewStyle>;
};

function UploadImageComponent({
  pathToUpload,
  src,
  isProfilePicture = false,
  containerStyles,
}: UploadImageComponentProps) {
  const {auth, db, storage} = useFirebase();
  const styles = useThemeStyles();
  const user = auth.currentUser;
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadOngoing, setUploadOngoing] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [warning, setWarning] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [success, setSuccess] = useState('');

  const chooseImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      cropperCircleOverlay: true, // could use isProfilePicture
      cropperToolbarTitle: 'Crop the image',
      compressImageQuality: 0.8,
      writeTempFile: true,
      mediaType: 'photo',
    })
      .then(image => {
        const source = {uri: image.path};
        if (!source) {
          ErrorUtils.raiseAppError(ERRORS.IMAGE_UPLOAD.FETCH_FAILED);
          return;
        }
        setImageSource(source.uri); // Triggers upload
      })
      .catch(error => {
        const errorMessage = error instanceof Error ? error.message : '';
        // TODO add clever error handling
        if (errorMessage === 'User cancelled image selection') {
          return;
        }
        ErrorUtils.raiseAppError(ERRORS.IMAGE_UPLOAD.CHOICE_FAILED, error);
      });
  };

  const resetIndicators = () => {
    setUploadOngoing(false);
    setUploadProgress(null);
    setWarning('');
    setSuccess('');
  };

  const handleChooseImagePress = () => {
    (async () => {
      try {
        // Check for permissions
        const permissionAllowed = await checkPermission('read_photos');
        if (!permissionAllowed) {
          const permissionGranted = await requestPermission('read_photos');
          if (!permissionGranted) {
            return; // Permission denied - info message automatically handled by requestPermission
          }
        }
        chooseImage(); // Call automatically
        resetIndicators(); // Clean the indicators for upload
      } catch (error) {
        ErrorUtils.raiseAppError(ERRORS.IMAGE_UPLOAD.CHOICE_FAILED, error);
      }
    })();
  };

  useEffect(() => {
    const handleUpload = async (sourceURI: string | null) => {
      if (!sourceURI) {
        return;
      }

      try {
        setUploadModalVisible(true);
        setUploadOngoing(true);
        const compressedURI = await CompressorImage.compress(sourceURI);
        await uploadImageToFirebase(
          storage,
          compressedURI,
          pathToUpload,
          setUploadProgress,
          setSuccess,
        ); // Wait for the promise to resolve
        if (isProfilePicture) {
          await Profile.updateProfileInfo(
            pathToUpload,
            user,
            auth,
            db,
            storage,
          );
        }
      } catch (error) {
        setImageSource(null);
        ErrorUtils.raiseAppError(ERRORS.IMAGE_UPLOAD.UPLOAD_FAILED, error);
        setUploadModalVisible(false);
      } finally {
        setUploadOngoing(false); // Otherwise set upon success in child component
      }
    };

    handleUpload(imageSource);
  }, [auth, db, isProfilePicture, storage, user, pathToUpload, imageSource]);

  return (
    <View
      style={[
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        containerStyles,
      ]}>
      <Button
        onPress={handleChooseImagePress}
        icon={src}
        style={[styles.border, styles.borderRadiusNormal, styles.appBG]}
      />

      {imageSource && (
        <UploadImagePopup
          visible={uploadModalVisible}
          onRequestClose={() => setUploadModalVisible(false)}
          uploadProgress={uploadProgress}
          uploadOngoing={uploadOngoing}
          onUploadFinish={() => setUploadOngoing(false)}
        />
      )}
    </View>
  );
}

export default UploadImageComponent;
