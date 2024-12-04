import React from 'react';
import {Linking} from 'react-native';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import BaseUpdateAppModal from './BaseUpdateAppModal';
import type UpdateAppModalProps from './types';

function UpdateAppModal(props: UpdateAppModalProps) {
  const currentPlatform = getPlatform();
  const storeLink =
    currentPlatform === CONST.PLATFORM.ANDROID
      ? CONST.STORE_LINKS.ANDROID
      : CONST.STORE_LINKS.IOS;

  return (
    <BaseUpdateAppModal
      onSubmit={() => {
        Linking.openURL(storeLink);
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

UpdateAppModal.displayName = 'UpdateAppModal';

export default UpdateAppModal;
