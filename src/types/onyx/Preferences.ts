import type {UserID} from './OnyxCommon';
import type {DrinkKey} from './Drinks';

/** A model mapping units to session colors */
type UnitsToColors = {
  /** At maximum how many units a session is still yellow */
  yellow: number;

  /** At maximum how many units a session is still orange */
  orange: number;
};

/** A model mapping drinks to unit values */
type DrinksToUnits = Record<DrinkKey, number>;

/** User's preferences */
type Preferences = {
  /** User's preferred first day of week */
  first_day_of_week: string;

  /** Preferences that determine at how many units the session color should change */
  units_to_colors: UnitsToColors;

  /** Preferences that determine how many units each drink equals to */
  drinks_to_units: DrinksToUnits;
};

/** A collection of preferences of multiple users */
type PreferencesList = Record<UserID, Preferences>;

export default Preferences;
export type {UnitsToColors, DrinksToUnits, PreferencesList};
