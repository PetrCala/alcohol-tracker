import { askForValue } from '../../src/utils/utils';
import {MaintenanceProps} from '../../src/types/database';
import admin from '../admin';
import {askForConfirmationInProduction, isProdEnv} from '../utils/devEnv';

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

  const startTimeString = await askForValue('Maintenance start time:\n');
  const endTimeString = await askForValue('Maintenance end time:\n');

  // TODO - modify to clean, validate, and transform the string to date
  const maintenanceStartTime = parseInt(startTimeString);
  const maintenanceEndTime = parseInt(endTimeString);

  console.log(`Scheduling maintenance from ${maintenanceStartTime} to ${maintenanceEndTime}`);
//   const dbRef = admin.database().ref('config/maintenance');
//   const maintenanceData: MaintenanceProps = {
//     maintenance_mode: true,
//     start_time: maintenanceStartTime,
//     end_time: maintenanceEndTime,
//   };
//   await dbRef.set(maintenanceData);

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

scheduleMaintenance();
