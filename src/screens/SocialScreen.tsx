import React, {useState} from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';

type SocialProps = {
  navigation: any;
}

const SocialScreen = (props: SocialProps) => {
  const { navigation } = props;

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.header}>
        <MenuIcon
          iconId='escape-social-screen'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
    </View>
  );
};

export default SocialScreen;