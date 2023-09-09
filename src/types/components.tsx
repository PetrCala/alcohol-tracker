import { ImageSourcePropType } from "react-native";
import { DrinkingSessionArrayItem, DrinkingSessionData, FeedbackData, PreferencesData, UnitTypesKeys, UnitsObject, UserData } from "./database";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "./screens";

// FeedbackPopup props

export type FeedbackPopupProps = {
    visible: boolean;
    transparent: boolean;
    message: string;
    onRequestClose: () => void;
    onSubmit: (feedback: string) => void;
};

// YesNo popup props

export type YesNoPopupProps = {
    visible: boolean;
    transparent: boolean;
    message: string;
    onRequestClose: () => void;
    onYes: () => void;
}

// SettingsPopup props

export type SettingsPopupProps = {
    visible: boolean;
    transparent: boolean;
    onRequestClose: () => void;
    navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
    userData: UserData;
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

// Reauthentificate popup props

export type ReauthentificatePopupProps = {
    visible: boolean;
    transparent: boolean;
    message: string;
    confirmationMessage: string;
    onRequestClose: () => void;
    onSubmit: (password: string) => void;
};

// AdminFeedbackModal props
export type AdminFeedbackPopupProps = {
    visible: boolean;
    transparent: boolean;
    onRequestClose: () => void;
    feedbackData: FeedbackData;
};

// Sessions calendar props

export type SessionsCalendarProps = {
    drinkingSessionData: DrinkingSessionArrayItem[];
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
    unitKey: typeof UnitTypesKeys[number]; // Non-verbose
    iconSource: ImageSourcePropType;
    currentUnits: UnitsObject;
    setCurrentUnits: React.Dispatch<React.SetStateAction<UnitsObject>>;
    availableUnits: number;
    typeSum: number,
    setTypeSum: React.Dispatch<React.SetStateAction<number>>;
};

export type SessionUnitsInputWindowProps = {
    unitKey: typeof UnitTypesKeys[number];
    currentUnits: UnitsObject;
    setCurrentUnits: (newUnits: UnitsObject) => void;
    availableUnits: number;
    typeSum: number,
    setTypeSum: React.Dispatch<React.SetStateAction<number>>;
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