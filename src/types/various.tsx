import { DrinkingSessionData } from "./database";

// Sessions calendar props

export type SessionsCalendarProps = {
    drinkingSessionData: DrinkingSessionData[];
    onDayPress: (day: any) => void;
}
 
export type SessionsCalendarMarkedDates = {
    [date: string]: {
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

// Loading data props

export type LoadingDataProps = {
    loadingText: string
}