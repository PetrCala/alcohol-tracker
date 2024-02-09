import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
// import MainScreen from '../../../src/screens/MainScreen';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../../../src/types/screens';
import {createMockNavigation} from '../../utils/testProps';

// Mock the navigation prop used by the component
// const mockNavigation = createMockNavigation('Main Screen');
const mockNavigation: StackNavigationProp<AppStackParamList, 'Main Screen'> =
  createMockNavigation();

xdescribe('<MainScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    (mockNavigation.navigate as jest.Mock).mockClear(); // Typecast explicitly
  });

  const navigateFromMainScreen = (screenTestId: string, screenName: string) => {
    // render(<MainScreen navigation={mockNavigation} />);

    const screenButton = screen.getByTestId(screenTestId);
    fireEvent.press(screenButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith(screenName);
  };

  it('renders correctly', () => {
    // const tree = render(<MainScreen navigation={mockNavigation} />).toJSON();
    // expect(tree).toMatchSnapshot();
  });

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
