import React from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import CONST from '@src/CONST';

type ItemList = {
  label: string;
  icon: any;
  action: () => void;
};

export type ItemListPopupProps = {
  visible: boolean;
  transparent: boolean;
  heading: string;
  actions: ItemList[];
  onRequestClose: () => void;
};

const ItemListPopup: React.FC<ItemListPopupProps> = ({
  visible,
  transparent,
  heading,
  actions,
  onRequestClose,
}) => {
  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalHeading}>{heading}</Text>
          {actions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={item.action}>
              <Image source={item.icon} style={styles.actionIcon} />
              <Text style={styles.actionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: CONST.SCREEN_WIDTH * 0.8,
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    paddingBottom: 15,
    paddingTop: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalHeading: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  actionButton: {
    width: CONST.SCREEN_WIDTH * 0.75,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 3,
  },
  actionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  actionText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
  },
  closeButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    padding: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ItemListPopup;
