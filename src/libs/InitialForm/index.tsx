import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import BaseInitialForm from './BaseInitialForm';
import type {InputHandle} from './types';
import type InitialFormProps from './types';

function InitialForm(props: InitialFormProps, ref: ForwardedRef<InputHandle>) {
  return (
    <BaseInitialForm
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={ref}
    />
  );
}

InitialForm.displayName = 'InitialForm';

export default forwardRef(InitialForm);
