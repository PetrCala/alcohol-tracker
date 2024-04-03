import CONST from '@src/CONST';
import DrinkDataProps from './types';
import * as KirokuIcons from '@components/Icon/KirokuIcons';

const DrinkData: DrinkDataProps = [
  {
    key: CONST.DRINKS.KEYS.SMALL_BEER,
    icon: KirokuIcons.Beer,
  },
  {
    key: CONST.DRINKS.KEYS.BEER,
    icon: KirokuIcons.Beer,
  },
  {
    key: CONST.DRINKS.KEYS.WINE,
    icon: KirokuIcons.Wine,
  },
  {
    key: CONST.DRINKS.KEYS.WEAK_SHOT,
    icon: KirokuIcons.WeakShot,
  },
  {
    key: CONST.DRINKS.KEYS.STRONG_SHOT,
    icon: KirokuIcons.StrongShot,
  },
  {
    key: CONST.DRINKS.KEYS.COCKTAIL,
    icon: KirokuIcons.Cocktail,
  },
  {
    key: CONST.DRINKS.KEYS.OTHER,
    icon: KirokuIcons.AlcoholAssortment,
  },
];

export default DrinkData;
