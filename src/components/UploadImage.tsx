import React, {useState} from 'react';
import {Button, Image, View, Text} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  FirebaseStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import {uploadImageToFirebase} from '../storage/storageUpload';

type UploadImageComponentProps = {
  storage: FirebaseStorage;
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
}) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const chooseImage = () => {
    // Ask for permissions here

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, (response: any) => {
      console.log('Response: ' + response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {uri: response.uri};
        // const source = { uri: response.assets[0].uri };
        setImageSource(source.uri);
        // If you want to upload the image after selecting, you can call it here:
        console.log(
          'Successfully selected the following source URI: ' + source.uri,
        );
        // uploadImageToFirebase(storage, response.uri);
      }
    });
  };

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
