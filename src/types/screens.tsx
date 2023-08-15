import { StackNavigationProp } from '@react-navigation/stack';


type AppStackParamList = {
  'Login Screen': undefined;
  'Sign Up Screen': undefined;
  'Main Screen': undefined;
  'Drinking Session Screen': { 
    timestamp: number;
    current_units: number
  };
  'Profile Screen': undefined;
  'Social Screen': undefined;
  'Achievement Screen': undefined;
  'Settings Screen': undefined;
  'Day Overview Screen': { timestamp: number };
};

export type LoginScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Login Screen'>;
}

export type SignUpScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Sign Up Screen'>;
}

export type MainScreenProps = {
    navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
}

export type DrinkingSessionScreenProps = {
  route: any;
  navigation: any;
}

export type DayOverviewScreenProps = {
    route: any;
    navigation: any;
}
 
export type EditSessionScreenProps = {
  route: any;
  navigation: any;
}
