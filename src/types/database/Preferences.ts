import {UserId} from './DatabaseCommon';
import {UnitKey} from './Units';

type UnitsToColors = {
  yellow: number;
  orange: number;
};

type UnitsToPoints = Record<UnitKey, number>;

type Preferences = {
  first_day_of_week: string;
  units_to_colors: UnitsToColors;
  units_to_points: UnitsToPoints;
};

type PreferencesList = Record<UserId, Preferences>;

export default Preferences;
export type {UnitsToColors, UnitsToPoints, PreferencesList};
