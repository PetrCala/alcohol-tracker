import React from 'react';
import {Image} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import BasicButton from '../../../src/components/Buttons/BasicButton';
import MenuIcon from '../../../src/components/Buttons/MenuIcon';

describe('BasicButton', () => {
  const onPressMock = jest.fn();
  const props = {
    text: 'Click me!',
    buttonStyle: {backgroundColor: 'blue', opacity: 1},
    textStyle: {color: 'white'},
    onPress: onPressMock,
  };

  it('should render the BasicButton component correctly', () => {
    const {getByTestId, getByText} = render(<BasicButton {...props} />);
    const button = getByTestId(props.text);
    const buttonText = getByText(props.text);

    expect(button).toBeDefined();
    expect(button.props.style).toEqual(props.buttonStyle);
    expect(buttonText).toBeDefined();
    expect(buttonText.props.style).toEqual(props.textStyle);
  });

  it('should call onPress function when button is pressed', () => {
    const {getByTestId} = render(<BasicButton {...props} />);
    const button = getByTestId(props.text);

    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});

describe('MenuIcon', () => {
  const props = {
    iconId: 'icon',
    iconSource: require('../assets/icons/test_icon.png'),
    containerStyle: {flex: 1, opacity: 1},
    iconStyle: {width: 20, height: 20},
    onPress: jest.fn(),
  };

  it('should render the MenuIcon component correctly', () => {
    const {getByTestId} = render(<MenuIcon {...props} />);
    const menuIcon = getByTestId(props.iconId);

    expect(menuIcon).toBeDefined();
    expect(menuIcon.props.accessibilityRole).toBe('button');
    expect(menuIcon.props.testID).toBe(props.iconId);
    expect(menuIcon.props.style).toEqual(props.containerStyle);

    const image = menuIcon.props.children[0];
    expect(image.type).toBe(Image);
    expect(image.props.source).toEqual(props.iconSource);
    expect(image.props.style).toEqual(props.iconStyle);
  });

  it('should call the onPress function when the menu icon is pressed', () => {
    const {getByTestId} = render(<MenuIcon {...props} />);
    const menuIcon = getByTestId(props.iconId);

    fireEvent.press(menuIcon);
    expect(props.onPress).toHaveBeenCalled();
  });
});
