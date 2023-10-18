import React, { useState } from 'react';
import { Alert, Button, Image, View } from 'react-native';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

function UploadImage() {
  const [image, setImage] = useState(null);

  // Function to handle image selection and upload
  const pickAndUploadImage = async () => {
    // Request permission and pick an image using Expo ImagePicker
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to select an image!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Ensure a file was actually selected
    if (!result.cancelled) {
      setImage(result.uri);

      // Upload the image to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, 'path/to/uploaded/image.jpg'); // specify where you want to store the image
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(storageRef, blob);


      uploadTask.on('state_changed',
        (snapshot) => {
            // Track progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log(`Upload is ${progress}% done.`);
                break;
            }
        },
        (error) => {
            console.error('Error uploading image:', error);
        },
        () => {
            console.log('Upload successful!');
        }
        );
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Pick and Upload Image" onPress={pickAndUploadImage} />
    </View>
  );
}

export default UploadImage;
