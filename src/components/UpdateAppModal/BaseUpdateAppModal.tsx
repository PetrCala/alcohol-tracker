import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type UpdateAppModalProps from './types';

function BaseUpdateAppModal({onSubmit}: UpdateAppModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const {translate} = useLocalize();

  /**
   * Execute the onSubmit callback and close the modal.
   */
  const submitAndClose = async () => {
    onSubmit?.();
    setIsModalOpen(false);
  };

  const onCancel = async () => {
    setIsModalOpen(false);
    await Onyx.merge(ONYXKEYS.APP_UPDATE_DISMISSED, new Date().getTime());
  };

  return (
    <ConfirmModal
      title={translate('baseUpdateAppModal.updateApp')}
      isVisible={isModalOpen}
      onConfirm={submitAndClose}
      onCancel={onCancel}
      prompt={translate('baseUpdateAppModal.updatePrompt')}
      confirmText={translate('baseUpdateAppModal.updateApp')}
      cancelText={translate('common.cancel')}
    />
  );
}

BaseUpdateAppModal.displayName = 'BaseUpdateAppModal';

export default React.memo(BaseUpdateAppModal);
