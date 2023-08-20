export type DatabaseProps = {

};

export type UnitTypesProps = {
  beer: number
  cocktail: number
  other: number
  strong_shot: number
  weak_shot: number
  wine: number
};

export type UserCurrentSessionData = {
  current_units: UnitTypesProps;
  in_session: boolean;
  last_session_started: number;
  last_unit_added: number;
};

export type DrinkingSessionData = {
  end_time: number;
  last_unit_added_time: number;
  session_id: string;
  start_time: number;
  units: UnitTypesProps;
};

// Used when rendering drinking session day overview
export type DrinkingSessionProps = {
  session: DrinkingSessionData
};


