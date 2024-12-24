import React, {useState, useRef} from 'react';
import type {ImageSourcePropType, LayoutChangeEvent} from 'react-native';
import {Image, TouchableOpacity, Animated, Dimensions} from 'react-native';
import FullScreenModal from '@components/Modals/FullScreenModal';
import type ImageLayout from '@src/types/various/ImageLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTheme from '@hooks/useTheme';

type EnlargableImageProps = {
  imageSource: ImageSourcePropType;
  imageStyle: any;
  imageLayout: ImageLayout;
  onImageLayout: (event: LayoutChangeEvent) => void;
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const EnlargableImage: React.FC<EnlargableImageProps> = props => {
  const styles = useThemeStyles();
  const theme = useTheme();
  const {imageSource, imageStyle, imageLayout, onImageLayout} = props;
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const positionAnimation = useRef(new Animated.ValueXY()).current;
  const enlargedImageScale = ScreenWidth / imageStyle.width;
  const headerHeight = styles.headerBar.height; // Assume always rendered with header visible

  const handleOnLayout = (event: LayoutChangeEvent) => {
    onImageLayout(event);
    positionAnimation.setValue({
      x: imageLayout.x,
      y: imageLayout.y + headerHeight,
    });
  };

  const handlePress = () => {
    setModalVisible(true);
    // Animate scale and position simultaneously
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: enlargedImageScale,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnimation, {
        toValue: {x: 0, y: ScreenHeight / 9}, // Move to center
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    // Reverse the animation
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnimation, {
        toValue: {x: imageLayout.x, y: imageLayout.y + headerHeight},
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        style={imageStyle}
        onPress={handlePress}>
        {/* // TODO rewrite this using Avatar */}
        <Image
          onLayout={handleOnLayout}
          source={imageSource}
          style={imageStyle}
        />
      </TouchableOpacity>
      <FullScreenModal
        visible={modalVisible}
        onClose={closeModal}
        style={styles.bgDark}>
        <Animated.Image
          source={imageSource}
          style={[
            imageStyle,
            {
              width: imageLayout.width,
              height: imageLayout.height,
              transform: [
                {scaleX: scaleAnimation},
                {scaleY: scaleAnimation},
                {translateX: positionAnimation.x},
                {translateY: positionAnimation.y},
              ],
              resizeMode: 'cover',
              zIndex: 0,
            },
          ]}
        />
      </FullScreenModal>
    </>
  );
};

export default EnlargableImage;
export type {EnlargableImageProps};
