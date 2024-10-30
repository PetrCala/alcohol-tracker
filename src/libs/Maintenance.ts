import type {Maintenance} from '@src/types/onyx';

/** Determine whether the app is under maintenance. */
function checkIfUnderMaintenance(
  maintenance: Maintenance | null | undefined,
): boolean {
  if (!maintenance || maintenance.maintenance_mode) {
    return false;
  }

  return (
    maintenance.start_time <= Date.now() && maintenance.end_time >= Date.now()
  );
}

export {checkIfUnderMaintenance};
