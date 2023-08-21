import { StackNavigationProp } from "@react-navigation/stack"
import { AppStackParamList } from "../src/types/screens"

type MockedNavigationProp = {
    [K in keyof StackNavigationProp<AppStackParamList, any>]: jest.Mock;
};

export function createMockNavigation(): MockedNavigationProp {
    const mockFunction = jest.fn();

    // Create a proxy that returns a mock function for every key accessed
    return new Proxy({}, {
        get: () => mockFunction
    }) as MockedNavigationProp;
};