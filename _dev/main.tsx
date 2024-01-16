// Run the script using ts-node _dev/database/migration.tsx (install globally through npm install -g ts-node)

require('dotenv').config(); // for the process.env variables to read the .env file
import migrate_020_030 from './database/migration-scripts/0.2.0-0.3.0/migrateMain';
import {confirmExecution} from '../src/utils/utils';
import {isProdEnv} from './utils/devEnv';

// const adminDb = admin.database();

(async () => {
  if (isProdEnv) {
    const executionPermitted = await confirmExecution(
      'Are you sure you want to run this script in the production environment? (y/n) ',
    );
    if (!executionPermitted) {
      console.log('Script run cancelled.');
      process.exit(0);
    }
  }
  await main();
})();

async function main() {
  try {
    console.log('Migrating the database...');
    // migrate_020_030(mainEnv);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    process.exit(0);
  }
}
