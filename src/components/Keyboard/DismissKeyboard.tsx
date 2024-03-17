import React from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

interface DismissKeyboardProps {
  children: any;
}

/**
 * A component that dismisses the keyboard when the user taps outside of the keyboard.
 */
const DismissKeyboard: React.FC<DismissKeyboardProps> = ({children}) => {
  return (
    <TouchableWithoutFeedback
      onPressIn={Keyboard.dismiss}
      onPress={Keyboard.dismiss}
      onLongPress={Keyboard.dismiss}
      accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export default DismissKeyboard;
