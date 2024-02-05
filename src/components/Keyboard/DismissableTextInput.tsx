import React from 'react';
import {
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface DismissableTextInputProps extends TextInputProps {
  customStyle?: StyleSheet.NamedStyles<any>; // Allows for custom styling
}

const DismissableTextInput: React.FC<DismissableTextInputProps> = ({
  style,
  ...props
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <TextInput {...props} style={style} />
    </TouchableWithoutFeedback>
  );
};

export default DismissableTextInput;
