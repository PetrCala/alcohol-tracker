import {StyleSheet, Text, View} from 'react-native';
import StatItem from './StatItem';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

export type StatData = Array<{
  header: string;
  content: string;
}>;

type StatsOverviewProps = {
  statsData: StatData;
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({statsData}) => {
  const styles = useThemeStyles();

  return (
    <View style={styles.statOverviewContainer}>
      {statsData.map((stat, index) => (
        <StatItem key={index} header={stat.header} content={stat.content} />
      ))}
    </View>
  );
};
