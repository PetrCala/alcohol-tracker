import {MaintenanceProps} from '../../src/types/database';
import {confirmExecution} from '../../src/utils/utils';
import admin from '../admin';
import {isProdEnv} from '../utils/devEnv';

export async function scheduleMaintenance(): Promise<void> {
  if (isProdEnv) {
    const executionPermitted = await confirmExecution(
      'Are you sure you want to schedule maintenance in the production environment? (y/n) ',
    );
    if (!executionPermitted) {
      console.log('Script run cancelled.');
      process.exit(0);
    }
  }
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

scheduleMaintenance();
