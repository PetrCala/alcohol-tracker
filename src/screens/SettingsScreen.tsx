import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';

type SettingsProps = {
  navigation: any;
}

// const SettingsItem: React.FC<SettingsItemProps> = ({
//     heading,
//     data,
//     index
//   }) => (
//     <View key={index}>
//     <View style={styles.groupMarker}>
//         <Text style={styles.groupText}>{heading}</Text>
//     </View>
//     {data.map((button, bIndex) => (
//         <TouchableOpacity key={bIndex} style={styles.button} onPress={button.action}>
//             <Image source={button.icon} style={styles.icon} />
//             <Text style={styles.buttonText}>{button.label}</Text>
//         </TouchableOpacity>
//     ))}
//     </View>
// );

const SettingsScreen = (props: SettingsProps) => {
  const { navigation } = props;

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-settings-screen'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
    </View>
  );
};

export default SettingsScreen;


const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
});