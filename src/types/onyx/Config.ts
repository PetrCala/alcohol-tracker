/**
 *
 */
type AppSettings = {
  /**
   *
   */
  min_supported_version?: string;
  /**
   *
   */
  min_user_creation_possible_version?: string;
  /**
   *
   */
  latest_version?: string;
};

/**
 *
 */
type Maintenance = {
  /** Whether or not a maintenance is ongoing */
  maintenance_mode: boolean;

  /** Start time of the maintenance */
  start_time?: number;

  /** End time of the maintenance */
  end_time?: number;
};

/**
 *
 */
type Config = {
  /** Application settings */
  app_settings: AppSettings;

  /** Information about the application maintenance */
  maintenance: Maintenance;

  /** A timestamp representing the last update of terms and conditions */
  terms_last_updated?: number;
};

export default Config;
export type {Maintenance, AppSettings};
