import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
  DATE: 'date',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SessionDateForm = Form<
  InputID,
  {
    /** Date of the session */
    [INPUT_IDS.DATE]: string;
  }
>;

export type {SessionDateForm};
export default INPUT_IDS;
