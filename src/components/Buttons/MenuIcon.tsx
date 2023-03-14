import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import styles from '../../styles';

type Props = {
  iconId: string;
  iconSource: any;
  onPress: () => void;
}

const MenuIcon = (props: Props) => {
  const { iconId, iconSource, onPress } = props;

  return(
      <TouchableOpacity
        id={iconId}
        accessibilityRole='button' 
        onPress={onPress} 
        style={styles.menuIconContainer}>
          <Image source={iconSource} style={styles.menuIcon} />
      </TouchableOpacity>
  );
};

export default MenuIcon;
