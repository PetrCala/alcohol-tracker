import { StackNavigationProp } from '@react-navigation/stack';
import { DrinkingSessionData, CurrentSessionData, PreferencesData, UserData, DrinkingSessionArrayItem } from './database';
import { RouteProp } from '@react-navigation/native';
import { DateObject } from './components';


export type AppStackParamList = {
  'Login Screen': undefined;
  'Force Update Screen': undefined;
  'Sign Up Screen': {
    loginEmail: string;
  };
  'Main Screen': undefined;
  'Main Menu Screen': {
    userData: UserData;
    preferences: PreferencesData;
  };
  'Drinking Session Screen': { 
    session: DrinkingSessionArrayItem;
    sessionKey: string;
    preferences: PreferencesData;
  };
  'Profile Screen': undefined;
  'Social Screen': undefined;
  'Achievement Screen': undefined;
  'Settings Screen': {
    preferences: PreferencesData;
  };
  'Preferences Screen': {
    userData: UserData;
    preferences: PreferencesData;
  };
  'Day Overview Screen': { 
    dateObject: DateObject;
    drinkingSessionData: DrinkingSessionArrayItem[];
    drinkingSessionKeys: string[]; // Stored explicitly to alleviate database storage space
    preferences: PreferencesData;
  };
  'Edit Session Screen': {
    session: DrinkingSessionArrayItem;
    sessionKey: string;
    preferences: PreferencesData;
  };
  'Session Summary Screen': {
    session: DrinkingSessionArrayItem;
    sessionKey: string;
    preferences: PreferencesData;
  };
  'Terms And Agreements Screen': undefined;
};

export type ForceUpdateScreen = {
  navigation?: StackNavigationProp<AppStackParamList, 'Force Update Screen'>;
}

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

export type MainMenuScreenProps = {
  route?: RouteProp<AppStackParamList, 'Main Menu Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Main Menu Screen'>;
}

export type DrinkingSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Drinking Session Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Drinking Session Screen'>;
}

export type SettingsScreenProps = {
  route?: RouteProp<AppStackParamList, 'Settings Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Settings Screen'>;
}

export type PreferencesScreenProps = {
  route?: RouteProp<AppStackParamList, 'Preferences Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Preferences Screen'>;
}

export type DayOverviewScreenProps = {
  route?: RouteProp<AppStackParamList, 'Day Overview Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Day Overview Screen'>;
}
 
export type EditSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Edit Session Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Edit Session Screen'>;
}

export type SessionSummaryScreenProps = {
  route?: RouteProp<AppStackParamList, 'Session Summary Screen'>;
  navigation?: StackNavigationProp<AppStackParamList, 'Session Summary Screen'>;
}

export type TermsAndAgreementsScreenProps = {
  navigation?: StackNavigationProp<AppStackParamList, 'Terms And Agreements Screen'>;
}
