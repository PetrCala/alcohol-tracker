import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AppStackParamList = {
  'Main Screen': undefined;
  'Drinking Session Screen': { current_units: number};
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
}

export type DrinkingSessionScreenProps = {
  route: any;
  navigation: any;
}

export type UserDataProps = {
  current_units: number;
  in_session: boolean;
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

// Sessions calendar props
 
export type SessionsCalendarProps = {
    drinkingSessionData: DrinkingSessionData[];
    onDayPress: (day: any) => void;
}

// type SessionSCalendarCustomStyles = {
//     container: {
//         backgroundColor: string;
//         // elevation?: number;
//     }
//     // ,
//     // text?: {
//     //     color: string
//     // }
// }

// type SessionCalendarDateMarkingCustom = {
//     [date: string]: SessionSCalendarCustomStyles;
// }

// export type SessionsCalendarMarkedDates = {
//     [date: string]: SessionCalendarDateMarkingCustom;
// };

export type SessionsCalendarMarkedDates = {
    [date: string]: {
        color?: string
    };
};

// Loading data props

export type LoadingDataProps = {
    loadingText: string
}