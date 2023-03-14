import 'react-native';
import { TouchableOpacity, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';

import StartSessionButton from '../src/components/Buttons/SessionButton';
import MenuIcon from '../src/components/Buttons/MenuIcon';
import MainScreen from '../src/screens/MainScreen';

describe('TestNavigationButtons', () => {

    it('StartSessionButton triggers onPress', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<StartSessionButton onPress={onPressMock} />);
        fireEvent.press(getByText('+'));
        expect(onPressMock).toHaveBeenCalled();
    });

    it('Icons call onPress functions when pressed', () => {
        const idMock = 'mock-id';
        const onPressMock = jest.fn();
        const { getByRole } = render(
            <MenuIcon
                iconId={idMock}
                iconSource={require('../src/assets/icons/social.png')}
                onPress={onPressMock}
            />,
        );

        const image = getByRole('button');
        fireEvent.press(image);

        expect(onPressMock).toHaveBeenCalledTimes(1);
    });
});

    // it('navigates to desired screen when image is pressed', () => {
    //     const { NavigationStack } = createNavigator(
    //     ({ initialRouteName }) => {
    //         const { navigate } = useNavigator();
    //         return (
    //         <NavigationContainer>
    //             <MainScreen
    //             navigateTo="OtherScreen"
    //             onPress={() => navigate('OtherScreen')}
    //             />
    //         </NavigationContainer>
    //         );
    //     },
    //     { initialRouteName: 'MainScreen' }
    //     );
    //     const { getByA11yRole } = render(<NavigationStack />);

    //     // Get touchable opacity element with accessibilityLabel="Image 1"
    //     const touchable = getByA11yLabel('Image 1');

    //     // Simulate press event on touchable opacity element
    //     fireEvent.press(touchable);

    //     // Check that navigation has occurred
    //     expect(getByA11yLabel('Other Screen')).toBeDefined();
    // });