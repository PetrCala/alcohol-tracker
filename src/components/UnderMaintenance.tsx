import {ConfigProps} from '@src/types/database';
import {View, StyleSheet, Text, Image, Dimensions} from 'react-native';
import CONST from '@src/CONST';

type UnderMaintenanceProps = {
  config: ConfigProps | null;
};

const UnderMaintenance = ({config}: UnderMaintenanceProps) => {
  const maintenance = config?.maintenance;
  const maintenanceMessage = maintenance?.message ?? 'Under maintenance';
  const start_time = maintenance?.start_time;
  const end_time = maintenance?.end_time;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{maintenanceMessage}</Text>
      <Image
        style={styles.beaverImage}
        source={require('../../assets/images/under_maintenance.jpg')}
      />
    </View>
  );
};

export default UnderMaintenance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF99',
  },
  text: {
    fontSize: 40,
    color: 'black',
  },
  beaverImage: {
    width: CONST.SCREEN_WIDTH,
    height: CONST.SCREEN_WIDTH,
  },
});
