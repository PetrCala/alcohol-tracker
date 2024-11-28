import React, {useMemo, useRef} from 'react';
import {Alert, View, Text as RNText, StyleProp, ViewStyle} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {unfriend} from '@database/friends';
import {useFirebase} from '@src/context/global/FirebaseContext';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Modal from './Modal';
import CONST from '@src/CONST';
import Text from './Text';
import SafeAreaConsumer from './SafeAreaConsumer';
import SelectionList from './SelectionList';
import MenuItemList from './MenuItemList';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import IconAsset from '@src/types/utils/IconAsset';
import {TranslationPaths} from '@src/languages/types';

type MenuItem = {
  translationKey: TranslationPaths;
  icon: IconAsset;
  iconRight?: IconAsset;
  action?: () => Promise<void>;
  onPress?: () => void;
  link?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
};

type ManageFriendModalProps = {
  /** Whether the modal is visible */
  isModalVisible: boolean;

  /** A callback function to set the modal visibility */
  setVisibility: (visible: boolean) => void;

  /** A callback function to close the modal */
  onClose: () => void;

  /** The friend's user ID */
  friendId: string;
};

const ManageFriendModal: React.FC<ManageFriendModalProps> = ({
  isModalVisible,
  setVisibility,
  onClose,
  friendId,
}) => {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const styles = useThemeStyles();
  const popoverAnchor = useRef<View | RNText | null>(null);
  const {translate} = useLocalize();
  const waitForNavigate = useWaitForNavigation();
  const [unfriendModalVisible, setUnfriendModalVisible] = React.useState(false);

  const menuItems = useMemo(() => {
    const baseMenuItems: MenuItem[] = [
      {
        translationKey: 'profileScreen.unfriend',
        icon: KirokuIcons.RemoveUser,
        action: async () => {
          setVisibility(false);
          setUnfriendModalVisible(true);
        },
      },
    ];

    return baseMenuItems.map(
      ({translationKey, icon, iconRight, action}: MenuItem) => ({
        translationKey, // represents the key object here
        title: translate(translationKey),
        icon,
        iconRight,
        onPress: action,
        shouldShowRightIcon: !!iconRight,
        ref: popoverAnchor,
        wrapperStyle: [styles.sectionMenuItemTopDescription],
      }),
    );
  }, [styles, translate, waitForNavigate]);

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
      Navigation.goBack();
    }
  };

  return (
    <SafeAreaConsumer>
      {({safeAreaPaddingBottomStyle}) => (
        <>
          <Modal
            isVisible={isModalVisible}
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={onClose}>
            <View style={[styles.mh5, safeAreaPaddingBottomStyle]}>
              {/* // TODO  */}
              {/* Maybe create a MenuItemModal */}
              <Text style={[styles.headerText]}>
                {translate('profileScreen.manageFriend')}
              </Text>
              <MenuItemList menuItems={menuItems} />
            </View>
          </Modal>
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
        </>
      )}
    </SafeAreaConsumer>
  );
};

export default ManageFriendModal;
