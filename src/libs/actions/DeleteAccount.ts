import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Clear CloseAccount error message to hide modal
 */
function clearError() {
  Onyx.merge(ONYXKEYS.FORMS.DELETE_ACCOUNT_FORM, {errors: null});
}

/**
 * Set default Onyx data
 */
function setDefaultData() {
  Onyx.merge(ONYXKEYS.FORMS.DELETE_ACCOUNT_FORM, {
    ...CONST.DEFAULT_DELETE_ACCOUNT_DATA,
  });
}

async function deleteAccount(reasonForLeaving: string) {
  console.debug('Deleting the account...');
  console.debug('Reason for leaving:', reasonForLeaving);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  clearError,
  setDefaultData,
  deleteAccount,
};
