import CONST from '@src/CONST';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

type FullScreenModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const FullScreenModal: React.FC<FullScreenModalProps> = props => {
  return (
    <Modal animationType="fade" transparent={false} visible={props.visible}>
      <TouchableOpacity style={styles.modalButton} onPress={props.onClose}>
        <Image source={CONST.ICONS.THIN_X} style={styles.modalButtonImage} />
      </TouchableOpacity>
      <View
        style={{
          width: ScreenWidth,
          height: ScreenHeight,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black', // later adjust to color scheme
        }}>
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
    top: 25,
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
