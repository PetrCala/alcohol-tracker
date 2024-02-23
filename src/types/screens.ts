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
  // 'Day Overview Screen': {dateObject: DateObject};
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
