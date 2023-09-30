/** Main database props object */
export type DatabaseProps = {
  config: ConfigProps,
  feedback: FeedbackData,
  user_current_session: {
    [user_id: string]: CurrentSessionData
  },
  user_drinking_sessions: {
    [user_id: string]: DrinkingSessionData
  },
  user_preferences: {
    [user_id: string]: PreferencesData
  },
  user_unconfirmed_days: {
    [user_id: string]: UnconfirmedDaysData
  },
  users: {
    [user_id: string] : UserData
  }
};

export type ConfigProps = {
  app_settings: AppSettings;
};

export type AppSettings = {
  min_supported_version: string;
  min_user_creation_possible_version: string;
}

export type FeedbackProps = {
  submit_time: number;
  text: string;
  user_id: string;
}

export type FeedbackData = {
  [feedback_id: string]: FeedbackProps
}

export type CurrentSessionData = {
  current_session_id: string | null;
};

export type DrinkingSessionData = {
  [session_id: string]: {
    start_time: number;
    end_time: number;
    units: UnitsObject;
    blackout: boolean;
    note: string;
    ongoing?: boolean | null;
  };
};

/** Type for drinking session data when stored as an array */
export type DrinkingSessionArrayItem = Omit<DrinkingSessionData[string], 'session_id'>;

export type UnitsObject = {
  [timestamp: number]: UnitTypesProps;
};

/** An array that represents all available alcohol units
 * 
 * Used to construct UnitTypesProps where the expected values of all
 * these keys are set to numbers - main storage of units in the db
 * 
 */
export const UnitTypesKeys = [
  'beer', 
  'cocktail', 
  'other', 
  'strong_shot',
  'weak_shot',
  'wine'
] as const;  // Infer a readonly tuple

export const UnitTypesNames = [
  'Beer', 
  'Cocktail', 
  'Other', 
  'Strong Shot',
  'Weak Shot',
  'Wine'
] as const; // Should always match the UnitTypesKeys

export type UnitTypesProps = Partial<Record<typeof UnitTypesKeys[number], number>>;

export type UnitsToColorsData = {
  yellow: number;
  orange: number;
}

export type PreferencesData = {
  first_day_of_week: string;
  units_to_colors: UnitsToColorsData;
  units_to_points: UnitTypesProps;
}

export type UnconfirmedDaysData = {
  [day_string: string]: boolean,
}

export type UserData = {
  profile: ProfileData;
  friends: FriendsData;
  role: string;
  last_online: number;
  beta_key_id: string;
} | {}

export type ProfileData = {
  display_name: string,
  photo_url: string,
}

export type FriendsData = {
  [friend_id: string]: boolean
}

// Used when rendering drinking session day overview
export type DrinkingSessionProps = {
  sessionKey: string,
  session: DrinkingSessionArrayItem
};

