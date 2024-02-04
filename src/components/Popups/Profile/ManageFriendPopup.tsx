import React from 'react';
import {StyleSheet, Dimensions, Alert} from 'react-native';
import YesNoPopup from '../YesNoPopup';
import {auth} from '@src/services/firebaseSetup';
import {unfriend} from '@database/friends';
import {useFirebase} from '@src/context/global/FirebaseContext';
import ItemListPopup from '../ItemListPopup';

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
  const user = auth.currentUser;
  const db = useFirebase().db;
  const [unfriendModalVisible, setUnfriendModalVisible] = React.useState(false);

  const manageFriendData = [
    {
      label: 'Unfriend',
      icon: require('../../../../assets/icons/remove-user.png'),
      action: () => {
        setVisibility(false);
        setUnfriendModalVisible(true);
      },
    },
  ];

  const handleUnfriend = async () => {
    if (!user) return;
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
    <>
      <ItemListPopup
        visible={visible}
        transparent={true}
        heading={'Manage Friend'}
        actions={manageFriendData}
        onRequestClose={() => {
          setUnfriendModalVisible(false); // Extra safety
          setVisibility(false);
        }}
      />
      <YesNoPopup
        visible={unfriendModalVisible}
        transparent={true}
        message={'Do you really want to\nunfriend this user?'}
        onRequestClose={() => {
          setVisibility(true);
          setUnfriendModalVisible(false);
        }}
        onYes={handleUnfriend}
      />
    </>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({});

export default ManageFriendPopup;
