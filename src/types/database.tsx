export type UserDataProps = {
  current_timestamp: number;
  current_units: number;
  in_session: boolean;
};

export type DrinkingSessionData = {
  session_id: string;
  timestamp: number;
  units: number;
}

export type DrinkingSessionProps = {
    session: DrinkingSessionData
    sessionColor: string
}

