import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
  NOTE: 'note',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SessionNoteForm = Form<
  InputID,
  {
    /** Note of the session */
    [INPUT_IDS.NOTE]: string;
  }
>;

export type {SessionNoteForm};
export default INPUT_IDS;
