import {
  askForValue,
  confirmExecution,
  validateAndParseInputToTimestamp,
} from '../../../src/utils/utils';
import {MaintenanceProps} from '../../../src/types/database';
import admin from '../../admin';
import {askForConfirmationInProduction} from '../../utils/devEnv';

/** Schedule maintenance by updating the maintenance configuration in the
 * database. Connect through an admin SDK to the database flavor that is
 * defined in the .env file under the APP_ENVIRONMENT property.
 *
 * Determine the maintenance start/end date dynamically by asking the user.
 *
 * Also ask the user for confirmation in production environment.
 */
export async function scheduleMaintenance(): Promise<void> {
  await askForConfirmationInProduction(); // Exit the script run upon production run user deny

  console.log(
    'You are about to schedule maintenance for the database. Please provide the following information:',
  );
  const startTimeString = await askForValue(
    'Maintenance start time (YYYY-MM-DD HH:MM):\n',
  );
  const endTimeString = await askForValue(
    'Maintenance end time (YYYY-MM-DD HH:MM):\n',
  );

  const executionPermitted = await confirmExecution(
    `Are you sure you want to schedule the maintenance from ${startTimeString} to ${endTimeString}? (y/n) `,
  );
  if (!executionPermitted) {
    console.log('Script run cancelled.');
    process.exit(0);
  }

  console.log(`Scheduling maintenance...`);

  const maintenanceStartTime =
    validateAndParseInputToTimestamp(startTimeString);
  const maintenanceEndTime = validateAndParseInputToTimestamp(endTimeString);

  if (maintenanceStartTime > maintenanceEndTime) {
    console.error(
      'Maintenance start time cannot be after maintenance end time.',
    );
    process.exit(1);
  }

  const dbRef = admin.database().ref('config/maintenance');
  const maintenanceData: MaintenanceProps = {
    maintenance_mode: true,
    start_time: maintenanceStartTime,
    end_time: maintenanceEndTime,
  };
  await dbRef.set(maintenanceData);

  admin.app().delete(); // Cleanup
  console.log('Done.');
}

/** Cancel the maintenance by updating the maintenance configuration in the
 * database. Connect through an admin SDK to the database flavor that is
 * defined in the .env file under the APP_ENVIRONMENT property.
 *
 * Ask the user for confirmation in production environment.
 */
export async function cancelMaintenance(): Promise<void> {
  await askForConfirmationInProduction();

  const executionPermitted = await confirmExecution(
    'Are you sure you want to cancel the maintenance? (y/n) ',
  );
  if (!executionPermitted) {
    console.log('Script run cancelled.');
    process.exit(0);
  }

  console.log('Cancelling maintenance...');
  const dbRef = admin.database().ref('config/maintenance');
  const maintenanceCanceledData: MaintenanceProps = {
    maintenance_mode: false,
    start_time: Date.now(),
    end_time: Date.now(),
  };
  await dbRef.set(maintenanceCanceledData);

  admin.app().delete(); // Cleanup
  console.log('Done.');
}
