import {Dimensions, Modal, View} from 'react-native';

type FullScreenModalProps = {
  visible: boolean;
  children: React.ReactNode;
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const FullScreenModal: React.FC<FullScreenModalProps> = props => {
  return (
    <Modal animationType="fade" transparent={false} visible={props.visible}>
      <View
        style={{
          width: ScreenWidth,
          height: ScreenHeight,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black', // perhaps rgba(0,0,0,0.5)
        }}>
        {props.children}
      </View>
    </Modal>
  );
};

export default FullScreenModal;
