import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {Timestamp} from './OnyxCommon';

/** A timestamp of when this drink was recorded */
type DrinksTimestamp = Timestamp;

/** A drink identifier key */
type DrinkKey = DeepValueOf<typeof CONST.DRINKS.KEYS>;

/** A collection of drink records, usually stored under a single timestamp */
type Drinks = Partial<Record<DrinkKey, number>>;

/** A list of timestamped drinks objects */
type DrinksList = Record<DrinksTimestamp, Drinks>;

export default Drinks;
export type {DrinkKey, DrinksList, DrinksTimestamp};
