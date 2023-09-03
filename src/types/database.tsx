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
  current_units: UnitTypesProps;
  in_session: boolean;
  last_session_started: number;
  last_unit_added: number;
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

export type UnitTypesProps = Record<typeof UnitTypesKeys[number], number>;

export type DrinkingSessionData = {
  end_time: number;
  last_unit_added_time: number;
  session_id: string;
  start_time: number;
  units: UnitTypesProps;
};

export type UnitsToColorsData = {
  yellow: number;
  orange: number;
}

export type PreferencesData = {
  first_day_of_week: string;
  units_to_colors: UnitsToColorsData;
}

export type UnconfirmedDaysData = {
  date_string: string;
}

export type UserData = {
  role: string;
  last_online: number;
  connections?: {connection_id: string}; // Connection instances
  beta_key_id?: string;
}

// Used when rendering drinking session day overview
export type DrinkingSessionProps = {
  session: DrinkingSessionData
};

