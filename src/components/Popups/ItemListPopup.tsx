import Button from '@components/Button';
import Icon from '@components/Icon';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  return (
    <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={localStyles.modalContainer}>
        <View style={[localStyles.modalView, styles.appBG]}>
          <Text style={[styles.textHeadlineH2, styles.pb2]}>{heading}</Text>
          {actions.map((item, index) => (
            <TouchableOpacity
              accessibilityRole="button"
              key={index}
              style={localStyles.actionButton}
              onPress={item.action}>
              <Icon src={item.icon} width={24} height={24} />
              <Text style={[styles.textNormal, styles.ml2]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <Button
            text={translate('common.close')}
            onPress={onRequestClose}
            innerStyles={[styles.ph8, styles.mt2]}
            success
          />
        </View>
      </View>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;

const localStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: screenWidth * 0.8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    borderColor: 'black',
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
    width: screenWidth * 0.75,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
    margin: 3,
  },
});

export default ItemListPopup;
