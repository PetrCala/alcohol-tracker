import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {
  ResponsiveLayoutProperties,
  FullScreenContext as FullScreenContextType,
} from './types';

const FullScreenContext = React.createContext<FullScreenContextType | null>(
  null,
);

function FullScreenContextProvider({children}: ChildrenProps) {
  const isFullScreenRef = useRef(false);
  const lockedWindowDimensionsRef = useRef<ResponsiveLayoutProperties | null>(
    null,
  );

  const lockWindowDimensions = useCallback(
    (newResponsiveLayoutProperties: ResponsiveLayoutProperties) => {
      lockedWindowDimensionsRef.current = newResponsiveLayoutProperties;
    },
    [],
  );

  const unlockWindowDimensions = useCallback(() => {
    lockedWindowDimensionsRef.current = null;
  }, []);

  const contextValue = useMemo(
    () => ({
      isFullScreenRef,
      lockedWindowDimensionsRef,
      lockWindowDimensions,
      unlockWindowDimensions,
    }),
    [lockWindowDimensions, unlockWindowDimensions],
  );

  return (
    <FullScreenContext.Provider value={contextValue}>
      {children}
    </FullScreenContext.Provider>
  );
}

function useFullScreenContext() {
  const fullscreenContext = useContext(FullScreenContext);
  if (!fullscreenContext) {
    throw new Error(
      'useFullScreenContext must be used within a FullScreenContextProvider',
    );
  }
  return fullscreenContext;
}

FullScreenContextProvider.displayName = 'FullScreenContextProvider';

export {FullScreenContext, FullScreenContextProvider, useFullScreenContext};
export type {ResponsiveLayoutProperties};
