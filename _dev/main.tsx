// Run the script using ts-node _dev/database/migration.tsx (install globally through npm install -g ts-node)

require('dotenv').config(); // for the process.env variables to read the .env file
import { createAuthUsers } from './auth/authUtils';
import migrate_020_030 from './database/migration-scripts/0.2.0-0.3.0/migrateMain';
import {askForConfirmationInProduction, isProdEnv} from './utils/devEnv';

// const adminDb = admin.database();

(async () => {
  await askForConfirmationInProduction(); // Exits the script run upon production run user deny
  await main();
})();

async function main() {
  try {
    console.log('Creating mock auth users in the emulator...');
    await createAuthUsers();
    console.log("Done.")
    // migrate_020_030(mainEnv);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    process.exit(0);
  }
}
