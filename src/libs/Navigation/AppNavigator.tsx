import {SafeAreaView, StyleSheet} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import MainScreen from '../../screens/MainScreen';
import DrinkingSessionScreen from '../../screens/DrinkingSessionScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import MainMenuScreen from '../../screens/MainMenuScreen';
import SocialScreen from '../../screens/Social/SocialScreen';
import AchievementScreen from '../../screens/AchievementScreen';
import StatisticsScreen from '../../screens/StatisticsScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import PreferencesScreen from '../../screens/PreferencesScreen';
import DayOverviewScreen from '../../screens/DayOverviewScreen';
import EditSessionScreen from '../../screens/EditSessionScreen';
import SessionSummaryScreen from '../../screens/SessionSummaryScreen';
import TermsOfServiceScreen from '../../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicyScreen';

import Stack from './Stack';
import {DatabaseDataProvider} from '../../context/global/DatabaseDataContext';
import FriendsFriendsScreen from '@screens/Social/FriendsFriendsScreeen';

const AppNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaProvider
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        },
      ]}>
      <DatabaseDataProvider>
        <Stack.Navigator
          initialRouteName="Main Screen"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Main Screen" component={MainScreen} />
          <Stack.Screen name="Profile Screen" component={ProfileScreen} />
          <Stack.Screen name="Main Menu Screen" component={MainMenuScreen} />
          <Stack.Screen
            name="Drinking Session Screen"
            component={DrinkingSessionScreen}
          />
          <Stack.Screen name="Social Screen" component={SocialScreen} />
          <Stack.Screen
            name="Friends Friends Screen"
            component={FriendsFriendsScreen}
          />
          <Stack.Screen
            name="Achievement Screen"
            component={AchievementScreen}
          />
          <Stack.Screen name="Statistics Screen" component={StatisticsScreen} />
          <Stack.Screen name="Settings Screen" component={SettingsScreen} />
          <Stack.Screen
            name="Preferences Screen"
            component={PreferencesScreen}
          />
          <Stack.Screen
            name="Day Overview Screen"
            component={DayOverviewScreen}
          />
          <Stack.Screen
            name="Edit Session Screen"
            component={EditSessionScreen}
          />
          <Stack.Screen
            name="Session Summary Screen"
            component={SessionSummaryScreen}
          />
          <Stack.Screen
            name="Terms Of Service Screen"
            component={TermsOfServiceScreen}
          />
          <Stack.Screen
            name="Privacy Policy Screen"
            component={PrivacyPolicyScreen}
          />
        </Stack.Navigator>
      </DatabaseDataProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    // ...
  },
});

export default AppNavigator;
