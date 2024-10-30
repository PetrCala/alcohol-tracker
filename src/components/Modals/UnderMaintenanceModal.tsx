import type {Config, Maintenance} from '@src/types/onyx';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {View, Text, Image} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useLocalize from '@hooks/useLocalize';

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

function UnderMaintenanceModal({config}: UnderMaintenanceProps) {
  const styles = useThemeStyles();
  const {windowHeight, windowWidth} = useWindowDimensions();
  const {translate} = useLocalize();
  const smallerScreenSize = Math.min(windowHeight, windowWidth);
  const defaultMaintenance: Maintenance = {
    maintenance_mode: true,
    start_time: 1704067200,
    end_time: 1704067200,
  };
  const maintenance = config?.maintenance ?? defaultMaintenance;
  const startTime = getHourMinute(new Date(maintenance.start_time));
  const endTime = getHourMinute(new Date(maintenance.end_time));

  return (
    <ScreenWrapper
      includePaddingTop={false}
      includeSafeAreaPaddingBottom={false}
      testID={'UnderMaintenanceModal'}>
      <View style={[styles.fullScreenCenteredContent, styles.p2, styles.pb8]}>
        <Text style={[styles.textHeadlineXXXLarge, styles.mb3]}>
          {translate('maintenance.heading')}
        </Text>
        <Text style={[styles.textLarge, styles.textAlignCenter, styles.mb3]}>
          {translate('maintenance.text')}
        </Text>
        <Text style={[styles.textLarge, styles.textStrong, styles.pb5]}>
          {startTime} - {endTime}
        </Text>
        <Image
          style={styles.maintenanceBeaverImage(smallerScreenSize)}
          source={KirokuIcons.UnderMaintenance}
        />
      </View>
    </ScreenWrapper>
  );
}

export default UnderMaintenanceModal;
