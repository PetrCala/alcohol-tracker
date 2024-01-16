import admin from '../admin';
import {askForConfirmationInProduction, isProdEnv} from '../utils/devEnv';

export async function scheduleMaintenance(): Promise<void> {
  await askForConfirmationInProduction(); // Exits the script run upon production run user deny
  console.log('Running maintenance script...');
  //   const dbRef = admin.database().ref('config/maintenance');
  //   const maintenanceData: MaintenanceProps = {
  //       maintenance_mode: true,
  //       start_time: Date.now(),
  //       end_time: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  //   };
  //   await dbRef.set(maintenanceData);
  admin.app().delete(); // Cleanup
  console.log('Done.'); // Set maintenance from... to ...
}

export async function cancelMaintenance(): Promise<void> {
  await askForConfirmationInProduction();
  console.log('Running maintenance script...');
}

scheduleMaintenance();
