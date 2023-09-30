// DatabaseDataContext.tsx
import { createContext, useContext } from 'react';
import { CurrentSessionData, DrinkingSessionArrayItem, PreferencesData, UnconfirmedDaysData, UserData } from '../types/database';

type DatabaseDataContextType = {
  currentSessionData: CurrentSessionData | null;
  drinkingSessionData: DrinkingSessionArrayItem[];
  drinkingSessionKeys: string[];
  preferences: PreferencesData | null;
  unconfirmedDays: UnconfirmedDaysData | null;
  userData: UserData | null;
  isLoading: boolean;
};

export const DatabaseDataContext = createContext<DatabaseDataContextType | undefined>(undefined);
