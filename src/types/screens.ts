// Soon, this will be removed and replaced with the new types
import {RouteProp} from '@react-navigation/native';
import {DateObject} from './time';
import {
  DrinkingSession,
  FriendRequestList,
  Preferences,
  DrinkingSessionArray,
  Profile,
  FriendList,
} from './database';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  'Login Screen': undefined;
  'Force Update Screen': undefined;
  'Sign Up Screen': undefined;
};

export type AppStackParamList = {
  'Home Screen': undefined;
  'Main Menu Screen': undefined;
  'Drinking Session Screen': {
    session: DrinkingSession;
    sessionKey: string;
    preferences: Preferences;
  };
  'Profile Screen': {
    userId: string;
    profileData: Profile;
    friends: FriendList | null;
    drinkingSessionData: DrinkingSessionArray | null;
    preferences: Preferences | null;
  };
  'Social Screen': {
    screen: string; // 'Friend List' | 'Friend Requests' | 'Search';
  };
  'Friends Friends Screen': {
    userId: string;
    friends: FriendList | null;
  };
  'Achievement Screen': undefined;
  'Statistics Screen': undefined;
  'Settings Screen': undefined;
  'Preferences Screen': undefined;
  'Day Overview Screen': {dateObject: DateObject};
  'Edit Session Screen': {
    session: DrinkingSession;
    sessionKey: string;
  };
  'Session Summary Screen': {
    session: DrinkingSession;
    sessionKey: string;
  };
  'Terms And Agreements Screen': undefined;
  'Privacy Policy Screen': undefined;
};

export type ForceUpdateScreen = {
  // navigation?: StackNavigationProp<AuthStackParamList, 'Force Update Screen'>;
  navigation?: any;
};

export type LoginScreenProps = {
  // navigation?: StackNavigationProp<AuthStackParamList, 'Login Screen'>;
  // navigation: StackNavigationProp<RootStackParamList, 'Auth'>;
  navigation?: any;
};

export type SignUpScreenProps = {
  route?: RouteProp<AuthStackParamList, 'Sign Up Screen'>;
  // navigation?: StackNavigationProp<AuthStackParamList, 'Sign Up Screen'>;
  navigation?: any;
};

export type HomeScreenProps = {
  // navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
  navigation?: any;
};

export type MainMenuScreenProps = {
  route?: RouteProp<AppStackParamList, 'Main Menu Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Main Menu Screen'>;
  navigation?: any;
};

export type SocialScreenProps = {
  route?: RouteProp<AppStackParamList, 'Social Screen'>;
  // navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
  navigation?: any;
};

export type FriendsFriendsScreenProps = {
  route?: RouteProp<AppStackParamList, 'Friends Friends Screen'>;
  // navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
  navigation?: any;
};

export type ProfileProps = {
  route?: RouteProp<AppStackParamList, 'Profile Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Profile Screen'>;
  navigation?: any;
};

export type DrinkingSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Drinking Session Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Drinking Session Screen'>;
  navigation?: any;
};

export type SettingsScreenProps = {
  route?: RouteProp<AppStackParamList, 'Settings Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Settings Screen'>;
  navigation?: any;
};

export type PreferencesScreenProps = {
  route?: RouteProp<AppStackParamList, 'Preferences Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Preferences Screen'>;
  navigation?: any;
};

export type DayOverviewScreenProps = {
  route?: RouteProp<AppStackParamList, 'Day Overview Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Day Overview Screen'>;
  navigation?: any;
};

export type EditSessionScreenProps = {
  route?: RouteProp<AppStackParamList, 'Edit Session Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Edit Session Screen'>;
  navigation?: any;
};

export type SessionSummaryScreenProps = {
  route?: RouteProp<AppStackParamList, 'Session Summary Screen'>;
  // navigation?: StackNavigationProp<AppStackParamList, 'Session Summary Screen'>;
  navigation?: any;
};

export type TermsOfServiceScreenProps = {
  // navigation?: StackNavigationProp<AppStackParamList, 'Terms Of Service Screen'>;
  navigation?: any;
};

export type PrivacyPolicyScreenProps = {
  // navigation?: StackNavigationProp<AppStackParamList, 'Privacy Policy Screen'>;
  navigation?: any;
};

export type FriendListScreenProps = {
  navigation: any;
  friends: FriendList | undefined;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

export type SearchScreenProps = {
  friendRequests: FriendRequestList | undefined;
  friends: FriendList | undefined;
};
