import type {Maintenance} from '@src/types/onyx';

/** Determine whether the app is under maintenance. */
function checkIfUnderMaintenance(
  maintenance: Maintenance | null | undefined,
): boolean {
  if (!maintenance?.maintenance_mode) {
    return false;
  }

  if (maintenance.end_time && maintenance.end_time < Date.now()) {
    return false;
  }

  if (maintenance.start_time && maintenance.start_time > Date.now()) {
    return false;
  }

  return !!maintenance.maintenance_mode;
}

export {checkIfUnderMaintenance};
