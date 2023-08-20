/** Main database props object */
export type DatabaseProps = {
  user_current_session: {
    [user_id: string]: CurrentSessionData
  },
  user_drinking_sessions: {
    [user_id: string]: DrinkingSessionData
  },
  user_unconfirmed_days: {
    [user_id: string]: UnconfirmedDaysData
  },
  users: {
    [user_id: string] : UserData
  }
};

export type CurrentSessionData = {
  current_units: UnitTypesProps;
  in_session: boolean;
  last_session_started: number;
  last_unit_added: number;
};

export type UnitTypesProps = {
  beer: number
  cocktail: number
  other: number
  strong_shot: number
  weak_shot: number
  wine: number
};

export type DrinkingSessionData = {
  end_time: number;
  last_unit_added_time: number;
  session_id: string;
  start_time: number;
  units: UnitTypesProps;
};

export type UnconfirmedDaysData = {
  dateString: string;
}

export type UserData = {
  role: string;
}

// Used when rendering drinking session day overview
export type DrinkingSessionProps = {
  session: DrinkingSessionData
};


