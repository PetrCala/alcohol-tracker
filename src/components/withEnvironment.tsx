import type {
  ComponentType,
  ForwardedRef,
  ReactElement,
  ReactNode,
  RefAttributes,
} from 'react';
import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {ValueOf} from 'type-fest';
import * as Environment from '@libs/Environment/Environment';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import CONST from '@src/CONST';

type EnvironmentProviderProps = {
  /** Actual content wrapped by this component */
  children: ReactNode;
};

type EnvironmentValue = ValueOf<typeof CONST.ENVIRONMENT>;

type EnvironmentContextValue = {
  /** The string value representing the current environment */
  environment: EnvironmentValue;
};

const EnvironmentContext = createContext<EnvironmentContextValue>({
  environment: CONST.ENVIRONMENT.PROD,
});

function EnvironmentProvider({
  children,
}: EnvironmentProviderProps): ReactElement {
  const [environment, setEnvironment] = useState<EnvironmentValue>(
    CONST.ENVIRONMENT.PROD,
  );

  useEffect(() => {
    Environment.getEnvironment().then(setEnvironment);
  }, []);

  const contextValue = useMemo(
    (): EnvironmentContextValue => ({
      environment,
    }),
    [environment],
  );

  return (
    <EnvironmentContext.Provider value={contextValue}>
      {children}
    </EnvironmentContext.Provider>
  );
}

EnvironmentProvider.displayName = 'EnvironmentProvider';

export default function withEnvironment<
  TProps extends EnvironmentContextValue,
  TRef,
>(
  WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (
  props: Omit<TProps, keyof EnvironmentContextValue> &
    React.RefAttributes<TRef>,
) => ReactElement | null {
  function WithEnvironment(
    props: Omit<TProps, keyof EnvironmentContextValue>,
    ref: ForwardedRef<TRef>,
  ): ReactElement {
    const {environment} = useContext(EnvironmentContext);
    return (
      <WrappedComponent
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(props as TProps)}
        ref={ref}
        environment={environment}
      />
    );
  }

  WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent)})`;

  return forwardRef(WithEnvironment) as any;
}

export {EnvironmentContext, EnvironmentProvider};
export type {EnvironmentContextValue};
