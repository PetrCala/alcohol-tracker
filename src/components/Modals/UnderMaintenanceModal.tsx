import type {Config, Maintenance} from '@src/types/database';
import * as KirokuImages from '@components/Icon/KirokuImages';
import {View, StyleSheet, Text, Image, Dimensions} from 'react-native';

type UnderMaintenanceProps = {
  config: Config | null;
};

/** Given a date, return this date in human-legible hours and minutes */
function getHourMinute(date: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${hours}:${minutes}`;
}

const UnderMaintenanceModal = ({config}: UnderMaintenanceProps) => {
  const defaultMaintenance: Maintenance = {
    maintenance_mode: true,
    start_time: 1704067200,
    end_time: 1704067200,
  };
  const maintenance = config?.maintenance ?? defaultMaintenance;
  const startTime = getHourMinute(new Date(maintenance.start_time));
  const endTime = getHourMinute(new Date(maintenance.end_time));

  return (
    <View style={styles.container}>
      <Image
        style={styles.beaverImage}
        source={KirokuImages.UnderMaintenance}
      />
      <Text style={styles.heading}>Under maintenance</Text>
      <Text style={[styles.text, styles.messageText]}>
        We are currently under maintenance for the following time frame:
      </Text>
      <Text style={styles.text}>
        {startTime} - {endTime}
      </Text>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF99',
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Text shadow for legibility
    textShadowOffset: {width: 0.5, height: 0.5},
    textShadowRadius: 1,
  },
  text: {
    fontSize: 20,
    color: 'black',
    lineHeight: 28,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    textAlign: 'center',
  },
  messageText: {
    marginBottom: 20,
  },
  beaverImage: {
    width: screenWidth > screenHeight ? screenHeight * 0.8 : screenWidth * 0.8,
    height: screenWidth > screenHeight ? screenHeight * 0.8 : screenWidth * 0.8,
    aspectRatio: 1,
    marginTop: -50,
    marginBottom: 30,
    borderRadius: 10,
  },
});

export default UnderMaintenanceModal;
