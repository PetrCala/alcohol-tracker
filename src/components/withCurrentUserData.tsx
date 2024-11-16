import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React from 'react';
import useCurrentUserData from '@hooks/useCurrentUserData';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {UserData} from '@src/types/onyx';

type CurrentUserData = UserData | Record<string, never>;

type HOCProps = {
  currentUserData: CurrentUserData;
};

type WithCurrentUserDataProps = HOCProps;

const withCurrentUserDataDefaultProps: HOCProps = {
  currentUserData: {},
};

export default function <TProps extends WithCurrentUserDataProps, TRef>(
  WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentType<Omit<TProps, keyof HOCProps> & RefAttributes<TRef>> {
  function WithCurrentUserData(
    props: Omit<TProps, keyof HOCProps>,
    ref: ForwardedRef<TRef>,
  ) {
    const currentUserData = useCurrentUserData();
    return (
      <WrappedComponent
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(props as TProps)}
        ref={ref}
        currentUserData={currentUserData}
      />
    );
  }

  WithCurrentUserData.displayName = `WithCurrentUserData(${getComponentDisplayName(
    WrappedComponent,
  )})`;

  return React.forwardRef(WithCurrentUserData);
}

export {withCurrentUserDataDefaultProps};
export type {WithCurrentUserDataProps, CurrentUserData};
