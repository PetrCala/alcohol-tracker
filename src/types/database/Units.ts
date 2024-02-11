import CONST from '@src/CONST';
import {ValueOf} from 'type-fest';

type UnitsTimestamp = number;

type UnitKey = ValueOf<typeof CONST.UNITS.KEYS>;

type UnitName = ValueOf<typeof CONST.UNITS.NAMES>;

type Units = Partial<Record<UnitKey, number>>;

type UnitsList = Record<UnitsTimestamp, Units>;

export default Units;
export type {UnitKey, UnitName, UnitsList, UnitsTimestamp};
