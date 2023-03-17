import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

type Props = {
  text: string;
  buttonStyle: any;
  textStyle: any;
  onPress: () => void;
}

/**
 * Button that can be stylized in the .css and that does something on press.
 */
const BasicButton = (props: Props) => {
  
  const { text, buttonStyle, textStyle, onPress } = props;

  return(
    <TouchableOpacity
      testID = 'basic-button'
      style={buttonStyle}
      onPress={onPress}>
        <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

export default BasicButton;