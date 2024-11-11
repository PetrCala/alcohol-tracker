import CONST from '@src/CONST';
import {
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useEffect, useRef, useState} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';

type FullScreenModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hideCloseButton?: boolean;
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  visible,
  onClose,
  children,
  hideCloseButton,
  style,
}: FullScreenModalProps) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const styles = useThemeStyles();

  // Use a pan responsder to dismiss the modal upon swiping up
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          // Swipe up detected
          handleCloseModal();
        }
      },
    }),
  ).current;

  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  const handleCloseModal = () => {
    setModalVisible(false);
    if (onClose) {
      onClose();
    }
  };
  return (
    <Modal animationType="fade" transparent={false} visible={modalVisible}>
      {!hideCloseButton && (
        <TouchableOpacity
          accessibilityRole="button"
          style={localStyles.modalButton}
          onPress={handleCloseModal}>
          <Image
            source={KirokuIcons.ThinX}
            style={localStyles.modalButtonImage}
          />
        </TouchableOpacity>
      )}
      <View
        style={[
          {
            width: ScreenWidth,
            height: ScreenHeight,
            alignItems: 'center',
            justifyContent: 'center',
          },
          styles.appBG,
          style,
        ]}
        {...panResponder.panHandlers} // This applies the swipe up functionality
      >
        {children}
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 70,
    right: 25,
    zIndex: 1,
  },
  modalButtonImage: {
    height: 30,
    width: 30,
    tintColor: '#444', // #F2F2F2 for white
  },
});

export default FullScreenModal;
