import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Alert, Image} from 'react-native'; // or 'react-native-web' if you're using React for web
import {FirebaseStorage} from 'firebase/storage';
import {getProfilePictureURL} from '../storage/storageProfile';
import {handleStorageErrors} from '../utils/errorHandling';

type ProfileImageProps = {
  storage: FirebaseStorage;
  userId: string;
  photoURL: string;
  style: any;
};

function ProfileImage(props: ProfileImageProps) {
  const {storage, userId, photoURL, style} = props;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);

  useEffect(() => {
    const fetchImage = async () => {
      setLoadingImage(true);
      try {
        const url = await getProfilePictureURL(storage, userId, photoURL);
        if (url) {
          setImageUrl(url);
        }
      } catch (error: any) {
        handleStorageErrors(error);
      } finally {
        setLoadingImage(false);
      }
    };
    fetchImage();
  }, []); // Run once when the component mounts

  if (loadingImage)
    return <ActivityIndicator size="large" color="#0000ff" style={style} />;

  return (
    <Image
      source={
        imageUrl ? {uri: imageUrl} : require('../../assets/temp/user.png')
      }
      style={style}
    />
  );
}

export default ProfileImage;
