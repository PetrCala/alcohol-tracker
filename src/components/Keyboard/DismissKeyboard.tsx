import React from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

type DismissKeyboardProps = {
  children: any;
  disable?: boolean;
};

/**
 * A component that dismisses the keyboard when the user taps outside of the keyboard.
 */
const DismissKeyboard: React.FC<DismissKeyboardProps> = ({
  children,
  disable,
}) => {
  return disable ? (
    children
  ) : (
    <TouchableWithoutFeedback
      onPressIn={Keyboard.dismiss}
      onPress={Keyboard.dismiss}
      onLongPress={Keyboard.dismiss}
      accessible>
      {children}
    </TouchableWithoutFeedback>
  );
};

export default DismissKeyboard;
