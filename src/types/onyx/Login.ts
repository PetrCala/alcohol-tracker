import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Login = {
  /** Form that is being loaded */
  loadingForm?: ValueOf<typeof CONST.FORMS>;

  /** The email the user logged in with */
  email?: string;

  /** The username the user is trying to set */
  username?: string;

  /** The password the user logged in with */
  password?: string;

  /** The password the user is trying to set */
  passwordConfirm?: string;

  /** Whether the user forgot their password */
  forgotPassword?: boolean;

  /** The message to be displayed to the user */
  message?: string;

  /** Whether a sign is loading */
  isLoading?: boolean;

  /** Authentication failure errors */
  errors?: OnyxCommon.Errors | null;

  /** Authentication success message */
  success?: string;
};

export default Login;
