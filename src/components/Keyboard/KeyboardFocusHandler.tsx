import React from 'react';
import {Keyboard} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

// Define props type to include children of type ReactNode
type KeyboardFocusHandlerProps = {
  children?: React.ReactNode;
};

function KeyboardFocusHandler({children}: KeyboardFocusHandlerProps) {
  useFocusEffect(
    React.useCallback(() => {
      // Function to dismiss the keyboard
      const dismissKeyboard = () => {
        Keyboard.dismiss();
      };

      // Dismiss keyboard when the screen gains focus
      dismissKeyboard();

      // Cleanup function to dismiss keyboard when the screen loses focus
      return () => dismissKeyboard();
    }, []),
  );

  return children;
}

export default KeyboardFocusHandler;
