import React from 'react';
import {TouchableOpacity, Text, View} from 'react-native';

type Props = {
  text: string;
  buttonStyle: any;
  textStyle: any;
  onPress: () => void;
};

/**
 * Button that can be stylized in the .css and that does something on press.
 */
const BasicButton = ({text, buttonStyle, textStyle, onPress}: Props) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      id={text}
      testID={text}
      style={buttonStyle}
      onPress={onPress}>
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

export default BasicButton;
