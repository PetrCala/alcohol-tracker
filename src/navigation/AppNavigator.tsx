import MainScreen from '../screens/MainScreen';
import DrinkingSessionScreen from '../screens/DrinkingSessionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import SocialScreen from '../screens/SocialScreen';
import AchievementScreen from '../screens/AchievementScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import DayOverviewScreen from '../screens/DayOverviewScreen';
import EditSessionScreen from '../screens/EditSessionScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import TermsAndAgreementsScreen from '../screens/TermsAndAgreementsScreen';

import Stack from './Stack';
import { DatabaseDataProvider } from '../context/DatabaseDataContext';
import StatisticsScreen from '../screens/StatisticsScreen';

const AppNavigator = () => (
    <DatabaseDataProvider>
    <Stack.Navigator 
      initialRouteName='Main Screen'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name='Main Screen' component={MainScreen} />
      <Stack.Screen name='Profile Screen' component={ProfileScreen} />
      <Stack.Screen name='Main Menu Screen' component={MainMenuScreen} />
      <Stack.Screen name='Drinking Session Screen' component={DrinkingSessionScreen}/>
      <Stack.Screen name='Social Screen' component={SocialScreen}/>
      <Stack.Screen name='Achievement Screen' component={AchievementScreen}/>
      <Stack.Screen name='Statistics Screen' component={StatisticsScreen}/>
      <Stack.Screen name='Settings Screen' component={SettingsScreen}/>
      <Stack.Screen name='Preferences Screen' component={PreferencesScreen}/>
      <Stack.Screen name='Day Overview Screen' component={DayOverviewScreen}/>
      <Stack.Screen name='Edit Session Screen' component={EditSessionScreen}/>
      <Stack.Screen name='Session Summary Screen' component={SessionSummaryScreen}/>
      <Stack.Screen name='Terms And Agreements Screen' component={TermsAndAgreementsScreen} />
    </Stack.Navigator>
    </DatabaseDataProvider>
);

export default AppNavigator;