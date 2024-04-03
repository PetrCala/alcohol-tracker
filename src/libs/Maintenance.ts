import type {Maintenance} from '@src/types/database';

/** Determine whether the app is under maintenance. */
function isUnderMaintenance(
  maintenance: Maintenance | null | undefined,
): boolean {
  if (!maintenance || maintenance.maintenance_mode) {
    return false;
  }

  return (
    maintenance.start_time <= Date.now() && maintenance.end_time >= Date.now()
  );
}

export {isUnderMaintenance};
