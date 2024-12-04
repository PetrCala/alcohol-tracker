import React, {useEffect, useState} from 'react';
import type {ImageSourcePropType} from 'react-native';
import {Image, View, Alert, TouchableOpacity, StyleSheet} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {Image as CompressorImage} from 'react-native-compressor';
import checkPermission from '@libs/Permissions/checkPermission';
import {requestPermission} from '@libs/Permissions/requestPermission';
import * as Profile from '@userActions/Profile';
import {useFirebase} from '@src/context/global/FirebaseContext';
import useLocalize from '@hooks/useLocalize';
import {uploadImageToFirebase} from '@src/storage/storageUpload';
import UploadImagePopup from './Popups/UploadImagePopup';

type UploadImageComponentProps = {
  pathToUpload: string;
  src: ImageSourcePropType;
  imageStyle: any;
  isProfilePicture: boolean;
};

const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  pathToUpload,
  src,
  imageStyle,
  isProfilePicture = false,
}) => {
  const {auth, db, storage} = useFirebase();
  const {translate} = useLocalize();
  const user = auth.currentUser;
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadOngoing, setUploadOngoing] = useState(false);
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');

  const chooseImage = async () => {
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
      .then((image: any) => {
        const source = {uri: image.path};
        if (!source) {
          Alert.alert(
            translate('common.error.error'),
            translate('imageUpload.error.fetch'),
          );
          // dispatch({
          //   type: 'SET_WARNING',
          //   payload: 'Could not fetch the image. Please try again.',
          // });
          return;
        }
        setImageSource(source.uri); // Triggers upload
      })
      .catch((error: any) => {
        // TODO add clever error handling
        if (error.message === 'User cancelled image selection') {
          return;
        }
        Alert.alert(translate('imageUpload.error.choice'), error.message);
        // dispatch({type: 'SET_WARNING', payload: error.message});
      });
  };

  const handleChooseImagePress = async () => {
    try {
      // Check for permissions
      const permissionAllowed = await checkPermission('read_photos');
      if (!permissionAllowed) {
        const permissionGranted = await requestPermission('read_photos');
        if (!permissionGranted) {
          return; // Permission denied - info message automatically handled by requestPermission
        }
      }
      await chooseImage(); // Call automatically
      resetIndicators(); // Clean the indicators for upload
    } catch (error: any) {
      Alert.alert(translate('imageUpload.error.choice'), error.message);
    }
  };

  const resetIndicators = () => {
    setUploadOngoing(false);
    setUploadProgress(null);
    setWarning('');
    setSuccess('');
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
        Alert.alert(translate('imageUpload.success'));
      } catch (error: any) {
        setImageSource(null);
        Alert.alert(translate('imageUpload.error.upload'), error.message);
      } finally {
        setUploadOngoing(false); // Otherwise set upon success in child component
        setUploadModalVisible(false);
      }
    };

    handleUpload(imageSource);
  }, [imageSource]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleChooseImagePress}
        style={styles.button}>
        <Image source={src} style={imageStyle} />
      </TouchableOpacity>

      {imageSource && (
        <UploadImagePopup
          visible={uploadModalVisible}
          transparent
          onRequestClose={() => setUploadModalVisible(false)}
          uploadProgress={uploadProgress}
          uploadOngoing={uploadOngoing}
          onUploadFinish={() => setUploadOngoing(false)}
        />
      )}
      {/* <WarningMessage warningText={warning} dispatch={dispatch} />
      <SuccessMessage successText={success} dispatch={dispatch} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
});

export default UploadImageComponent;
