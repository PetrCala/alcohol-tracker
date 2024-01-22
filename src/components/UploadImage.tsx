import React, {useState} from 'react';
import {Button, Image, View, Text, Alert} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {FirebaseStorage} from 'firebase/storage';
import {uploadImageToFirebase} from '../storage/storageUpload';
import { handleStorageErrors } from '@src/utils/errorHandling';

type UploadImageComponentProps = {
  storage: FirebaseStorage;
  pathToUpload: string;
};

/** TODO
 *
 * @description
 * This component should always be wrapped in the PermissionHandler that checks
 * for "write_photos" (?) permissions - perhaps validate this inside this component
 *
 */
const UploadImageComponent: React.FC<UploadImageComponentProps> = ({
  storage,
  pathToUpload,
}) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [warning, setWarning] = useState<string>('');

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
        try {
          const source = {uri: response.assets[0].uri};
          await uploadImageToFirebase(
            storage,
            source.uri,
            pathToUpload,
            setUploadProgress,
          );
          setImageSource(source.uri); // Set local
        } catch (error: any) {
        handleStorageErrors(error, 'Error uploading image', error.message, setWarning);
        }
      }
    });
  };

  console.log(warning)

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Choose Image" onPress={chooseImage} />

      {imageSource && (
        <Image source={{uri: imageSource}} style={{width: 100, height: 100}} />
      )}

      {uploadProgress && <Text>Progress: {uploadProgress}%</Text>}
    </View>
  );
};

export default UploadImageComponent;
