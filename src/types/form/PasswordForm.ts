import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
  CURRENT_PASSWORD: 'currentPassword',
  NEW_PASSWORD: 'newPassword',
  RE_ENTER_PASSWORD: 'reEnterPassword',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PasswordForm = Form<
  InputID,
  {
    [INPUT_IDS.CURRENT_PASSWORD]: string;
    [INPUT_IDS.NEW_PASSWORD]: string;
    [INPUT_IDS.RE_ENTER_PASSWORD]: string;
  }
>;

export type {PasswordForm};
export default INPUT_IDS;
