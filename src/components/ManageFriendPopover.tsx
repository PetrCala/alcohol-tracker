import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import {unfriend} from '@database/friends';
import {useFirebase} from '@src/context/global/FirebaseContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ErrorUtils from '@libs/ErrorUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ERRORS from '@src/ERRORS';
import * as KirokuIcons from './Icon/KirokuIcons';
import type {PopoverMenuItem} from './PopoverMenu';
import PopoverMenu from './PopoverMenu';
import ConfirmModal from './ConfirmModal';

type ManageFriendPopoverProps = {
  /** Whether the modal is visible */
  isVisible: boolean;

  /** A callback function to close the modal */
  onClose: () => void;

  /** The friend's user ID */
  friendId: string;
};

function ManageFriendPopover({
  isVisible,
  onClose,
  friendId,
}: ManageFriendPopoverProps) {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const fabRef = useRef<HTMLDivElement>(null);
  const {windowHeight} = useWindowDimensions();
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
  }, [translate]);

  const handleUnfriend = () => {
    (async () => {
      if (!user) {
        return;
      }
      try {
        await unfriend(db, user.uid, friendId);
      } catch (error) {
        ErrorUtils.raiseAppError(ERRORS.USER.COULD_NOT_UNFRIEND, error);
      } finally {
        setUnfriendModalVisible(false);
        Navigation.goBack();
      }
    })();
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
}

export default ManageFriendPopover;
