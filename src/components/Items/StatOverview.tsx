import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import StatItem from './StatItem';

type StatData = Array<{
  header: string;
  content: string;
}>;

type StatsOverviewProps = {
  statsData: StatData;
};

function StatOverview({statsData}: StatsOverviewProps) {
  const styles = useThemeStyles();

  return (
    <View style={styles.statOverviewContainer}>
      {statsData.map(stat => (
        <StatItem
          key={stat.header}
          header={stat.header}
          content={stat.content}
        />
      ))}
    </View>
  );
}

export default StatOverview;
export type {StatData};
