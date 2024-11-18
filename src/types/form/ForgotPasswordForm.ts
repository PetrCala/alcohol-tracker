import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
  EMAIL: 'email',
} as const;

type ForgotPasswordForm = Form<
  ValueOf<typeof INPUT_IDS>,
  {
    [INPUT_IDS.EMAIL]: string;
  }
>;

export type {ForgotPasswordForm};
export default INPUT_IDS;
