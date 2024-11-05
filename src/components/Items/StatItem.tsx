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
      <View style={styles.statItemContainer}>
        <Text
          style={[
            styles.textHeadlineXXXLarge,
            styles.textAlignCenter,
            styles.appColor,
          ]}>
          {content}
        </Text>
        <Text
          style={[styles.textNormal, styles.textAlignCenter]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {header}
        </Text>
      </View>
    </View>
  );
};

export default StatItem;
