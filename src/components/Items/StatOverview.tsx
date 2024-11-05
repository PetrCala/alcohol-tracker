import {StyleSheet, Text, View} from 'react-native';
import StatItem from './StatItem';
import useTheme from '@hooks/useTheme';

export type StatData = Array<{
  header: string;
  content: string;
}>;

type StatsOverviewProps = {
  statsData: StatData;
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({statsData}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        justifyContent: 'space-evenly',
      }}>
      {statsData.map((stat, index) => (
        <StatItem key={index} header={stat.header} content={stat.content} />
      ))}
    </View>
  );
};
