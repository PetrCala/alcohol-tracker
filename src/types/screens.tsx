import { StackNavigationProp } from '@react-navigation/stack';
import { DrinkingSessionData, UserCurrentSessionData } from './database';
import { RouteProp } from '@react-navigation/native';


type AppStackParamList = {
  'Login Screen': undefined;
  'Sign Up Screen': {
    loginEmail: string;
  };
  'Main Screen': undefined;
  'Drinking Session Screen': { 
    current_session_data: UserCurrentSessionData;
  };
  'Profile Screen': undefined;
  'Social Screen': undefined;
  'Achievement Screen': undefined;
  'Settings Screen': undefined;
  'Day Overview Screen': { timestamp: number };
  'Edit Session Screen': { session: DrinkingSessionData }
};

export type LoginScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Login Screen'>;
}

export type SignUpScreenProps = {
  route: any;
  navigation: StackNavigationProp<AppStackParamList, 'Sign Up Screen'>;
}

export type MainScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
}

export type DrinkingSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Drinking Session Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Drinking Session Screen'>;
}

export type DayOverviewScreenProps = {
    route: any;
    navigation: any;
}
 
export type EditSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Edit Session Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Edit Session Screen'>;
}
