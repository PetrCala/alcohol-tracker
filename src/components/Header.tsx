import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MenuIcon from './Buttons/MenuIcon';
import commonStyles from '@src/styles/commonStyles';

type HeaderProps = {
  headerText: string;
  onGoBack: () => void;
};

const Header: React.FC<HeaderProps> = ({headerText, onGoBack}) => {
  return (
    <View style={commonStyles.mainHeader}>
      <MenuIcon
        iconId="escape-statistics-screen"
        iconSource={require('../../../assets/icons/arrow_back.png')}
        containerStyle={styles.backArrowContainer}
        iconStyle={styles.backArrow}
        onPress={() => onGoBack()}
      />
      <View style={styles.menuContainer}>
        <Text style={styles.sectionText}>{headerText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 200,
  },
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
});

export default Header;
