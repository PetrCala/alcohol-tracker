import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {View} from 'react-native';

type StatItemProps = {
  header: string;
  content: string;
};

function StatItem({header, content}: StatItemProps) {
  const styles = useThemeStyles();

  return (
    <View
      style={[
        styles.flexColumn,
        styles.alignItemsCenter,
        styles.justifyContentCenter,
      ]}>
      <Text style={[styles.statItemText]}>{content}</Text>
      <Text
        style={styles.statItemLabelText}
        numberOfLines={2}
        ellipsizeMode="tail">
        {header}
      </Text>
    </View>
  );
}

export default StatItem;
