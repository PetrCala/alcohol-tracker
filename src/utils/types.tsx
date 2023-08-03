import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AppStackParamList = {
  'Main Screen': undefined;
  'Drinking Session Screen': undefined;
  'Profile Screen': undefined;
  'Social Screen': undefined;
  'Achievement Screen': undefined;
  'Settings Screen': undefined;
  'Day Overview Screen': { timestamp: number };
};

export type MainScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
}

export type DayOverviewScreenProps = {
    route: any
    navigation: any
    // route: RouteProp<AppStackParamList, 'Day Overview Screen'>;
    // navigation: StackNavigationProp<AppStackParamList, 'Day Overview Screen'>;
}

export type UserData = {
  username: string;
};

export type DrinkingSessionIds = {
  key: string;
}

export type DrinkingSessionData = {
  session_id: any;
  timestamp: number;
  units: number;
  user_id: string;
}

export type DrinkingSessionProps = {
    session: DrinkingSessionData
    sessionColor: string
}