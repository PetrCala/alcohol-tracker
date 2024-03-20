import CONST from '@src/CONST';
import {ValueOf} from 'type-fest';

type DrinksTimestamp = number;

type DrinkKey = ValueOf<typeof CONST.DRINKS.KEYS>;

type DrinkName = ValueOf<typeof CONST.DRINKS.NAMES>;

type Drinks = Partial<Record<DrinkKey, number>>;

type DrinksList = Record<DrinksTimestamp, Drinks>;

export default Drinks;
export type {DrinkKey, DrinkName, DrinksList, DrinksTimestamp};
