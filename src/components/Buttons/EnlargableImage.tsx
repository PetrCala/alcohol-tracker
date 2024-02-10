import React, {useState, useRef} from 'react';
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  Animated,
  ImageSourcePropType,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FullScreenModal from '@components/Modals/FullScreenModal';

type EnlargableImageProps = {
  imageSource: ImageSourcePropType;
  imageStyle: any;
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const EnlargableImage: React.FC<EnlargableImageProps> = props => {
  const {imageSource, imageStyle} = props;
  const [modalVisible, setModalVisible] = useState(false);
  const initialValue = 0;
  const finalValue = 1; // Use this to adjust the end scale
  const animation = useRef(new Animated.Value(initialValue)).current;

  const handlePress = () => {
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: finalValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(animation, {
      toValue: initialValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <>
      <TouchableOpacity style={imageStyle} onPress={handlePress}>
        <Image source={imageSource} style={imageStyle} />
      </TouchableOpacity>
      <FullScreenModal visible={modalVisible}>
        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
          <Image
            source={require('@assets/icons/thin_x.png')}
            style={styles.modalButtonImage}
          />
        </TouchableOpacity>
        <Animated.Image
          source={imageSource}
          style={[styles.enlargedImage, {transform: [{scale: animation}]}]}
        />
      </FullScreenModal>
    </>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 1,
  },
  modalButtonImage: {
    height: 30,
    width: 30,
    tintColor: '#F2F2F2',
  },
  enlargedImage: {
    width: ScreenWidth,
    height: ScreenHeight,
    resizeMode: 'contain', // Fit the screen
  },
});

export default EnlargableImage;
export type {EnlargableImageProps};
