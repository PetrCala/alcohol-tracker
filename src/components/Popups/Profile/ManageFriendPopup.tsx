import React from 'react';
import {StyleSheet, Dimensions, Alert, View} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import YesNoPopup from '../YesNoPopup';

import {unfriend} from '@database/friends';
import {useFirebase} from '@src/context/global/FirebaseContext';
import ItemListPopup from '../ItemListPopup';
import CONST from '@src/CONST';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

export type ManageFriendPopupProps = {
  visible: boolean;
  setVisibility: (visible: boolean) => void;
  //   onRequestClose: () => void;
  onGoBack: () => void;
  friendId: string;
};

const ManageFriendPopup: React.FC<ManageFriendPopupProps> = ({
  visible,
  setVisibility,
  //   onRequestClose,
  friendId,
  onGoBack,
}) => {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const [unfriendModalVisible, setUnfriendModalVisible] = React.useState(false);

  const manageFriendData = [
    {
      label: 'Unfriend',
      icon: KirokuIcons.RemoveUser,
      action: () => {
        setVisibility(false);
        setUnfriendModalVisible(true);
      },
    },
  ];

  const handleUnfriend = async () => {
    if (!user) {
      return;
    }
    try {
      await unfriend(db, user.uid, friendId);
    } catch (error: any) {
      Alert.alert(
        'User does not exist in the database',
        'Could not unfriend this user: ' + error.message,
      );
    } finally {
      setUnfriendModalVisible(false);
      setVisibility(false);
      onGoBack();
    }
  };

  return (
    <View style={styles.fullScreenCenteredContent}>
      <ItemListPopup
        visible={visible}
        transparent={true}
        heading={'Manage Friend'}
        actions={manageFriendData}
        onRequestClose={() => {
          setVisibility(false);
        }}
      />
      <ConfirmModal
        isVisible={unfriendModalVisible}
        title={translate('common.areYouSure')}
        prompt={'Do you really want to unfriend this user?'}
        onCancel={() => {
          setUnfriendModalVisible(false);
        }}
        onConfirm={handleUnfriend}
        danger
      />
    </View>
  );
};

export default ManageFriendPopup;
