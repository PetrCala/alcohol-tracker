import { StackNavigationProp } from '@react-navigation/stack';
import { DrinkingSessionData, CurrentSessionData, PreferencesData } from './database';
import { RouteProp } from '@react-navigation/native';
import { DateObject } from './components';


export type AppStackParamList = {
  'Login Screen': undefined;
  'Sign Up Screen': {
    loginEmail: string;
  };
  'Main Screen': undefined;
  'Drinking Session Screen': { 
    current_session_data: CurrentSessionData;
  };
  'Profile Screen': undefined;
  'Social Screen': undefined;
  'Achievement Screen': undefined;
  'Settings Screen': undefined;
  'Day Overview Screen': { 
    date_object: DateObject;
    preferences: PreferencesData;
  };
  'Edit Session Screen': { session: DrinkingSessionData }
};

export type LoginScreenProps = {
    navigation?: StackNavigationProp<AppStackParamList, 'Login Screen'>;
}

export type SignUpScreenProps = {
  route?: RouteProp<AppStackParamList, 'Sign Up Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Sign Up Screen'>;
}

export type MainScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
}

export type DrinkingSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Drinking Session Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Drinking Session Screen'>;
}

export type DayOverviewScreenProps = {
  route?: RouteProp<AppStackParamList, 'Day Overview Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Day Overview Screen'>;
}
 
export type EditSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Edit Session Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Edit Session Screen'>;
}
