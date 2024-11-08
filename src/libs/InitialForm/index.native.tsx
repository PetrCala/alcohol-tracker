import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import AppStateMonitor from '@libs/AppStateMonitor';
import BaseInitialForm from './BaseInitialForm';
import type {InputHandle} from './types';
import type InitialFormProps from './types';

function InitialForm(
  {scrollPageToTop, ...rest}: InitialFormProps,
  ref: ForwardedRef<InputHandle>,
) {
  const loginFormRef = useRef<InputHandle>();

  useImperativeHandle(ref, () => ({
    isInputFocused: loginFormRef.current
      ? loginFormRef.current.isInputFocused
      : () => false,
    clearDataAndFocus: loginFormRef.current
      ? loginFormRef.current?.clearDataAndFocus
      : () => null,
  }));

  useEffect(() => {
    if (!scrollPageToTop) {
      return;
    }

    return AppStateMonitor.addBecameActiveListener(() => {
      const isInputFocused = loginFormRef.current?.isInputFocused();
      if (!isInputFocused) {
        return;
      }

      scrollPageToTop();
    });
  }, [scrollPageToTop]);

  return (
    <BaseInitialForm
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      scrollPageToTop={scrollPageToTop}
      ref={loginFormRef}
    />
  );
}

InitialForm.displayName = 'InitialForm';

export default forwardRef(InitialForm);
