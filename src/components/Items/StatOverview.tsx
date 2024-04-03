import {StyleSheet, Text, View} from 'react-native';
import StatItem from './StatItem';

export type StatData = {
  header: string;
  content: string;
}[];

type StatsOverviewProps = {
  statsData: StatData;
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({statsData}) => (
  <View style={styles.overviewStatsContainer}>
    {statsData.map((stat, index) => (
      <StatItem key={index} header={stat.header} content={stat.content} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  overviewStatsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly',
  },
});
