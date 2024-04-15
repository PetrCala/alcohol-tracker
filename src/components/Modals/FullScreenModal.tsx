import CONST from '@src/CONST';
import {
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useEffect, useRef, useState} from 'react';

type FullScreenModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const FullScreenModal: React.FC<FullScreenModalProps> = props => {
  const [modalVisible, setModalVisible] = useState(props.visible);

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
    setModalVisible(props.visible);
  }, [props.visible]);

  const handleCloseModal = () => {
    setModalVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  };
  return (
    <Modal animationType="fade" transparent={false} visible={modalVisible}>
      <TouchableOpacity accessibilityRole="button" style={styles.modalButton} onPress={handleCloseModal}>
        <Image source={KirokuIcons.ThinX} style={styles.modalButtonImage} />
      </TouchableOpacity>
      <View
        style={{
          width: ScreenWidth,
          height: ScreenHeight,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black', // Adjust to your color scheme
        }}
        {...panResponder.panHandlers} // This applies the swipe up functionality
      >
        {props.children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
