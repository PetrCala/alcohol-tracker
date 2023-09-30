import ForceUpdateScreen from '../screens/ForceUpdateScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

import Stack from './Stack';

const AuthNavigator = () => (
  <Stack.Navigator 
    initialRouteName='Login Screen'
    screenOptions={{
      headerShown: false
    }}
  >
    <Stack.Screen name='Login Screen' component={LoginScreen} />
    <Stack.Screen name='Sign Up Screen' component={SignUpScreen} />
    <Stack.Screen name='Force Update Screen' component={ForceUpdateScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;