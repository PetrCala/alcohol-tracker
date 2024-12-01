import type {Config, Maintenance} from '@src/types/onyx';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {View, Image} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import CONST from '@src/CONST';
import Text from '@components/Text';

type UnderMaintenanceProps = {
  /** Configuration database object */
  config: Config | undefined | null;
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
    maintenance_mode: false,
  };
  const maintenance = config?.maintenance ?? defaultMaintenance;
  const startTime = maintenance?.start_time
    ? getHourMinute(new Date(maintenance.start_time))
    : null;
  const endTime = maintenance?.end_time
    ? getHourMinute(new Date(maintenance.end_time))
    : null;

  return (
    <SafeAreaConsumer>
      {() => (
        <Modal
          onClose={() => {}}
          isVisible={true}
          type={CONST.MODAL.MODAL_TYPE.CENTERED}>
          <View
            style={[styles.fullScreenCenteredContent, styles.p2, styles.pb8]}>
            <Text style={[styles.textHeadlineXXXLarge, styles.mb3]}>
              {translate('maintenance.heading')}
            </Text>
            <Text
              style={[styles.textLarge, styles.textAlignCenter, styles.mb3]}>
              {translate('maintenance.text')}
            </Text>
            <Text style={[styles.textLarge, styles.textStrong, styles.pb5]}>
              {startTime || translate('common.unknown')} -
              {endTime || translate('common.unknown')}
            </Text>
            <Image
              style={styles.maintenanceBeaverImage(smallerScreenSize)}
              source={KirokuIcons.UnderMaintenance}
            />
          </View>
        </Modal>
      )}
    </SafeAreaConsumer>
  );
}

export default UnderMaintenanceModal;
