import React from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

interface DismissKeyboardProps {
  children: any;
}

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
