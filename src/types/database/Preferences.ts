import {UserId} from './DatabaseCommon';
import {DrinkKey} from './Drinks';

type UnitsToColors = {
  yellow: number;
  orange: number;
};

type DrinksToUnits = Record<DrinkKey, number>;

type Preferences = {
  first_day_of_week: string;
  units_to_colors: UnitsToColors;
  drinks_to_units: DrinksToUnits;
};

type PreferencesList = Record<UserId, Preferences>;

export default Preferences;
export type {UnitsToColors, DrinksToUnits, PreferencesList};
