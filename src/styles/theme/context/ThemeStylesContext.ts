import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@src/styles';
import type {ThemeStyles} from '@src/styles';
// eslint-disable-next-line no-restricted-imports
// import {DefaultStyleUtils} from '@styles/utils';
// import type {StyleUtilsType} from '@styles/utils';

type ThemeStylesContextType = {
  styles: ThemeStyles;
  // StyleUtils: StyleUtilsType;
  StyleUtils: any;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType>({
  styles: defaultStyles,
  // TODO make sure the styleutils are used
  // StyleUtils: DefaultStyleUtils,
  StyleUtils: null,
});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
