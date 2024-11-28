type AppSettings = {
  min_supported_version?: string;
  min_user_creation_possible_version?: string;
  latest_version?: string;
};

type Maintenance = {
  maintenance_mode: boolean;
  start_time: number;
  end_time: number;
};

type Config = {
  app_settings: AppSettings;
  maintenance: Maintenance;
};

export default Config;
export type {Maintenance, AppSettings};
