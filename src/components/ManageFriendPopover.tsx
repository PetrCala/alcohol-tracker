import React, {useMemo, useRef} from 'react';
import {Alert, View, Text as RNText, StyleProp, ViewStyle} from 'react-native';
import {unfriend} from '@database/friends';
import {useFirebase} from '@src/context/global/FirebaseContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import IconAsset from '@src/types/utils/IconAsset';
import {TranslationPaths} from '@src/languages/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {PopoverMenuItem} from './PopoverMenu';
import PopoverMenu from './PopoverMenu';
import ConfirmModal from './ConfirmModal';
import * as KirokuIcons from './Icon/KirokuIcons';

type ManageFriendPopoverProps = {
  /** Whether the modal is visible */
  isVisible: boolean;

  /** A callback function to close the modal */
  onClose: () => void;

  /** The friend's user ID */
  friendId: string;
};

const ManageFriendPopover: React.FC<ManageFriendPopoverProps> = ({
  isVisible,
  onClose,
  friendId,
}) => {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const fabRef = useRef<HTMLDivElement>(null);
  const {windowHeight} = useWindowDimensions();
  const {shouldUseNarrowLayout} = useResponsiveLayout();
  const waitForNavigate = useWaitForNavigation();
  const [unfriendModalVisible, setUnfriendModalVisible] = React.useState(false);

  const menuItems = useMemo(() => {
    const baseMenuItems: PopoverMenuItem[] = [
      {
        text: translate('profileScreen.unfriend'),
        icon: KirokuIcons.RemoveUser,
        onSelected: () => {
          setUnfriendModalVisible(true);
        },
      },
    ];

    return baseMenuItems;
  }, [styles, translate, waitForNavigate]);

  const handleUnfriend = async () => {
    if (!user) {
      return;
    }
    try {
      await unfriend(db, user.uid, friendId);
    } catch (error: unknown) {
      Alert.alert(
        'User does not exist in the database',
        `Could not unfriend this user: ${error.message}`,
      );
    } finally {
      setUnfriendModalVisible(false);
      Navigation.goBack();
    }
  };

  return (
    <View style={styles.flexGrow1}>
      <PopoverMenu
        headerText={translate('profileScreen.manageFriend')}
        onClose={onClose}
        isVisible={isVisible}
        anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
        onItemSelected={onClose}
        fromSidebarMediumScreen={false}
        menuItems={menuItems}
        withoutOverlay
        anchorRef={fabRef}
      />
      <ConfirmModal
        isVisible={unfriendModalVisible}
        title={translate('common.areYouSure')}
        prompt={translate('profileScreen.unfriendPrompt')}
        onCancel={() => {
          setUnfriendModalVisible(false);
        }}
        onConfirm={handleUnfriend}
        danger
      />
    </View>
  );
};

export default ManageFriendPopover;
