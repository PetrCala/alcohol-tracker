import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Account = {
  /** Form that is being loaded */
  loadingForm?: ValueOf<typeof CONST.FORMS>;

  /** Whether the user forgot their password */
  forgotPassword?: boolean;

  /** The message to be displayed to the user */
  message?: string;

  /** Whether the account exists */
  accountExists?: boolean;

  /** Whether a sign is loading */
  isLoading?: boolean;

  /** Authentication failure errors */
  errors?: OnyxCommon.Errors | null;

  /** Authentication success message */
  success?: string;
};

export default Account;
