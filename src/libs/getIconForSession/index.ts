import * as KirokuIcons from '@components/Icon/KirokuIcons';
import CONST from '@src/CONST';
import {DrinkingSessionType} from '@src/types/onyx';
import {ImageSourcePropType} from 'react-native';

const getIconForSession = (
  sessionType: DrinkingSessionType,
): ImageSourcePropType => {
  switch (sessionType) {
    case CONST.SESSION_TYPES.LIVE:
      return KirokuIcons.AlcoholAssortment; // TODO
    case CONST.SESSION_TYPES.EDIT:
      return KirokuIcons.AlcoholAssortment;
    default:
      return KirokuIcons.AlcoholAssortment;
  }
};

export default getIconForSession;
