import { StackNavigationProp } from '@react-navigation/stack';
import { DrinkingSessionData, CurrentSessionData, PreferencesData, UserData, DrinkingSessionArrayItem } from './database';
import { RouteProp } from '@react-navigation/native';
import { DateObject } from './components';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  'Login Screen': undefined;
  'Force Update Screen': undefined;
  'Sign Up Screen': {
    loginEmail: string;
  };
};

export type AppStackParamList = {
  'Main Screen': undefined;
  'Main Menu Screen': undefined;
  'Drinking Session Screen': { 
    session: DrinkingSessionArrayItem;
    sessionKey: string;
    preferences: PreferencesData;
  };
  'Profile Screen': undefined;
  'Social Screen': undefined;
  'Achievement Screen': undefined;
  'Statistics Screen': undefined;
  'Settings Screen': undefined;
  'Preferences Screen': undefined;
  'Day Overview Screen': { dateObject: DateObject };
  'Edit Session Screen': { 
    session: DrinkingSessionArrayItem, 
    sessionKey: string 
  };
  'Session Summary Screen': {
    session: DrinkingSessionArrayItem;
    sessionKey: string;
  };
  'Terms And Agreements Screen': undefined;
  'Privacy Policy Screen': undefined;
};

export type ForceUpdateScreen = {
  // navigation?: StackNavigationProp<AuthStackParamList, 'Force Update Screen'>;
  navigation?: any
}

export type LoginScreenProps = {
  // navigation?: StackNavigationProp<AuthStackParamList, 'Login Screen'>;
  // navigation: StackNavigationProp<RootStackParamList, 'Auth'>;
  navigation?: any
}

export type SignUpScreenProps = {
  route?: RouteProp<AuthStackParamList, 'Sign Up Screen'>;
  // navigation?: StackNavigationProp<AuthStackParamList, 'Sign Up Screen'>;
  navigation?: any
}

export type MainScreenProps = {
    // navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
  navigation?: any
}

export type MainMenuScreenProps = {
  route?: RouteProp<AppStackParamList, 'Main Menu Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Main Menu Screen'>;
  navigation?: any
}

export type DrinkingSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Drinking Session Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Drinking Session Screen'>;
  navigation?: any
}

export type SettingsScreenProps = {
  route?: RouteProp<AppStackParamList, 'Settings Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Settings Screen'>;
  navigation?: any
}

export type PreferencesScreenProps = {
  route?: RouteProp<AppStackParamList, 'Preferences Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Preferences Screen'>;
  navigation?: any
}

export type DayOverviewScreenProps = {
  route?: RouteProp<AppStackParamList, 'Day Overview Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Day Overview Screen'>;
  navigation?: any
}
 
export type EditSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Edit Session Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Edit Session Screen'>;
  navigation?: any
}

export type SessionSummaryScreenProps = {
  route?: RouteProp<AppStackParamList, 'Session Summary Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Session Summary Screen'>;
  navigation?: any
}

export type TermsOfServiceScreenProps = {
  // navigation?: StackNavigationProp<AppStackParamList, 'Terms Of Service Screen'>;
  navigation?: any
}

export type PrivacyPolicyScreenProps = {
  // navigation?: StackNavigationProp<AppStackParamList, 'Privacy Policy Screen'>;
  navigation?: any
}