import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
  EMAIL: 'email',
  USERNAME: 'username',
  PASSWORD: 'password',
  RE_ENTER_PASSWORD: 'reEnterPassword',
} as const;

type SignUpForm = Form<
  ValueOf<typeof INPUT_IDS>,
  {
    [INPUT_IDS.EMAIL]: string;
    [INPUT_IDS.USERNAME]: string;
    [INPUT_IDS.PASSWORD]: string;
    [INPUT_IDS.RE_ENTER_PASSWORD]: string;
  }
>;

export type {SignUpForm};
export default INPUT_IDS;
