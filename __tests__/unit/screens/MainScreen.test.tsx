import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import MainScreen from '../../../src/screens/MainScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../../src/types/screens';
import { createMockNavigation } from '../../utils/testProps';

// Mock the navigation prop used by the component
// const mockNavigation = createMockNavigation('Main Screen');
const mockNavigation: StackNavigationProp<AppStackParamList, 'Main Screen'> = createMockNavigation();


describe('<MainScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    (mockNavigation.navigate as jest.Mock).mockClear(); // Typecast explicitly
  });

  const navigateFromMainScreen = (screenTestId: string, screenName: string) => {
    render(<MainScreen navigation={mockNavigation} />);
    
    const screenButton = screen.getByTestId(screenTestId);
    fireEvent.press(screenButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith(screenName);
  };

  it('renders correctly', () => {
    const tree = render(<MainScreen navigation={mockNavigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // it('navigate to the drinking session screen when in session', () => {
  //   // Mock current session data to be in session
  //   // For the sake of this example, I'm assuming the mock can be done as below, but you might need to adjust
  //   setCurrentSessionData({ in_session: true });

  //   navigateFromMainScreen('userInSessionWarningContainer', 'Drinking Session Screen');
  // });

  it('navigate to the profile screen', () => {
    navigateFromMainScreen('profile-icon', 'Profile Screen');
  });

  it('navigate to the social screen', () => {
    navigateFromMainScreen('social-icon', 'Social Screen');
  });
   
  it('navigate to the achievement screen', () => {
    navigateFromMainScreen('achievement-icon', 'Achievement Screen');
  });

});