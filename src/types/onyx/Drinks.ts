import type CONST from '@src/CONST';
import type {ValueOf} from 'type-fest';
import {Timestamp} from './OnyxCommon';
import DeepValueOf from '../utils/DeepValueOf';

/** A timestamp of when this drink was recorded */
type DrinksTimestamp = Timestamp;

/** A drink identifier key */
type DrinkKey = DeepValueOf<typeof CONST.DRINKS.KEYS>;

/** A drink verbose name */
type DrinkName = DeepValueOf<typeof CONST.DRINKS.NAMES>;

/** A collection of drink records, usually stored under a single timestamp */
type Drinks = Partial<Record<DrinkKey, number>>;

/** A list of timestamped drinks objects */
type DrinksList = Record<DrinksTimestamp, Drinks>;

export default Drinks;
export type {DrinkKey, DrinkName, DrinksList, DrinksTimestamp};
