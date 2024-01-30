import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const downloadAndCacheImage = async (firebaseUrl) => {
  try {
    // Get the image from Firebase
    const response = await fetch(firebaseUrl);
    const blob = await response.blob();
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    await new Promise(resolve => reader.onloadend = resolve);

    // Define the path for the image in the app's internal storage
    const imagePath = `${RNFS.DocumentDirectoryPath}/cachedImage.jpg`;

    // Write the file to the app's internal storage
    await RNFS.writeFile(imagePath, reader.result, 'base64');

    return imagePath;
  } catch (error) {
    console.error('Error downloading or saving image:', error);
  }
};



