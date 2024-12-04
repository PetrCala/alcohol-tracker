import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import StatItem from './StatItem';

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
