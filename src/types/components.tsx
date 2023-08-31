import { ImageSourcePropType } from "react-native";
import { DrinkingSessionData, PreferencesData } from "./database";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "./screens";

// FeedbackPopup props

export type FeedbackPopupProps = {
    visible: boolean;
    transparent: boolean;
    onRequestClose: () => void;
    message: string;
    setFeedbackText: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: () => void;
    onClose: () => void;
};

// YesNo popup props

export type YesNoPopupProps = {
    visible: boolean;
    transparent: boolean;
    onRequestClose: () => void;
    message: string;
    onYes: () => void;
    onNo: () => void;
}

// SettingsPopup props

export type SettingsPopupProps = {
    visible: boolean;
    transparent: boolean;
    onRequestClose: () => void;
    navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
}

export type SettingsButtonData = {
  label: string;
  icon: number;
  action: () => void;
};

export type SettingsItemProps = {
  heading: string;
  data: SettingsButtonData[];
  index: number;
};

// Sessions calendar props

export type SessionsCalendarProps = {
    drinkingSessionData: DrinkingSessionData[];
    preferences: PreferencesData;
    visibleDateObject: DateObject;
    setVisibleDateObject: React.Dispatch<React.SetStateAction<DateObject>>;
    onDayPress: (day: any) => void;
}
 
export type SessionsCalendarMarkedDates = {
    [date: string]: {
        units: number;
        color: string;
        textColor?: string;
    };
};

export type DateObject = {
  dateString: string;
  day: number;
  month: number;
  timestamp: number;
  year: number;
};

export type DayState = 'selected' | 'disabled' | 'today' | '';

// Drinking session unit window props

export type DrinkingSessionUnitWindowProps = {
    unitName: string;
    iconSource: ImageSourcePropType;
    currentUnits: number;
    availableUnits: number;
    setCurrentUnits: React.Dispatch<React.SetStateAction<number>>;
};

export type SessionUnitsInputWindowProps = {
    currentUnits: number;
    availableUnits: number;
    setCurrentUnits: (newUnits: number) => void;
    styles: {
        unitsInputContainer: {};
        unitsInputButton: {};
        unitsInputText: {};
    };
}

// Loading data props

export type LoadingDataProps = {
    // loadingText: string
}