import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import StatisticsScreen from '../../../src/screens/StatisticsScreen';

// Mock the navigation prop used by the component
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('<StatisticsScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    const tree = render(
      <StatisticsScreen navigation={mockNavigation} />,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('escape from the statistics screen', () => {
    const {getByTestId} = render(
      <StatisticsScreen navigation={mockNavigation} />,
    );

    const backButton = getByTestId('escape-statistics-screen');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
