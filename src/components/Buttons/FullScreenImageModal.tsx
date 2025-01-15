import React, {useState, useRef} from 'react';
import type {
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleProp,
  ImageStyle,
} from 'react-native';
import {Animated} from 'react-native';
import FullScreenModal from '@components/Modals/FullScreenModal';
import type ImageLayout from '@src/types/various/ImageLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type FullScreenImageModalProps = {
  imageSource: ImageSourcePropType;
  imageStyle: StyleProp<ImageStyle>;
};

function FullScreenImageModal({
  imageSource,
  imageStyle,
}: FullScreenImageModalProps) {
  const styles = useThemeStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const positionAnimation = useRef(new Animated.ValueXY()).current;
  const {windowWidth, windowHeight} = useWindowDimensions();
  const [layout, setLayout] = useState<ImageLayout>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const enlargedImageScale = windowWidth / imageStyle.width;
  const headerHeight = styles.headerBar.height; // Assume always rendered with header visible

  const onLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setLayout({
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    });
  };

  const handleOnLayout = (event: LayoutChangeEvent) => {
    onLayout(event);
    positionAnimation.setValue({
      x: layout.x,
      y: layout.y + headerHeight,
    });
  };

  // TODO
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
        toValue: {x: 0, y: windowHeight / 9}, // Move to center
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
        toValue: {x: layout.x, y: layout.y + headerHeight},
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <FullScreenModal
      visible={modalVisible}
      onClose={closeModal}
      style={styles.bgDark}>
      <Animated.Image
        source={imageSource}
        style={[
          imageStyle,
          {
            width: layout.width,
            height: layout.height,
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
  );
}

export default FullScreenImageModal;
export type {FullScreenImageModalProps};
