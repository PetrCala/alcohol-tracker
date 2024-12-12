import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** A timezone locale value */
type Locale = ValueOf<typeof CONST.LOCALES>;

export default Locale;
