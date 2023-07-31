import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';

type Props = {
  iconId: string;
  iconSource: any;
  containerStyle: any;
  iconStyle: any;
  onPress: () => void;
}

/**
 * A touchable icon, that can be stylized.
 */
const MenuIcon = (props: Props) => {
  const { iconId, iconSource, containerStyle, iconStyle, onPress } = props;

  return(
    <TouchableOpacity
      id={iconId} 
      testID = {iconId}
      accessibilityRole='button' 
      onPress={onPress} 
      style={containerStyle}>
        <Image source={iconSource} style={iconStyle} />
    </TouchableOpacity>
  );
};

export default MenuIcon;
