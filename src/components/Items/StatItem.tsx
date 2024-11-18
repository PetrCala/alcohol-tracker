import useThemeStyles from '@hooks/useThemeStyles';
import {Text, View} from 'react-native';

type StatItemProps = {
  header: string;
  content: string;
};

// StatItem component with types
const StatItem: React.FC<StatItemProps> = ({header, content}) => {
  const styles = useThemeStyles();

  return (
    <View style={styles.flexRow}>
      <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
        <Text style={[styles.statItemText]}>{content}</Text>
        <Text
          style={styles.statItemHeaderText}
          numberOfLines={2}
          ellipsizeMode="tail">
          {header}
        </Text>
      </View>
    </View>
  );
};

export default StatItem;
