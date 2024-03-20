// eslint-disable-next-line no-restricted-imports
import positioning from '@styles/utils/positioning';
import type GetNavigationModalCardStyles from './types';

const getNavigationModalCardStyles: GetNavigationModalCardStyles = () => ({
  width: '100%',
  height: '100%',

  ...positioning.pFixed,
});

export default getNavigationModalCardStyles;
