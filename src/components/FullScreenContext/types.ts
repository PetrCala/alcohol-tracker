import type {MutableRefObject} from 'react';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import type WindowDimensions from '@hooks/useWindowDimensions/types';

type ResponsiveLayoutProperties = WindowDimensions & {
  responsiveLayoutResults: Partial<ResponsiveLayoutResult>;
};

type FullScreenContext = {
  isFullScreenRef: MutableRefObject<boolean>;
  lockedWindowDimensionsRef: MutableRefObject<ResponsiveLayoutProperties | null>;
  lockWindowDimensions: (
    newResponsiveLayoutResult: ResponsiveLayoutProperties,
  ) => void;
  unlockWindowDimensions: () => void;
};

export type {ResponsiveLayoutProperties, FullScreenContext};
