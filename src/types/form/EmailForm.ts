import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
} as const;

type EmailForm = Form<
  ValueOf<typeof INPUT_IDS>,
  {
    [INPUT_IDS.EMAIL]: string;
    [INPUT_IDS.PASSWORD]: string;
  }
>;

export type {EmailForm};
export default INPUT_IDS;
