import { ImageSourcePropType } from "react-native";
import { DrinkingSessionData, PreferencesData } from "./database";

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
    setCurrentUnits: React.Dispatch<React.SetStateAction<number>>;
};

// Loading data props

export type LoadingDataProps = {
    // loadingText: string
}