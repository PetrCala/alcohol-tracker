import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Account = {
  /** Whether SAML is required for the current account */
  isSAMLRequired?: boolean;

  /** Is this account having trouble receiving emails? */
  hasEmailDeliveryFailure?: boolean;

  /** Whether the account is validated */
  validated?: boolean;

  /** The primaryLogin associated with the account */
  primaryLogin?: string;

  /** The message to be displayed when code requested */
  message?: string;

  /** Form that is being loaded */
  loadingForm?: ValueOf<typeof CONST.FORMS>;

  /** Whether the user forgot their password */
  forgotPassword?: boolean;

  /** Whether the account exists */
  accountExists?: boolean;

  /** Whether the validation code has expired */
  validateCodeExpired?: boolean;

  /** Whether a sign is loading */
  isLoading?: boolean;

  /** Authentication failure errors */
  errors?: OnyxCommon.Errors | null;

  /** Authentication success message */
  success?: string;
};

export default Account;
